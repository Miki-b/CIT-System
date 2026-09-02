"use client";

import { Check } from "lucide-react";
import {
  DeliveryStatus,
  STATUS_MILESTONES,
  STATUS_ORDER,
} from "@/lib/domain";

/**
 * Vertical milestone rail shown on the client tracking page.
 * Completed steps get a check, the current step pulses, future steps are muted.
 */
export function StatusRail({ status }: { status: DeliveryStatus }) {
  const currentOrder = STATUS_ORDER[status];

  return (
    <ol className="space-y-0">
      {STATUS_MILESTONES.map((m, i) => {
        const order = STATUS_ORDER[m.status];
        const done = currentOrder > order || status === "DELIVERED";
        const active = currentOrder === order && status !== "DELIVERED";
        const isLast = i === STATUS_MILESTONES.length - 1;
        const activeDelivered = m.status === "DELIVERED" && status === "DELIVERED";

        return (
          <li key={m.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done || activeDelivered
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-brand-600 text-white ring-4 ring-brand-100"
                      : "bg-ink-100 text-ink-400",
                ].join(" ")}
              >
                {done || activeDelivered ? (
                  <Check className="h-4 w-4" />
                ) : active ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                  </span>
                ) : (
                  i + 1
                )}
              </span>
              {!isLast && (
                <span
                  className={`w-0.5 flex-1 min-h-[28px] ${
                    done ? "bg-emerald-400" : "bg-ink-200"
                  }`}
                />
              )}
            </div>
            <div className={`pb-6 pt-0.5 ${active ? "" : ""}`}>
              <p
                className={[
                  "text-sm font-semibold leading-tight",
                  done || activeDelivered
                    ? "text-ink-900"
                    : active
                      ? "text-brand-700"
                      : "text-ink-400",
                ].join(" ")}
              >
                {m.title}
              </p>
              {active && (
                <p className="mt-0.5 text-xs font-medium text-brand-600">
                  In progress
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
