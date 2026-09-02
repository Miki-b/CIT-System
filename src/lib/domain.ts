import { z } from "zod";

/* ---------------------------------------------------------------------------
 * Roles
 * ------------------------------------------------------------------------- */
export const ROLES = ["ADMIN", "DRIVER", "CLIENT"] as const;
export type Role = (typeof ROLES)[number];

/* ---------------------------------------------------------------------------
 * Delivery status
 * ------------------------------------------------------------------------- */
export const DELIVERY_STATUSES = [
  "CREATED",
  "ASSIGNED",
  "AT_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "NEAR_DESTINATION",
  "DELIVERED",
] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

/** Ordered index used for progress bars and "is this before/after" checks. */
export const STATUS_ORDER: Record<DeliveryStatus, number> = {
  CREATED: 0,
  ASSIGNED: 1,
  AT_PICKUP: 2,
  PICKED_UP: 3,
  IN_TRANSIT: 4,
  NEAR_DESTINATION: 5,
  DELIVERED: 6,
};

export const STATUS_LABEL: Record<DeliveryStatus, string> = {
  CREATED: "Created",
  ASSIGNED: "Assigned",
  AT_PICKUP: "At Pickup",
  PICKED_UP: "Picked Up",
  IN_TRANSIT: "In Transit",
  NEAR_DESTINATION: "Near Destination",
  DELIVERED: "Delivered",
};

/** Short human sentence shown to the client while in each state. */
export const STATUS_NARRATIVE: Record<DeliveryStatus, string> = {
  CREATED: "Delivery has been created and is awaiting driver assignment.",
  ASSIGNED: "A secure driver has been assigned and is heading to pickup.",
  AT_PICKUP: "The driver has arrived at the pickup location.",
  PICKED_UP: "The consignment has been secured and picked up.",
  IN_TRANSIT: "Driver is currently moving toward the destination.",
  NEAR_DESTINATION: "Driver is arriving at the destination shortly.",
  DELIVERED: "Delivery completed successfully.",
};

/**
 * Tailwind color tokens per status. `dot` / `text` / `bg` / `ring` are used to
 * build badges and indicators consistently across the app.
 */
export const STATUS_STYLE: Record<
  DeliveryStatus,
  { text: string; bg: string; dot: string; ring: string; label: string }
