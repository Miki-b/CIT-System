"use client";

import { useEffect, useState } from "react";
import {
  Truck,
  Clock,
  MapPin,
  Flag,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Package,
} from "lucide-react";
import type { DeliveryDTO } from "@/lib/serialize";
import { useDeliveryStream } from "./useDeliveryStream";
import { DeliveryMap } from "./DeliveryMap";
import { StatusRail } from "./StatusRail";
import { Timeline } from "./Timeline";
import { StatusBadge } from "./Badges";
import { formatEta, relativeTime } from "@/lib/format";
import { STATUS_NARRATIVE } from "@/lib/domain";

export function ClientTracking({
  trackingCode,
  initial,
}: {
  trackingCode: string;
  initial: DeliveryDTO;
}) {
  const { delivery, connected, lastUpdated } = useDeliveryStream(
    trackingCode,
    initial
  );
  const d = delivery ?? initial;
  const [, force] = useState(0);

  // Refresh the "last updated" label every second.
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const delivered = d.status === "DELIVERED";
  const inTransit = d.status === "IN_TRANSIT" || d.status === "NEAR_DESTINATION";

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-50 to-ink-100">
      {/* Top bar */}
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-ink-900">CITSecure</p>
              <p className="text-[11px] text-ink-500">Delivery Tracking</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
            <span className="relative flex h-2 w-2">
              {connected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  connected ? "bg-emerald-500" : "bg-ink-300"
                }`}
              />
            </span>
            {connected ? "Live tracking" : "Reconnecting…"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-6">
        {/* Title */}
        <div className="mb-6">
          <p className="text-sm font-medium text-brand-600">Delivery Tracking</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
              {d.trackingCode}
            </h1>
            <StatusBadge status={d.status} pulse />
          </div>
          <p className="mt-1 text-ink-600">{d.client.name}</p>
        </div>

        {/* Delivered banner */}
        {delivered && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 ring-1 ring-inset ring-emerald-200 animate-fade-in">
            <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" />
            <div>
              <p className="text-base font-bold text-emerald-800">
                Delivery completed successfully
              </p>
              <p className="text-sm text-emerald-700">
                Your consignment was delivered to {d.destination.name}.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map + narrative */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live status line */}
            <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    delivered
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-brand-50 text-brand-600"
                  }`}
                >
                  {delivered ? (
                    <Package className="h-5 w-5" />
                  ) : (
                    <Truck className="h-5 w-5" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {inTransit
                      ? "Driver is currently moving toward destination"
                      : STATUS_NARRATIVE[d.status]}
                  </p>
                  <p className="text-xs text-ink-500">
                    {d.driver ? `Driver: ${d.driver.name}` : "Awaiting driver"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5 sm:gap-6">
                <div>
                  <p className="flex items-center gap-1 text-xs text-ink-400">
                    <Clock className="h-3.5 w-3.5" /> Estimated arrival
                  </p>
                  <p className="text-lg font-bold text-ink-900">
                    {delivered ? "Delivered" : formatEta(d.etaMinutes)}
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="card overflow-hidden p-0">
              <DeliveryMap
                pickup={d.pickup}
                destination={d.destination}
                current={d.current}
                status={d.status}
                progress={d.progress}
                className="h-[360px] w-full"
              />
            </div>

            {/* Route + last updated */}
            <div className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-xs text-ink-400">Pickup</p>
                  <p className="text-sm font-medium text-ink-900">
                    {d.pickup.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Flag className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-xs text-ink-400">Destination</p>
                  <p className="text-sm font-medium text-ink-900">
                    {d.destination.name}
                  </p>
                </div>
              </div>
              <div className="sm:col-span-2 flex items-center gap-1.5 border-t border-ink-100 pt-3 text-xs text-ink-400">
                <RefreshCw className="h-3.5 w-3.5" />
                Last updated:{" "}
                <span className="font-medium text-ink-600">
                  {lastUpdated
                    ? relativeTime(new Date(lastUpdated).toISOString())
                    : "Just now"}
                </span>
              </div>
            </div>
          </div>

          {/* Status rail + timeline */}
          <div className="space-y-6">
            <div className="card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">
                Delivery Status
              </h2>
              <StatusRail status={d.status} />
            </div>

            <div className="card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">
                Timeline
              </h2>
              <Timeline events={d.events} />
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-ink-400">
          Secured by CITSecure • This tracking link is safe to share with your
          team.
        </p>
      </main>
    </div>
  );
}
