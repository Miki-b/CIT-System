"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Play,
  Square,
  Truck,
  MapPin,
  Flag,
  User,
  Phone,
  Building2,
  Gauge,
  Clock,
  Loader2,
  UserPlus,
} from "lucide-react";
import type { DeliveryDTO } from "@/lib/serialize";
import { useDeliveryStream } from "./useDeliveryStream";
import { PageHeader, LiveDot } from "./AdminShell";
import { StatusBadge, PriorityBadge, DriverStatusBadge } from "./Badges";
import { DeliveryMap } from "./DeliveryMap";
import { Timeline } from "./Timeline";
import { formatEta, relativeTime } from "@/lib/format";
import { nextDriverAction } from "@/lib/domain";

interface Props {
  trackingCode: string;
  initial: DeliveryDTO;
  simulating: boolean;
  drivers: { id: string; name: string; status: string }[];
}

export function DeliveryDetail({ trackingCode, initial, simulating, drivers }: Props) {
  const { delivery, connected, lastUpdated } = useDeliveryStream(trackingCode, initial);
  const [running, setRunning] = useState(simulating);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [trackUrl, setTrackUrl] = useState(`/track/${trackingCode}`);
  const [assignId, setAssignId] = useState("");
  const [tick, setTick] = useState(0);

  const d = delivery ?? initial;

  // Build absolute tracking URL on the client.
  useEffect(() => {
    setTrackUrl(`${window.location.origin}/track/${trackingCode}`);
  }, [trackingCode]);

  // Re-render "last updated" label periodically.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Simulation stops itself on delivery — reflect that.
  useEffect(() => {
    if (d.status === "DELIVERED") setRunning(false);
  }, [d.status]);

  async function toggleSimulation() {
    setBusy(true);
    try {
      const action = running ? "stop" : "start";
      const res = await fetch(`/api/deliveries/${trackingCode}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      setRunning(!!json.simulating);
    } finally {
      setBusy(false);
    }
  }

  async function assignDriver() {
    if (!assignId) return;
    setBusy(true);
    try {
      await fetch(`/api/deliveries/${trackingCode}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", driverId: assignId }),
      });
    } finally {
      setBusy(false);
    }
  }

  function copyLink() {
    navigator.clipboard?.writeText(trackUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const progressPct = Math.round(d.progress * 100);
  const canSimulate = d.status !== "DELIVERED";
  void tick;

  return (
    <div>
      <Link
        href="/admin/deliveries"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to deliveries
      </Link>

      <PageHeader
        title={d.trackingCode}
        subtitle={`${d.client.name} • ${d.pickup.name} → ${d.destination.name}`}
        actions={
          <>
            <LiveDot connected={connected} />
            <Link href={`/track/${trackingCode}`} target="_blank" className="btn-secondary">
              <ExternalLink className="h-4 w-4" />
              Open Client Tracking
            </Link>
          </>
        }
      />

      {/* Status + priority row */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <StatusBadge status={d.status} pulse />
        <PriorityBadge priority={d.priority} />
        {d.driver && <DriverStatusBadge status={d.driver.status} />}
        <span className="text-xs text-ink-400">
          Updated {lastUpdated ? relativeTime(new Date(lastUpdated).toISOString()) : "—"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map + simulation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden p-0">
            <DeliveryMap
              pickup={d.pickup}
              destination={d.destination}
              current={d.current}
              status={d.status}
              progress={d.progress}
              className="h-[380px] w-full"
            />
          </div>

          {/* Demo simulation control */}
          <div className="card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <Gauge className="h-4 w-4 text-brand-600" />
                  Live Delivery Simulation
                </h3>
                <p className="mt-1 text-sm text-ink-500">
                  Drives the GPS marker along the route and pushes live updates to
                  every connected screen.
                </p>
              </div>
              <button
                onClick={toggleSimulation}
                disabled={busy || (!running && !canSimulate)}
                className={running ? "btn bg-red-600 text-white hover:bg-red-700" : "btn-primary"}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : running ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {running ? "Stop Simulation" : "Start Live Delivery Simulation"}
              </button>
            </div>

            {/* progress bar */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-500">
                <span>Route progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">
              Delivery Timeline
            </h3>
            <Timeline events={d.events} />
          </div>
        </div>

        {/* Info column */}
        <div className="space-y-6">
          {/* Key metrics */}
          <div className="card p-5">
            <div className="grid grid-cols-2 gap-4">
              <Metric
                icon={Clock}
                label="ETA"
                value={d.status === "DELIVERED" ? "Delivered" : formatEta(d.etaMinutes)}
              />
              <Metric icon={Gauge} label="Progress" value={`${progressPct}%`} />
              <Metric icon={Truck} label="Remaining" value={`${d.remainingKm} km`} />
              <Metric icon={MapPin} label="Total route" value={`${d.totalKm} km`} />
            </div>
          </div>

          {/* Driver / assignment */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
              Driver
            </h3>
            {d.driver ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <User className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {d.driver.name}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-ink-500">
                      <Phone className="h-3 w-3" /> {d.driver.phone}
                    </p>
                  </div>
                </div>
                <DriverStatusBadge status={d.driver.status} />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-ink-500">No driver assigned yet.</p>
                <div className="flex gap-2">
                  <select
                    className="input"
                    value={assignId}
                    onChange={(e) => setAssignId(e.target.value)}
                  >
                    <option value="">Select driver…</option>
                    {drivers.map((dr) => (
                      <option key={dr.id} value={dr.id}>
                        {dr.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={assignDriver}
                    disabled={!assignId || busy}
                    className="btn-primary shrink-0"
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Client */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
              Client
            </h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 font-semibold text-ink-900">
                <Building2 className="h-4 w-4 text-ink-400" /> {d.client.name}
              </p>
              <p className="text-ink-600">{d.client.company}</p>
              <p className="text-ink-500">{d.client.email}</p>
              <p className="text-ink-500">{d.client.phone}</p>
            </div>
          </div>

          {/* Route */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
              Route
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-xs text-ink-400">Pickup</p>
                  <p className="font-medium text-ink-900">{d.pickup.name}</p>
                </div>
              </div>
              <div className="ml-2 h-4 w-px bg-ink-200" />
              <div className="flex items-start gap-2.5">
                <Flag className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-xs text-ink-400">Destination</p>
                  <p className="font-medium text-ink-900">{d.destination.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking link */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
              Client Tracking Link
            </h3>
            <div className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2.5">
              <span className="flex-1 truncate text-xs text-ink-600">{trackUrl}</span>
              <button
                onClick={copyLink}
                className="btn-ghost px-2 py-1 text-xs"
                aria-label="Copy tracking link"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <Link
              href={`/track/${trackingCode}`}
              target="_blank"
              className="btn-secondary mt-3 w-full"
            >
              <ExternalLink className="h-4 w-4" />
              Open Client Tracking
            </Link>
            {nextDriverAction(d.status) && (
              <p className="mt-3 text-xs text-ink-400">
                Next driver step:{" "}
                <span className="font-medium text-ink-600">
                  {nextDriverAction(d.status)!.label}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-ink-900">{value}</p>
    </div>
  );
}
