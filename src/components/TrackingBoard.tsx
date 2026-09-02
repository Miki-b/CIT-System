"use client";

import Link from "next/link";
import { ExternalLink, Radar } from "lucide-react";
import type { DeliveryDTO } from "@/lib/serialize";
import { useGlobalStream } from "./useGlobalStream";
import { PageHeader, LiveDot } from "./AdminShell";
import { StatusBadge } from "./Badges";
import { DeliveryMap } from "./DeliveryMap";
import { formatEta } from "@/lib/format";

export function TrackingBoard({
  initialDeliveries,
}: {
  initialDeliveries: DeliveryDTO[];
}) {
  const { deliveries, connected } = useGlobalStream(initialDeliveries);
  const active = deliveries.filter((d) => d.status !== "DELIVERED");

  return (
    <div>
      <PageHeader
        title="Live Tracking"
        subtitle="All in-progress consignments on one board."
        actions={<LiveDot connected={connected} />}
      />

      {active.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <Radar className="h-8 w-8 text-ink-300" />
          <p className="text-sm text-ink-500">
            No active deliveries right now. Create one or start a simulation.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {active.map((d) => (
            <div key={d.id} className="card overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
                <div>
                  <Link
                    href={`/admin/deliveries/${d.trackingCode}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {d.trackingCode}
                  </Link>
                  <p className="text-xs text-ink-500">{d.client.name}</p>
                </div>
                <StatusBadge status={d.status} pulse />
              </div>
              <DeliveryMap
                pickup={d.pickup}
                destination={d.destination}
                current={d.current}
                status={d.status}
                progress={d.progress}
                className="h-56 w-full"
              />
              <div className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-ink-600">
                  {d.driver?.name ?? "Unassigned"} •{" "}
                  {d.status === "DELIVERED" ? "Completed" : formatEta(d.etaMinutes)}
                </span>
                <Link
                  href={`/track/${d.trackingCode}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
                >
                  Client view <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
