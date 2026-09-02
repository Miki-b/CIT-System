import { listDeliveries } from "@/lib/deliveries";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const deliveries = await listDeliveries();
  const drivers = await prisma.driver.findMany();
  const driverStats = {
    total: drivers.length,
    available: drivers.filter((d) => d.status === "AVAILABLE").length,
    onDelivery: drivers.filter((d) => d.status === "ON_DELIVERY").length,
  };

  return <AdminDashboard initialDeliveries={deliveries} driverStats={driverStats} />;
}
