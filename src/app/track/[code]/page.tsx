import Link from "next/link";
import { getDeliveryByCode } from "@/lib/deliveries";
import { ClientTracking } from "@/components/ClientTracking";
import { ShieldCheck, SearchX } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const delivery = await getDeliveryByCode(code);

  if (!delivery) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-100 p-6">
        <div className="card max-w-md p-10 text-center">
          <SearchX className="mx-auto h-10 w-10 text-ink-300" />
          <h1 className="mt-4 text-xl font-bold text-ink-900">
            Tracking code not found
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            We couldn&apos;t find a delivery for{" "}
            <span className="font-semibold">{code}</span>. Please check the code
            and try again.
          </p>
          <Link href="/track/CIT-1001" className="btn-primary mt-6">
            <ShieldCheck className="h-4 w-4" /> Try the demo delivery
          </Link>
        </div>
      </div>
    );
  }

  return <ClientTracking trackingCode={code} initial={delivery} />;
}
