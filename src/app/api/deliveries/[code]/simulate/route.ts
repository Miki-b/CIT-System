import { NextRequest, NextResponse } from "next/server";
import { getDeliveryByCode } from "@/lib/deliveries";
import { isRunning, startSimulation, stopSimulation } from "@/lib/simulation";

export const dynamic = "force-dynamic";

/** Body: { action: "start" | "stop" }. Defaults to "start". */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  let action = "start";
  try {
    const body = await req.json();
    if (body?.action) action = body.action;
  } catch {
    /* default to start */
  }

  if (action === "stop") {
    await stopSimulation(code);
    const delivery = await getDeliveryByCode(code);
    return NextResponse.json({ simulating: false, delivery });
  }

  const ok = await startSimulation(code);
  if (!ok) {
    return NextResponse.json(
      { error: "Cannot start simulation (delivery missing or already delivered)" },
      { status: 409 }
    );
  }
  const delivery = await getDeliveryByCode(code);
  return NextResponse.json({ simulating: isRunning(code), delivery });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  return NextResponse.json({ simulating: isRunning(code) });
}
