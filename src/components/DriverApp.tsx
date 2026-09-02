"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  MapPin,
  Flag,
  Building2,
  Play,
  Square,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Navigation,
  Home,
} from "lucide-react";
import type { DeliveryDTO } from "@/lib/serialize";
import { useDeliveryStream } from "./useDeliveryStream";
import { StatusBadge, PriorityBadge } from "./Badges";
import { DeliveryMap } from "./DeliveryMap";
import { Brand } from "./Brand";
import { nextDriverAction, STATUS_NARRATIVE } from "@/lib/domain";
import { formatEta } from "@/lib/format";

export function DriverApp({ assignments }: { assignments: DeliveryDTO[] }) {
  const [selectedCode, setSelectedCode] = useState(
    assignments[0]?.trackingCode ?? ""
  );

  if (assignments.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-100 p-6">
        <div className="card max-w-sm p-8 text-center">
          <Truck className="mx-auto h-10 w-10 text-ink-300" />
          <h1 className="mt-4 text-lg font-semibold text-ink-900">
            No assignments
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            You have no deliveries assigned right now.
          </p>
          <Link href="/" className="btn-secondary mt-5">
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DriverAppInner
      key={selectedCode}
      assignments={assignments}
      selectedCode={selectedCode}
      onSelect={setSelectedCode}
    />
  );
}

function DriverAppInner({
  assignments,
  selectedCode,
  onSelect,
}: {
  assignments: DeliveryDTO[];
  selectedCode: string;
  onSelect: (code: string) => void;
}) {
  const initial =
    assignments.find((a) => a.trackingCode === selectedCode) ?? assignments[0];
  const { delivery, connected } = useDeliveryStream(selectedCode, initial);
  const d = delivery ?? initial;

  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);

  // Check whether a simulation is currently running for this delivery.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/deliveries/${selectedCode}/simulate`)
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setRunning(!!j.simulating);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedCode]);

  useEffect(() => {
    if (d.status === "DELIVERED") setRunning(false);
  }, [d.status]);

  const action = nextDriverAction(d.status);

  async function doAction() {
    if (!action) return;
    setBusy(true);
    try {
      await fetch(`/api/deliveries/${selectedCode}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action.action }),
      });
    } finally {
      setBusy(false);
    }
  }

  async function toggleSim() {
    setBusy(true);
    try {
      const res = await fetch(`/api/deliveries/${selectedCode}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: running ? "stop" : "start" }),
      });
      const j = await res.json();
      setRunning(!!j.simulating);
    } finally {
      setBusy(false);
    }
  }

  const progressPct = Math.round(d.progress * 100);
  const inTransit = d.status === "IN_TRANSIT" || d.status === "NEAR_DESTINATION";

  return (
    <div className="min-h-screen bg-ink-100">
      <div className="mx-auto max-w-md bg-ink-50 min-h-screen shadow-xl">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3">
          <Brand compact />
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
            Driver App
          </span>
        </header>

        <div className="space-y-4 p-4">
          {/* Assignment switcher */}
          {assignments.length > 1 && (
            <select
              className="input"
              value={selectedCode}
              onChange={(e) => onSelect(e.target.value)}
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.trackingCode}>
                  {a.trackingCode} — {a.driver?.name}
                </option>
              ))}
            </select>
          )}

          {/* Current assignment card */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  Current assignment
                </p>
                <h1 className="text-2xl font-bold text-ink-900">
                  {d.trackingCode}
                </h1>
              </div>
              <StatusBadge status={d.status} pulse />
            </div>

            <div className="mt-4 space-y-3">
              <Row icon={MapPin} tone="text-amber-500" label="Pickup" value={d.pickup.name} />
              <Row icon={Flag} tone="text-emerald-500" label="Destination" value={d.destination.name} />
              <Row icon={Building2} tone="text-ink-400" label="Client" value={d.client.name} />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <PriorityBadge priority={d.priority} />
              <span className="text-xs text-ink-500">
                {d.status === "DELIVERED"
                  ? "Delivered"
                  : `ETA ${formatEta(d.etaMinutes)}`}
              </span>
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
              className="h-52 w-full"
            />
            {inTransit && (
              <div className="px-4 py-2.5">
                <div className="mb-1 flex justify-between text-xs font-medium text-ink-500">
                  <span>Progress</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-1000"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status narrative */}
          <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">
            {STATUS_NARRATIVE[d.status]}
          </div>

          {/* Primary action */}
          {d.status === "DELIVERED" ? (
            <div className="card flex flex-col items-center gap-2 p-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-base font-semibold text-ink-900">
                Delivery completed
              </p>
              <p className="text-sm text-ink-500">
                {d.trackingCode} delivered successfully.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {action && (
                <button
                  onClick={doAction}
                  disabled={busy}
                  className="btn-primary w-full py-4 text-base"
                >
                  {busy ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                  {action.label}
                </button>
              )}

              {/* Simulate movement — available once in transit */}
              {inTransit && (
                <button
                  onClick={toggleSim}
                  disabled={busy}
                  className={
                    running
                      ? "btn w-full bg-red-600 py-3.5 text-white hover:bg-red-700"
                      : "btn-success w-full py-3.5"
                  }
                >
                  {running ? (
                    <>
                      <Square className="h-4 w-4" /> Stop GPS Simulation
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Simulate GPS Movement
                    </>
                  )}
                </button>
              )}

              {d.status === "PICKED_UP" && (
                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
                  <Navigation className="h-3.5 w-3.5" />
                  Start delivery to enable live GPS simulation.
                </p>
              )}
            </div>
          )}

          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-ink-400 hover:text-ink-600"
          >
            <Home className="h-3.5 w-3.5" /> Exit driver app
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} />
      <div>
        <p className="text-xs text-ink-400">{label}</p>
        <p className="text-sm font-medium text-ink-900">{value}</p>
      </div>
    </div>
  );
}
