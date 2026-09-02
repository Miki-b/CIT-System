"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MapPin, Flag, Loader2 } from "lucide-react";
import { PageHeader } from "./AdminShell";
import { PRESET_LOCATIONS } from "@/lib/presets";
import { PRIORITIES } from "@/lib/domain";

interface Props {
  clients: { id: string; name: string; company: string }[];
  drivers: { id: string; name: string; status: string }[];
}

export function CreateDeliveryForm({ clients, drivers }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [driverId, setDriverId] = useState("");
  const [priority, setPriority] = useState("STANDARD");
  const [etaMinutes, setEtaMinutes] = useState(20);

  const [pickupIdx, setPickupIdx] = useState(0);
  const [destIdx, setDestIdx] = useState(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const pickup = PRESET_LOCATIONS[pickupIdx];
    const dest = PRESET_LOCATIONS[destIdx];

    try {
      const res = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          driverId: driverId || null,
          pickupName: pickup.name,
          pickupLatitude: pickup.lat,
          pickupLongitude: pickup.lng,
          destinationName: dest.name,
          destinationLatitude: dest.lat,
          destinationLongitude: dest.lng,
          priority,
          etaMinutes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to create delivery");
        setSubmitting(false);
        return;
      }
      router.push(`/admin/deliveries/${json.delivery.trackingCode}`);
    } catch {
      setError("Network error while creating delivery");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/deliveries"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to deliveries
      </Link>

      <PageHeader
        title="Create Delivery"
        subtitle="A unique CIT tracking code and client link are generated automatically."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client + driver */}
        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">
            Assignment
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Client</label>
              <select
                className="input"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.company}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Driver</label>
              <select
                className="input"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
              >
                <option value="">Assign later</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.status === "AVAILABLE" ? " (available)" : " (on delivery)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">
            Route
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-500" /> Pickup location
                </span>
              </label>
              <select
                className="input"
                value={pickupIdx}
                onChange={(e) => setPickupIdx(Number(e.target.value))}
              >
                {PRESET_LOCATIONS.map((l, i) => (
                  <option key={l.name} value={i}>
                    {l.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-ink-400">
                {PRESET_LOCATIONS[pickupIdx].lat.toFixed(4)},{" "}
                {PRESET_LOCATIONS[pickupIdx].lng.toFixed(4)}
              </p>
            </div>
            <div>
              <label className="label">
                <span className="inline-flex items-center gap-1.5">
                  <Flag className="h-4 w-4 text-emerald-500" /> Destination
                </span>
              </label>
              <select
                className="input"
                value={destIdx}
                onChange={(e) => setDestIdx(Number(e.target.value))}
              >
                {PRESET_LOCATIONS.map((l, i) => (
                  <option key={l.name} value={i}>
                    {l.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-ink-400">
                {PRESET_LOCATIONS[destIdx].lat.toFixed(4)},{" "}
                {PRESET_LOCATIONS[destIdx].lng.toFixed(4)}
              </p>
            </div>
          </div>
          {pickupIdx === destIdx && (
            <p className="mt-3 text-xs font-medium text-amber-600">
              Pickup and destination are the same — pick different locations.
            </p>
          )}
        </div>

        {/* Details */}
        <div className="card p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500">
            Details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Estimated delivery time (minutes)</label>
              <input
                type="number"
                className="input"
                min={1}
                max={600}
                value={etaMinutes}
                onChange={(e) => setEtaMinutes(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/deliveries" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || pickupIdx === destIdx}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Creating…" : "Create Delivery"}
          </button>
        </div>
      </form>
    </div>
  );
}
