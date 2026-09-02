import Link from "next/link";
import { Phone, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/AdminShell";
import { DriverStatusBadge } from "@/components/Badges";
import { StatusBadge } from "@/components/Badges";
import { DeliveryStatus, DriverStatus } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const drivers = await prisma.driver.findMany({
    orderBy: { name: "asc" },
    include: {
      deliveries: {
        where: { status: { not: "DELIVERED" } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div>
      <PageHeader
        title="Drivers"
        subtitle="Fleet availability and current assignments."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.map((d) => {
          const active = d.deliveries[0];
          return (
            <div key={d.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 font-semibold">
                    {d.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{d.name}</p>
                    <p className="flex items-center gap-1 text-xs text-ink-500">
                      <Phone className="h-3 w-3" /> {d.phone}
                    </p>
                  </div>
                </div>
                <DriverStatusBadge status={d.status as DriverStatus} />
              </div>

              <div className="mt-4 border-t border-ink-100 pt-4">
                {active ? (
                  <Link
                    href={`/admin/deliveries/${active.trackingCode}`}
                    className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2.5 hover:bg-ink-100"
                  >
                    <div>
                      <p className="text-xs text-ink-500">Current assignment</p>
                      <p className="text-sm font-semibold text-brand-700">
                        {active.trackingCode}
                      </p>
                    </div>
                    <StatusBadge status={active.status as DeliveryStatus} pulse />
                  </Link>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-ink-400">
                    <Truck className="h-4 w-4" /> No active assignment
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
