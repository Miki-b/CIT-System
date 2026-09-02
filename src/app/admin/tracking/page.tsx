import { listDeliveries } from "@/lib/deliveries";
import { TrackingBoard } from "@/components/TrackingBoard";

export const dynamic = "force-dynamic";

export default async function TrackingPage() {
  const deliveries = await listDeliveries();
  return <TrackingBoard initialDeliveries={deliveries} />;
}
