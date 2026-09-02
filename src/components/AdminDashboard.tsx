"use client";

import Link from "next/link";
import {
  Truck,
  PackageSearch,
  CheckCircle2,
  Users,
  Plus,
  Activity,
  ArrowRight,
} from "lucide-react";
import type { DeliveryDTO } from "@/lib/serialize";
import { useGlobalStream } from "./useGlobalStream";
import { PageHeader, LiveDot } from "./AdminShell";
import { DeliveriesTable } from "./DeliveriesTable";
import { isAtOrAfterStatus } from "@/lib/domain";

interface Props {
  initialDeliveries: DeliveryDTO[];
  driverStats: { total: number; available: number; onDelivery: number };
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-500">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <span className="text-3xl font-bold tracking-tight text-ink-900">{value}</span>
    </div>
  );
}

export function AdminDashboard({ initialDeliveries, driverStats }: Props) {
  const { deliveries, connected } = useGlobalStream(initialDeliveries);

  const active = deliveries.filter((d) => d.status !== "DELIVERED");
  const inTransit = deliveries.filter(
    (d) => d.status === "IN_TRANSIT" || d.status === "NEAR_DESTINATION"
  );
  const awaitingPickup = deliveries.filter(
    (d) => !isAtOrAfterStatus(d.status, "PICKED_UP")
  );
  const completed = deliveries.filter((d) => d.status === "DELIVERED");
  const recent = [...deliveries].slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Dispatch Overview"
        subtitle="Live status of every cash-in-transit consignment."
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          icon={Activity}
          label="Active deliveries"
          value={active.length}
          tone="bg-brand-50 text-brand-600"
        />
        <StatCard
          icon={Truck}
          label="In transit"
          value={inTransit.length}
          tone="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={PackageSearch}
          label="Awaiting pickup"
          value={awaitingPickup.length}
          tone="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={completed.length}
          tone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={Users}
          label="Drivers available"
          value={driverStats.available}
          tone="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Active deliveries highlight */}
      {inTransit.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
            Live now
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inTransit.map((d) => (
              <Link
                key={d.id}
                href={`/admin/deliveries/${d.trackingCode}`}
                className="card group p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-700">
                    {d.trackingCode}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-brand-600">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                    </span>
                    {d.etaMinutes != null ? `${d.etaMinutes} min` : "en route"}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-ink-900">
                  {d.client.name}
                </p>
                <p className="text-xs text-ink-500">
                  {d.pickup.name} → {d.destination.name}
                </p>
                {/* progress bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-1000"
                    style={{ width: `${Math.round(d.progress * 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
                  <span>{d.driver?.name ?? "Unassigned"}</span>
                  <span className="inline-flex items-center gap-1 text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent deliveries */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            Recent deliveries
          </h2>
          <Link
            href="/admin/deliveries"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            View all
          </Link>
        </div>
        <DeliveriesTable deliveries={recent} />
      </div>
    </div>
  );
}
