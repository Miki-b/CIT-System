"use client";

import {
  CheckCircle2,
  Circle,
  MapPin,
  Package,
  PackageCheck,
  Truck,
  Flag,
  Navigation,
  PlusCircle,
} from "lucide-react";
import type { EventDTO } from "@/lib/serialize";
import { formatTime } from "@/lib/format";

const ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  CREATED: PlusCircle,
  ASSIGNED: CheckCircle2,
  AT_PICKUP: MapPin,
  PICKED_UP: Package,
  IN_TRANSIT: Truck,
  NEAR_DESTINATION: Navigation,
  DELIVERED: Flag,
  LOCATION: Navigation,
  INFO: Circle,
};

const ICON_COLOR: Record<string, string> = {
  CREATED: "text-ink-500 bg-ink-100",
  ASSIGNED: "text-indigo-600 bg-indigo-50",
  AT_PICKUP: "text-amber-600 bg-amber-50",
  PICKED_UP: "text-amber-600 bg-amber-50",
  IN_TRANSIT: "text-brand-600 bg-brand-50",
  NEAR_DESTINATION: "text-violet-600 bg-violet-50",
  DELIVERED: "text-emerald-600 bg-emerald-50",
  LOCATION: "text-brand-600 bg-brand-50",
  INFO: "text-ink-500 bg-ink-100",
};

export function Timeline({ events }: { events: EventDTO[] }) {
  const ordered = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (ordered.length === 0) {
    return (
      <p className="text-sm text-ink-500">No events recorded yet.</p>
    );
  }

  return (
    <ol className="relative space-y-1">
      {ordered.map((e, i) => {
        const Icon = ICON[e.type] ?? PackageCheck;
        const color = ICON_COLOR[e.type] ?? "text-ink-500 bg-ink-100";
        const isLatest = i === 0;
        return (
          <li key={e.id} className="flex gap-3.5 animate-fade-in">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} ${
                  isLatest ? "ring-4 ring-brand-100" : ""
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              {i < ordered.length - 1 && (
                <span className="w-px flex-1 bg-ink-200 my-1" />
              )}
            </div>
            <div className="pb-5 pt-1.5">
              <p className="text-sm font-medium text-ink-900 leading-tight">
                {e.message}
              </p>
              <p className="mt-0.5 text-xs text-ink-500">
                {formatTime(e.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
