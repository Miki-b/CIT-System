import { prisma } from "./prisma";
import { ensureDemoData } from "./demo-data";
import { addEvent, applyStatus, updateLocation } from "./deliveries";
import { interpolate, LngLat } from "./domain";

/**
 * Server-side GPS simulation engine.
 *
 * Each running simulation advances a delivery's progress from its current
 * position to 1.0, updating the DB and broadcasting over SSE on every tick.
 * Timers live on globalThis so they survive HMR and are shared across all
 * requests in the single Node process.
 */

interface SimState {
  timers: Map<string, NodeJS.Timeout>;
  milestonesFired: Map<string, Set<number>>;
}

const g = globalThis as unknown as { __citSim?: SimState };
const sim: SimState =
  g.__citSim ??
  (g.__citSim = { timers: new Map(), milestonesFired: new Map() });

const TICK_MS = 1500;
const STEP = 0.035; // ~ progresses 0 -> 1 in roughly 40s for a punchy demo

const MILESTONES: { at: number; message: string }[] = [
  { at: 0.25, message: "Leaving pickup — route underway" },
  { at: 0.5, message: "Halfway to destination" },
  { at: 0.75, message: "Approaching destination district" },
];

export function isRunning(trackingCode: string): boolean {
  return sim.timers.has(trackingCode);
}

export function runningCodes(): string[] {
  return [...sim.timers.keys()];
}

export async function stopSimulation(trackingCode: string): Promise<void> {
  const t = sim.timers.get(trackingCode);
  if (t) {
    clearInterval(t);
    sim.timers.delete(trackingCode);
  }
  sim.milestonesFired.delete(trackingCode);
}

/**
 * Start (or restart) a simulation for a delivery. Ensures the delivery is at
 * least IN_TRANSIT, then ticks progress forward until delivered.
 */
export async function startSimulation(trackingCode: string): Promise<boolean> {
  await ensureDemoData(prisma);
  const delivery = await prisma.delivery.findUnique({ where: { trackingCode } });
  if (!delivery) return false;
  if (delivery.status === "DELIVERED") return false;
  if (sim.timers.has(trackingCode)) return true; // already running

  sim.milestonesFired.set(trackingCode, new Set());

  const pickup: LngLat = {
    lat: delivery.pickupLatitude,
    lng: delivery.pickupLongitude,
  };
  const dest: LngLat = {
    lat: delivery.destinationLatitude,
    lng: delivery.destinationLongitude,
  };

  // Move the delivery into transit at its current progress point.
  const startProgress = delivery.progress > 0 && delivery.progress < 1 ? delivery.progress : 0;
  const startPos = interpolate(pickup, dest, startProgress);
  await applyStatus(trackingCode, "IN_TRANSIT", {
    eventType: "IN_TRANSIT",
    message: "Live simulation started — driver en route to destination",
    location: startPos,
    progress: startProgress,
    etaMinutes: 14,
  });

  let progress = startProgress;

  const tick = async () => {
    try {
      progress = Math.min(1, progress + STEP);

      // Fire midway milestones once each.
      const fired = sim.milestonesFired.get(trackingCode)!;
      for (const m of MILESTONES) {
        if (progress >= m.at && !fired.has(m.at)) {
          fired.add(m.at);
          const pos = interpolate(pickup, dest, m.at);
          await addEvent(delivery.id, "LOCATION", m.message, pos);
        }
      }

      if (progress >= 0.8 && progress < 1) {
        const current = await prisma.delivery.findUnique({
          where: { trackingCode },
          select: { status: true },
        });
        if (current && current.status !== "NEAR_DESTINATION") {
          await applyStatus(trackingCode, "NEAR_DESTINATION", {
            eventType: "NEAR_DESTINATION",
            message: "Driver is near the destination",
            location: interpolate(pickup, dest, progress),
            progress,
            etaMinutes: 3,
          });
          return;
        }
      }

      if (progress >= 1) {
        await stopSimulation(trackingCode);
        await applyStatus(trackingCode, "DELIVERED", {
          eventType: "DELIVERED",
          message: "Delivery completed successfully",
          location: dest,
          progress: 1,
          etaMinutes: null,
        });
        return;
      }

      await updateLocation(trackingCode, progress);
    } catch (err) {
      console.error(`[sim] tick error for ${trackingCode}`, err);
      await stopSimulation(trackingCode);
    }
  };

  const timer = setInterval(tick, TICK_MS);
  sim.timers.set(trackingCode, timer);
  return true;
}
