import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const drivers = await prisma.driver.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { deliveries: true } } },
  });
  return NextResponse.json({
    drivers: drivers.map((d) => ({
      id: d.id,
      name: d.name,
      phone: d.phone,
      status: d.status,
      currentLatitude: d.currentLatitude,
      currentLongitude: d.currentLongitude,
      deliveryCount: d._count.deliveries,
    })),
  });
}
