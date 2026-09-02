"use client";

import { useEffect, useRef, useState } from "react";
import type { DeliveryDTO } from "@/lib/serialize";

interface GlobalStreamState {
  deliveries: DeliveryDTO[];
  connected: boolean;
  lastUpdated: number | null;
}

/**
 * Subscribes to the global delivery feed. Merges single-delivery updates into
 * the list so admin views update live. Polls as a fallback on error.
 */
export function useGlobalStream(
  initial: DeliveryDTO[] = []
): GlobalStreamState {
  const [deliveries, setDeliveries] = useState<DeliveryDTO[]>(initial);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(
    initial.length ? Date.now() : null
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    let cancelled = false;

    const mergeOne = (d: DeliveryDTO) => {
      setDeliveries((prev) => {
        const idx = prev.findIndex((x) => x.id === d.id);
        if (idx === -1) return [d, ...prev];
        const copy = [...prev];
        copy[idx] = d;
        return copy;
      });
      setLastUpdated(Date.now());
    };

    const startPolling = () => {
      if (pollRef.current) return;
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch("/api/deliveries", { cache: "no-store" });
          if (!res.ok) return;
          const json = await res.json();
          if (!cancelled && json.deliveries) {
            setDeliveries(json.deliveries);
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
      es = new EventSource("/api/stream");
      es.onopen = () => {
        if (cancelled) return;
        setConnected(true);
        stopPolling();
      };
      es.onmessage = (ev) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(ev.data);
          if (msg.kind === "snapshot" && Array.isArray(msg.data)) {
            setDeliveries(msg.data);
            setLastUpdated(Date.now());
          } else if (msg.kind === "delivery" && msg.data) {
            mergeOne(msg.data);
          }
        } catch {
          /* ignore */
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
  }, []);

  return { deliveries, connected, lastUpdated };
}
