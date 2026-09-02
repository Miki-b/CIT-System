import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoData } from "@/lib/demo-data";
import { listDeliveries } from "@/lib/deliveries";
import { createDeliverySchema } from "@/lib/domain";
import { nextTrackingCode } from "@/lib/codes";
import { DELIVERY_INCLUDE, serializeDelivery } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET() {
  const deliveries = await listDeliveries();
  return NextResponse.json({ deliveries });
}

export async function POST(req: NextRequest) {
  await ensureDemoData(prisma);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createDeliverySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const client = await prisma.client.findUnique({ where: { id: input.clientId } });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 400 });
  }

  const hasDriver = !!input.driverId;
  const trackingCode = await nextTrackingCode();

  const created = await prisma.delivery.create({
    data: {
      trackingCode,
      clientId: input.clientId,
      driverId: input.driverId || null,
      pickupName: input.pickupName,
      pickupLatitude: input.pickupLatitude,
      pickupLongitude: input.pickupLongitude,
      destinationName: input.destinationName,
      destinationLatitude: input.destinationLatitude,
      destinationLongitude: input.destinationLongitude,
      priority: input.priority,
      status: hasDriver ? "ASSIGNED" : "CREATED",
      currentLatitude: input.pickupLatitude,
      currentLongitude: input.pickupLongitude,
      progress: 0,
      eta: new Date(Date.now() + input.etaMinutes * 60000),
      events: {
        create: [
          {
            type: "CREATED",
            message: "Delivery created",
            latitude: input.pickupLatitude,
            longitude: input.pickupLongitude,
          },
          ...(hasDriver
            ? [
                {
                  type: "ASSIGNED",
                  message: "Driver assigned to delivery",
                  latitude: input.pickupLatitude,
                  longitude: input.pickupLongitude,
                },
              ]
            : []),
        ],
      },
    },
    include: DELIVERY_INCLUDE,
  });

  if (hasDriver && input.driverId) {
    await prisma.driver.update({
      where: { id: input.driverId },
      data: { status: "ON_DELIVERY" },
    });
  }

  return NextResponse.json(
    { delivery: serializeDelivery(created) },
    { status: 201 }
  );
}
