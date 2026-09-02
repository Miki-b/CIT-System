import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDemoData(prisma);
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ clients });
}
