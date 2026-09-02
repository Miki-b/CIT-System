import { listDeliveries } from "@/lib/deliveries";
import { DriverApp } from "@/components/DriverApp";

export const dynamic = "force-dynamic";

export default async function DriverPage() {
  const all = await listDeliveries();
  // Show active assignments first, then the rest, so there's always something.
  const active = all.filter((d) => d.status !== "DELIVERED" && d.driver);
  const assignments = active.length > 0 ? active : all.filter((d) => d.driver);
  return <DriverApp assignments={assignments} />;
}
