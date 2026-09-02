import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoData } from "@/lib/demo-data";
import { applyStatus, refreshAndBroadcast } from "@/lib/deliveries";
import { DRIVER_ACTIONS, DeliveryStatus, interpolate, LngLat } from "@/lib/domain";
import { stopSimulation } from "@/lib/simulation";

export const dynamic = "force-dynamic";

/**
 * Driver-facing state-machine action, e.g. { action: "confirm_pickup" }.
 * Also supports { action: "assign", driverId } for admin driver assignment.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  await ensureDemoData(prisma);
  const { code } = await params;
  let body: { action?: string; driverId?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body allowed for actions without payload */
  }

  const delivery = await prisma.delivery.findUnique({
    where: { trackingCode: code },
  });
  if (!delivery) {
    return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
  }

  // Admin assigning a driver.
  if (body.action === "assign") {
    if (!body.driverId) {
      return NextResponse.json({ error: "driverId required" }, { status: 400 });
    }
    const driver = await prisma.driver.findUnique({ where: { id: body.driverId } });
    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 400 });
    }
    await prisma.delivery.update({
      where: { trackingCode: code },
      data: {
        driverId: body.driverId,
        status: delivery.status === "CREATED" ? "ASSIGNED" : delivery.status,
      },
    });
    await prisma.deliveryEvent.create({
      data: {
        deliveryId: delivery.id,
        type: "ASSIGNED",
        message: `Driver ${driver.name} assigned to delivery`,
      },
    });
    await prisma.driver.update({
      where: { id: body.driverId },
      data: { status: "ON_DELIVERY" },
    });
    const dto = await refreshAndBroadcast(code);
    return NextResponse.json({ delivery: dto });
  }

  const transition = DRIVER_ACTIONS.find((a) => a.action === body.action);
  if (!transition) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  if (transition.from !== delivery.status) {
    return NextResponse.json(
      {
        error: `Action "${transition.action}" not allowed from status ${delivery.status}`,
      },
      { status: 409 }
    );
  }

  // Compute a sensible location for the new status.
  const pickup: LngLat = {
    lat: delivery.pickupLatitude,
    lng: delivery.pickupLongitude,
  };
  const dest: LngLat = {
    lat: delivery.destinationLatitude,
    lng: delivery.destinationLongitude,
  };
  let location: LngLat = pickup;
  let progress = delivery.progress;
  let etaMinutes: number | null = null;
  const next = transition.next as DeliveryStatus;

  if (next === "AT_PICKUP" || next === "PICKED_UP") {
    location = pickup;
    progress = 0;
    etaMinutes = 14;
  } else if (next === "IN_TRANSIT") {
    location = interpolate(pickup, dest, 0.05);
    progress = 0.05;
    etaMinutes = 14;
  } else if (next === "NEAR_DESTINATION") {
    location = interpolate(pickup, dest, 0.85);
    progress = 0.85;
    etaMinutes = 3;
  } else if (next === "DELIVERED") {
    location = dest;
    progress = 1;
    etaMinutes = null;
    await stopSimulation(code);
  }

  const dto = await applyStatus(code, next, {
    eventType: transition.eventType,
    message: transition.eventMessage,
    location,
    progress,
    etaMinutes,
  });

  return NextResponse.json({ delivery: dto });
}
