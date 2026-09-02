import { prisma } from "./prisma";
import { broadcastDelivery } from "./bus";
import {
  DELIVERY_INCLUDE,
  DeliveryDTO,
  serializeDelivery,
} from "./serialize";
import {
  DeliveryStatus,
  EventType,
  LngLat,
  interpolate,
  statusForProgress,
  STATUS_LABEL,
} from "./domain";

export async function getDeliveryByCode(
  trackingCode: string
): Promise<DeliveryDTO | null> {
  const d = await prisma.delivery.findUnique({
    where: { trackingCode },
    include: DELIVERY_INCLUDE,
  });
  return d ? serializeDelivery(d) : null;
}

export async function listDeliveries(): Promise<DeliveryDTO[]> {
  const rows = await prisma.delivery.findMany({
    include: DELIVERY_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(serializeDelivery);
}

/** Re-read + serialize + broadcast to all connected clients. */
export async function refreshAndBroadcast(
  trackingCode: string
): Promise<DeliveryDTO | null> {
  const d = await prisma.delivery.findUnique({
    where: { trackingCode },
    include: DELIVERY_INCLUDE,
  });
  if (!d) return null;
  const dto = serializeDelivery(d);
  broadcastDelivery(trackingCode, dto);
  return dto;
}

export async function addEvent(
  deliveryId: string,
  type: EventType,
  message: string,
  location?: LngLat | null
): Promise<void> {
  await prisma.deliveryEvent.create({
    data: {
      deliveryId,
      type,
      message,
      latitude: location?.lat ?? null,
      longitude: location?.lng ?? null,
    },
  });
}

/**
 * Apply a status transition, log an event, keep the driver record in sync,
 * then broadcast. Used by driver actions and the simulation engine.
 */
export async function applyStatus(
  trackingCode: string,
  status: DeliveryStatus,
  opts: {
    eventType?: EventType;
    message?: string;
    location?: LngLat | null;
    progress?: number;
    etaMinutes?: number | null;
  } = {}
): Promise<DeliveryDTO | null> {
  const existing = await prisma.delivery.findUnique({
    where: { trackingCode },
  });
  if (!existing) return null;

  const location = opts.location ?? null;
  const eta =
    opts.etaMinutes != null
      ? new Date(Date.now() + opts.etaMinutes * 60000)
      : status === "DELIVERED"
        ? null
        : existing.eta;

  await prisma.delivery.update({
    where: { trackingCode },
    data: {
      status,
      ...(opts.progress != null ? { progress: opts.progress } : {}),
      ...(location
        ? { currentLatitude: location.lat, currentLongitude: location.lng }
        : {}),
      eta,
    },
  });

  await addEvent(
    existing.id,
    opts.eventType ?? (status as EventType),
    opts.message ?? `Status updated to ${STATUS_LABEL[status]}`,
    location
  );

  // Keep driver status in sync with delivery lifecycle.
  if (existing.driverId) {
    if (status === "DELIVERED") {
      await prisma.driver.update({
        where: { id: existing.driverId },
        data: {
          status: "AVAILABLE",
          ...(location
            ? { currentLatitude: location.lat, currentLongitude: location.lng }
            : {}),
        },
      });
    } else {
      await prisma.driver.update({
        where: { id: existing.driverId },
        data: {
          status: "ON_DELIVERY",
          ...(location
            ? { currentLatitude: location.lat, currentLongitude: location.lng }
            : {}),
        },
      });
    }
  }

  return refreshAndBroadcast(trackingCode);
}

/** Update only the live location + progress + ETA (used every simulation tick). */
export async function updateLocation(
  trackingCode: string,
  progress: number
): Promise<DeliveryDTO | null> {
  const existing = await prisma.delivery.findUnique({
    where: { trackingCode },
  });
  if (!existing) return null;

  const pickup: LngLat = {
    lat: existing.pickupLatitude,
    lng: existing.pickupLongitude,
  };
  const dest: LngLat = {
    lat: existing.destinationLatitude,
    lng: existing.destinationLongitude,
  };
  const pos = interpolate(pickup, dest, progress);

  // Derive ETA from remaining fraction (assume ~14 min full route for demo feel).
  const totalMinutes = 14;
  const etaMinutes = Math.max(0, Math.round(totalMinutes * (1 - progress)));

  await prisma.delivery.update({
    where: { trackingCode },
    data: {
      progress,
      currentLatitude: pos.lat,
      currentLongitude: pos.lng,
      eta: new Date(Date.now() + etaMinutes * 60000),
    },
  });

  if (existing.driverId) {
    await prisma.driver.update({
      where: { id: existing.driverId },
      data: { currentLatitude: pos.lat, currentLongitude: pos.lng },
    });
  }

  return refreshAndBroadcast(trackingCode);
}

export { statusForProgress };
