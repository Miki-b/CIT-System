import { listDeliveries } from "@/lib/deliveries";
import { DeliveriesList } from "@/components/DeliveriesList";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage() {
  const deliveries = await listDeliveries();
  return <DeliveriesList initialDeliveries={deliveries} />;
}
