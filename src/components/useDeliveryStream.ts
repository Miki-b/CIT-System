"use client";

import { useEffect, useRef, useState } from "react";
import type { DeliveryDTO } from "@/lib/serialize";

interface StreamState {
  delivery: DeliveryDTO | null;
  connected: boolean;
  lastUpdated: number | null;
}

/**
 * Subscribes to a single delivery's SSE feed. Falls back to polling every 3s
 * if the EventSource errors out, so the demo never silently stalls.
 */
export function useDeliveryStream(
  trackingCode: string,
  initial: DeliveryDTO | null = null
): StreamState {
  const [delivery, setDelivery] = useState<DeliveryDTO | null>(initial);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(
    initial ? Date.now() : null
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!trackingCode) return;
    let es: EventSource | null = null;
    let cancelled = false;

    const startPolling = () => {
      if (pollRef.current) return;
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/deliveries/${trackingCode}`, {
            cache: "no-store",
          });
          if (!res.ok) return;
          const json = await res.json();
          if (!cancelled && json.delivery) {
            setDelivery(json.delivery);
            setLastUpdated(Date.now());
          }
        } catch {
          /* ignore */
        }
      }, 3000);
    };

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    try {
      es = new EventSource(`/api/deliveries/${trackingCode}/stream`);
      es.onopen = () => {
        if (cancelled) return;
        setConnected(true);
        stopPolling();
      };
      es.onmessage = (ev) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(ev.data);
          if (msg.kind === "delivery" && msg.data) {
            setDelivery(msg.data);
            setLastUpdated(Date.now());
          }
        } catch {
          /* ignore keepalive / parse issues */
        }
      };
      es.onerror = () => {
        if (cancelled) return;
        setConnected(false);
        startPolling();
      };
    } catch {
      startPolling();
    }

    return () => {
      cancelled = true;
      es?.close();
      stopPolling();
    };
  }, [trackingCode]);

  return { delivery, connected, lastUpdated };
}
