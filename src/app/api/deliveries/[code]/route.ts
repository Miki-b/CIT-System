import { NextRequest, NextResponse } from "next/server";
import { getDeliveryByCode } from "@/lib/deliveries";
import { isRunning } from "@/lib/simulation";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const delivery = await getDeliveryByCode(code);
  if (!delivery) {
    return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
  }
  return NextResponse.json({ delivery, simulating: isRunning(code) });
}