> = {
  CREATED: {
    label: "Created",
    text: "text-ink-600",
    bg: "bg-ink-100",
    dot: "bg-ink-400",
    ring: "ring-ink-200",
  },
  ASSIGNED: {
    label: "Assigned",
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    dot: "bg-indigo-500",
    ring: "ring-indigo-200",
  },
  AT_PICKUP: {
    label: "At Pickup",
    text: "text-amber-700",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  PICKED_UP: {
    label: "Picked Up",
    text: "text-amber-700",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  IN_TRANSIT: {
    label: "In Transit",
    text: "text-brand-700",
    bg: "bg-brand-50",
    dot: "bg-brand-500",
    ring: "ring-brand-200",
  },
  NEAR_DESTINATION: {
    label: "Near Destination",
    text: "text-violet-700",
    bg: "bg-violet-50",
    dot: "bg-violet-500",
    ring: "ring-violet-200",
  },
  DELIVERED: {
    label: "Delivered",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
};

/** Milestones shown on the client tracking status rail. */
export const STATUS_MILESTONES: {
  status: DeliveryStatus;
  title: string;
}[] = [
  { status: "ASSIGNED", title: "Driver assigned" },
  { status: "AT_PICKUP", title: "Arrived at pickup" },
  { status: "PICKED_UP", title: "Package secured" },
  { status: "IN_TRANSIT", title: "In transit" },
  { status: "NEAR_DESTINATION", title: "Arriving soon" },
  { status: "DELIVERED", title: "Delivered" },
];

export function isBeforeStatus(a: DeliveryStatus, b: DeliveryStatus): boolean {
  return STATUS_ORDER[a] < STATUS_ORDER[b];
}
export function isAtOrAfterStatus(a: DeliveryStatus, b: DeliveryStatus): boolean {
  return STATUS_ORDER[a] >= STATUS_ORDER[b];
}

/* ---------------------------------------------------------------------------
 * Priority
 * ------------------------------------------------------------------------- */
export const PRIORITIES = ["LOW", "STANDARD", "HIGH", "CRITICAL"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_STYLE: Record<
  Priority,
  { text: string; bg: string; label: string }
> = {
  LOW: { label: "Low", text: "text-ink-600", bg: "bg-ink-100" },
  STANDARD: { label: "Standard", text: "text-sky-700", bg: "bg-sky-50" },
  HIGH: { label: "High", text: "text-orange-700", bg: "bg-orange-50" },
  CRITICAL: { label: "Critical", text: "text-red-700", bg: "bg-red-50" },
};

/* ---------------------------------------------------------------------------
 * Driver status
 * ------------------------------------------------------------------------- */
export const DRIVER_STATUSES = ["AVAILABLE", "ON_DELIVERY", "OFFLINE"] as const;
export type DriverStatus = (typeof DRIVER_STATUSES)[number];

export const DRIVER_STATUS_STYLE: Record<
  DriverStatus,
  { text: string; bg: string; dot: string; label: string }
> = {
  AVAILABLE: {
    label: "Available",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
  },
  ON_DELIVERY: {
    label: "On Delivery",
    text: "text-brand-700",
    bg: "bg-brand-50",
    dot: "bg-brand-500",
  },
  OFFLINE: {
    label: "Offline",
    text: "text-ink-500",
    bg: "bg-ink-100",
    dot: "bg-ink-400",
  },
};

/* ---------------------------------------------------------------------------
 * Event types
 * ------------------------------------------------------------------------- */
export const EVENT_TYPES = [
  "CREATED",
  "ASSIGNED",
  "AT_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "NEAR_DESTINATION",
  "DELIVERED",
  "LOCATION",
  "INFO",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/* ---------------------------------------------------------------------------
 * Driver action state machine
 * Maps a driver-facing action button to the resulting status + event message.
 * ------------------------------------------------------------------------- */
export const DRIVER_ACTIONS: {
  from: DeliveryStatus;
  action: string;
  label: string;
  next: DeliveryStatus;
  eventType: EventType;
  eventMessage: string;
}[] = [
  {
    from: "ASSIGNED",
    action: "start_pickup",
    label: "Start Pickup",
    next: "AT_PICKUP",
    eventType: "AT_PICKUP",
    eventMessage: "Driver arrived at pickup location",
  },
  {
    from: "AT_PICKUP",
    action: "confirm_pickup",
    label: "Confirm Pickup",
    next: "PICKED_UP",
    eventType: "PICKED_UP",
    eventMessage: "Consignment secured and picked up",
  },
  {
    from: "PICKED_UP",
    action: "start_delivery",
    label: "Start Delivery",
    next: "IN_TRANSIT",
    eventType: "IN_TRANSIT",
    eventMessage: "Delivery started — en route to destination",
  },
  {
    from: "IN_TRANSIT",
    action: "mark_near",
    label: "Arriving Soon",
    next: "NEAR_DESTINATION",
    eventType: "NEAR_DESTINATION",
    eventMessage: "Driver is near the destination",
  },
  {
    from: "NEAR_DESTINATION",
    action: "mark_delivered",
    label: "Mark Delivered",
    next: "DELIVERED",
    eventType: "DELIVERED",
    eventMessage: "Delivery completed successfully",
  },
];

export function nextDriverAction(status: DeliveryStatus) {
  return DRIVER_ACTIONS.find((a) => a.from === status) ?? null;
}

/* ---------------------------------------------------------------------------
 * Geo helpers
 * ------------------------------------------------------------------------- */
export interface LngLat {
  lng: number;
  lat: number;
}

/** Linear interpolation between pickup and destination for a progress 0..1. */
export function interpolate(a: LngLat, b: LngLat, t: number): LngLat {
  const clamped = Math.max(0, Math.min(1, t));
  return {
    lng: a.lng + (b.lng - a.lng) * clamped,
    lat: a.lat + (b.lat - a.lat) * clamped,
  };
}

/** Haversine distance in kilometers. */
export function distanceKm(a: LngLat, b: LngLat): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Map a progress value to the appropriate in-transit status. */
export function statusForProgress(t: number): DeliveryStatus {
  if (t >= 1) return "DELIVERED";
  if (t >= 0.8) return "NEAR_DESTINATION";
  return "IN_TRANSIT";
}

/* ---------------------------------------------------------------------------
 * Validation schemas
 * ------------------------------------------------------------------------- */
export const createDeliverySchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  driverId: z.string().min(1).optional().nullable(),
  pickupName: z.string().min(2, "Pickup name is required"),
  pickupLatitude: z.coerce.number().min(-90).max(90),
  pickupLongitude: z.coerce.number().min(-180).max(180),
  destinationName: z.string().min(2, "Destination name is required"),
  destinationLatitude: z.coerce.number().min(-90).max(90),
  destinationLongitude: z.coerce.number().min(-180).max(180),
  priority: z.enum(PRIORITIES).default("STANDARD"),
  etaMinutes: z.coerce.number().int().min(1).max(600).default(20),
});
export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
