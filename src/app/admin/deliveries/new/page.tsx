import { prisma } from "@/lib/prisma";
import { CreateDeliveryForm } from "@/components/CreateDeliveryForm";

export const dynamic = "force-dynamic";

export default async function NewDeliveryPage() {
  const [clients, drivers] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.driver.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <CreateDeliveryForm
      clients={clients.map((c) => ({ id: c.id, name: c.name, company: c.company }))}
      drivers={drivers.map((d) => ({ id: d.id, name: d.name, status: d.status }))}
    />
  );
}
