import type { Client, Delivery, Driver, DeliveryEvent } from "@prisma/client";
import {
  DeliveryStatus,
  Priority,
  distanceKm,
  DriverStatus,
} from "./domain";

export type DeliveryWithRelations = Delivery & {
  client: Client;
  driver: Driver | null;
  events: DeliveryEvent[];
};

export interface EventDTO {
  id: string;
  type: string;
  message: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export interface DeliveryDTO {
  id: string;
  trackingCode: string;
  status: DeliveryStatus;
  priority: Priority;
  progress: number;
  pickup: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  current: { lat: number; lng: number } | null;
  eta: string | null;
  etaMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  driver: {
    id: string;
    name: string;
    phone: string;
    status: DriverStatus;
  } | null;
  events: EventDTO[];
  totalKm: number;
  remainingKm: number;
}

export function serializeEvent(e: DeliveryEvent): EventDTO {
  return {
    id: e.id,
    type: e.type,
    message: e.message,
    latitude: e.latitude,
    longitude: e.longitude,
    createdAt: e.createdAt.toISOString(),
  };
}

export function serializeDelivery(d: DeliveryWithRelations): DeliveryDTO {
  const pickup = {
    name: d.pickupName,
    lat: d.pickupLatitude,
    lng: d.pickupLongitude,
  };
  const destination = {
    name: d.destinationName,
    lat: d.destinationLatitude,
    lng: d.destinationLongitude,
  };
  const current =
    d.currentLatitude != null && d.currentLongitude != null
      ? { lat: d.currentLatitude, lng: d.currentLongitude }
      : null;

  const totalKm = distanceKm(
    { lat: pickup.lat, lng: pickup.lng },
    { lat: destination.lat, lng: destination.lng }
  );
  const remainingKm = current
    ? distanceKm(
        { lat: current.lat, lng: current.lng },
        { lat: destination.lat, lng: destination.lng }
      )
    : totalKm;

  let etaMinutes: number | null = null;
  if (d.eta) {
    etaMinutes = Math.max(0, Math.round((d.eta.getTime() - Date.now()) / 60000));
  }

  return {
    id: d.id,
    trackingCode: d.trackingCode,
    status: d.status as DeliveryStatus,
    priority: d.priority as Priority,
    progress: d.progress,
    pickup,
    destination,
    current,
    eta: d.eta ? d.eta.toISOString() : null,
    etaMinutes,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    client: {
      id: d.client.id,
      name: d.client.name,
      company: d.client.company,
      email: d.client.email,
      phone: d.client.phone,
    },
    driver: d.driver
      ? {
          id: d.driver.id,
          name: d.driver.name,
          phone: d.driver.phone,
          status: d.driver.status as DriverStatus,
        }
      : null,
    events: [...d.events]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(serializeEvent),
    totalKm: Math.round(totalKm * 10) / 10,
    remainingKm: Math.round(remainingKm * 10) / 10,
  };
}

export const DELIVERY_INCLUDE = {
  client: true,
  driver: true,
  events: { orderBy: { createdAt: "asc" as const } },
} as const;
