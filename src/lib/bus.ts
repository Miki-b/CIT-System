/**
 * Tiny in-memory pub/sub used to power Server-Sent Events.
 *
 * For a local single-process prototype this is perfectly reliable: the Next.js
 * dev/prod server runs in one Node process, so every SSE connection and the
 * simulation engine share the same bus instance. Stored on globalThis so it
 * survives hot-module reloads during development.
 */

export type Subscriber = (payload: string) => void;

interface Bus {
  channels: Map<string, Set<Subscriber>>;
}

const globalForBus = globalThis as unknown as { __citBus?: Bus };

const bus: Bus =
  globalForBus.__citBus ?? (globalForBus.__citBus = { channels: new Map() });

/** The global channel every delivery update is also broadcast to. */
export const GLOBAL_CHANNEL = "all";

export function deliveryChannel(trackingCode: string): string {
  return `delivery:${trackingCode}`;
}

export function subscribe(channel: string, cb: Subscriber): () => void {
  let set = bus.channels.get(channel);
  if (!set) {
    set = new Set();
    bus.channels.set(channel, set);
  }
  set.add(cb);
  return () => {
    set?.delete(cb);
    if (set && set.size === 0) bus.channels.delete(channel);
  };
}

export function publish(channel: string, data: unknown): void {
  const set = bus.channels.get(channel);
  if (!set || set.size === 0) return;
  const payload = JSON.stringify(data);
  for (const cb of set) {
    try {
      cb(payload);
    } catch {
      /* ignore broken pipe on a single subscriber */
    }
  }
}

/** Broadcast a delivery snapshot to both its own channel and the global feed. */
export function broadcastDelivery(trackingCode: string, snapshot: unknown): void {
  const message = { kind: "delivery", data: snapshot };
  publish(deliveryChannel(trackingCode), message);
  publish(GLOBAL_CHANNEL, message);
}
