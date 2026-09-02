import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Brand({
  href = "/",
  compact = false,
}: {
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5 group">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
        <ShieldCheck className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-ink-900">
            CIT<span className="text-brand-600">Secure</span>
          </span>
          <span className="text-[11px] font-medium text-ink-500">
            Delivery Tracking
          </span>
        </span>
      )}
    </Link>
  );
}
