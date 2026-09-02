import { notFound } from "next/navigation";
import { getDeliveryByCode } from "@/lib/deliveries";
import { prisma } from "@/lib/prisma";
import { isRunning } from "@/lib/simulation";
import { DeliveryDetail } from "@/components/DeliveryDetail";

export const dynamic = "force-dynamic";

export default async function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const delivery = await getDeliveryByCode(code);
  if (!delivery) notFound();

  const drivers = await prisma.driver.findMany({ orderBy: { name: "asc" } });

  return (
    <DeliveryDetail
      trackingCode={code}
      initial={delivery}
      simulating={isRunning(code)}
      drivers={drivers.map((d) => ({ id: d.id, name: d.name, status: d.status }))}
    />
  );
}
