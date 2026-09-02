"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Flag, Clock } from "lucide-react";
import type { DeliveryDTO } from "@/lib/serialize";
import { StatusBadge, PriorityBadge } from "./Badges";
import { formatEta, relativeTime } from "@/lib/format";

export function DeliveriesTable({ deliveries }: { deliveries: DeliveryDTO[] }) {
  if (deliveries.length === 0) {
    return (
      <div className="card p-10 text-center text-sm text-ink-500">
        No deliveries yet. Create one to get started.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="card hidden overflow-hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">CIT ID</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">ETA</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {deliveries.map((d) => (
              <tr key={d.id} className="hover:bg-ink-50/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/deliveries/${d.trackingCode}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {d.trackingCode}
                  </Link>
                  <div className="mt-1">
                    <PriorityBadge priority={d.priority} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink-900">{d.client.name}</div>
                  <div className="text-xs text-ink-500">{d.client.company}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-ink-600">
                    <MapPin className="h-3.5 w-3.5 text-amber-500" />
                    <span className="max-w-[140px] truncate">{d.pickup.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-600">
                    <Flag className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="max-w-[140px] truncate">
                      {d.destination.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-700">
                  {d.driver ? d.driver.name : <span className="text-ink-400">Unassigned</span>}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={d.status} pulse />
                </td>
                <td className="px-4 py-3 text-ink-700">
                  {d.status === "DELIVERED" ? (
                    <span className="text-emerald-600 font-medium">Completed</span>
                  ) : (
                    formatEta(d.etaMinutes)
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-ink-500">
                  {relativeTime(d.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/deliveries/${d.trackingCode}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
                  >
                    View <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {deliveries.map((d) => (
          <Link
            key={d.id}
            href={`/admin/deliveries/${d.trackingCode}`}
            className="card block p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-700">{d.trackingCode}</span>
              <StatusBadge status={d.status} pulse />
            </div>
            <div className="mt-2 text-sm font-medium text-ink-900">
              {d.client.name}
            </div>
            <div className="mt-2 space-y-1 text-xs text-ink-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-500" /> {d.pickup.name}
              </div>
              <div className="flex items-center gap-1.5">
                <Flag className="h-3.5 w-3.5 text-emerald-500" /> {d.destination.name}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
              <span>{d.driver ? d.driver.name : "Unassigned"}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {d.status === "DELIVERED" ? "Completed" : formatEta(d.etaMinutes)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
