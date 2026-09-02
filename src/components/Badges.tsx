import {
  DeliveryStatus,
  DriverStatus,
  Priority,
  STATUS_STYLE,
  PRIORITY_STYLE,
  DRIVER_STATUS_STYLE,
} from "@/lib/domain";

export function StatusBadge({
  status,
  pulse = false,
}: {
  status: DeliveryStatus;
  pulse?: boolean;
}) {
  const s = STATUS_STYLE[status];
  const showPulse = pulse && (status === "IN_TRANSIT" || status === "NEAR_DESTINATION");
  return (
    <span className={`badge ${s.bg} ${s.text} ${s.ring}`}>
      <span className="relative flex h-2 w-2">
        {showPulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${s.dot} opacity-60 animate-ping`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
      </span>
      {s.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const p = PRIORITY_STYLE[priority];
  return <span className={`badge ring-transparent ${p.bg} ${p.text}`}>{p.label}</span>;
}

export function DriverStatusBadge({ status }: { status: DriverStatus }) {
  const s = DRIVER_STATUS_STYLE[status];
  return (
    <span className={`badge ring-transparent ${s.bg} ${s.text}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
