"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { DeliveryDTO } from "@/lib/serialize";
import { useGlobalStream } from "./useGlobalStream";
import { PageHeader, LiveDot } from "./AdminShell";
import { DeliveriesTable } from "./DeliveriesTable";
import { isAtOrAfterStatus } from "@/lib/domain";

type Filter = "ALL" | "ACTIVE" | "IN_TRANSIT" | "AWAITING" | "DELIVERED";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "AWAITING", label: "Awaiting Pickup" },
  { key: "DELIVERED", label: "Completed" },
];

export function DeliveriesList({
  initialDeliveries,
}: {
  initialDeliveries: DeliveryDTO[];
}) {
  const { deliveries, connected } = useGlobalStream(initialDeliveries);
  const [filter, setFilter] = useState<Filter>("ALL");

  const filtered = deliveries.filter((d) => {
    switch (filter) {
      case "ACTIVE":
        return d.status !== "DELIVERED";
      case "IN_TRANSIT":
        return d.status === "IN_TRANSIT" || d.status === "NEAR_DESTINATION";
      case "AWAITING":
        return !isAtOrAfterStatus(d.status, "PICKED_UP");
      case "DELIVERED":
        return d.status === "DELIVERED";
      default:
        return true;
    }
  });

  const countFor = (key: Filter) =>
    deliveries.filter((d) => {
      switch (key) {
        case "ACTIVE":
          return d.status !== "DELIVERED";
        case "IN_TRANSIT":
          return d.status === "IN_TRANSIT" || d.status === "NEAR_DESTINATION";
        case "AWAITING":
          return !isAtOrAfterStatus(d.status, "PICKED_UP");
        case "DELIVERED":
          return d.status === "DELIVERED";
        default:
          return true;
      }
    }).length;

  return (
    <div>
      <PageHeader
        title="Deliveries"
        subtitle="Every consignment across the network."
        actions={
          <>
            <LiveDot connected={connected} />
            <Link href="/admin/deliveries/new" className="btn-primary">
              <Plus className="h-4 w-4" />
              Create Delivery
            </Link>
          </>
        }
      />

      {/* Filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === f.key
                ? "bg-brand-600 text-white"
                : "bg-white text-ink-600 ring-1 ring-inset ring-ink-200 hover:bg-ink-50",
            ].join(" ")}
          >
            {f.label}
            <span
              className={`rounded-full px-1.5 text-xs ${
                filter === f.key ? "bg-white/20" : "bg-ink-100 text-ink-500"
              }`}
            >
              {countFor(f.key)}
            </span>
          </button>
        ))}
      </div>

      <DeliveriesTable deliveries={filtered} />
    </div>
  );
}
