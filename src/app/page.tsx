import Link from "next/link";
import {
  ShieldCheck,
  LayoutDashboard,
  Truck,
  MapPin,
  ArrowRight,
  Radio,
  Route,
  BellRing,
} from "lucide-react";
import { Brand } from "@/components/Brand";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-ink-50 to-ink-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Brand />
        <div className="hidden items-center gap-2 sm:flex">
          <Link href="/admin" className="btn-ghost">
            Dispatcher
          </Link>
          <Link href="/driver" className="btn-ghost">
            Driver
          </Link>
          <Link href="/track/CIT-1001" className="btn-secondary">
            Track a delivery
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
              <Radio className="h-3.5 w-3.5" /> Live prototype
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              CIT Delivery Tracking
            </h1>
            <p className="mt-4 max-w-md text-lg text-ink-600">
              Real-time visibility from pickup to drop-off. Track every
              cash-in-transit consignment, live, on one secure map.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/admin" className="btn-primary">
                <LayoutDashboard className="h-4 w-4" />
                Open Dispatcher Dashboard
              </Link>
              <Link href="/driver" className="btn-secondary">
                <Truck className="h-4 w-4" />
                Open Driver App
              </Link>
              <Link href="/track/CIT-1001" className="btn-secondary">
                <MapPin className="h-4 w-4" />
                Track CIT-1001
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-ink-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              No login required for the demo — jump straight in.
            </div>
          </div>

          {/* Preview card */}
          <div className="relative">
            <div className="card overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-ink-200 bg-white px-5 py-3">
                <span className="text-sm font-semibold text-ink-900">
                  CIT-1001
                </span>
                <span className="badge bg-brand-50 text-brand-700 ring-brand-200">
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                  In Transit
                </span>
              </div>
              <div className="relative h-64 bg-gradient-to-br from-brand-50 to-indigo-50">
                <svg viewBox="0 0 400 260" className="h-full w-full">
                  <path
                    d="M 60 200 Q 200 60 340 90"
                    fill="none"
                    stroke="#1f47f5"
                    strokeWidth={4}
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    opacity={0.6}
                  />
                  <circle cx={60} cy={200} r={12} fill="#f59e0b" stroke="white" strokeWidth={3} />
                  <circle cx={340} cy={90} r={12} fill="#10b981" stroke="white" strokeWidth={3} />
                  <circle cx={200} cy={118} r={20} fill="#1f47f5" opacity={0.15}>
                    <animate attributeName="r" values="12;28;12" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={200} cy={118} r={11} fill="#1f47f5" stroke="white" strokeWidth={3} />
                </svg>
              </div>
              <div className="grid grid-cols-3 divide-x divide-ink-200 border-t border-ink-200 text-center">
                <div className="px-3 py-3">
                  <p className="text-xs text-ink-500">ETA</p>
                  <p className="text-sm font-bold text-ink-900">9 min</p>
                </div>
                <div className="px-3 py-3">
                  <p className="text-xs text-ink-500">Progress</p>
                  <p className="text-sm font-bold text-ink-900">40%</p>
                </div>
                <div className="px-3 py-3">
                  <p className="text-xs text-ink-500">Driver</p>
                  <p className="text-sm font-bold text-ink-900">D. Bekele</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="grid gap-4 pb-16 sm:grid-cols-3">
          {[
            {
              icon: Route,
              title: "Live route tracking",
              body: "Watch the driver move along the route in real time, from pickup to secured drop-off.",
            },
            {
              icon: BellRing,
              title: "Automatic status updates",
              body: "Every milestone — assigned, picked up, in transit, delivered — is logged and pushed instantly.",
            },
            {
              icon: ShieldCheck,
              title: "Client tracking links",
              body: "Share a secure tracking link. Clients follow their consignment without any account.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-600">{f.body}</p>
            </div>
          ))}
        </section>

        {/* Role entry */}
        <section className="mb-20 rounded-3xl bg-ink-900 px-8 py-10 text-white">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold">Choose a role to begin the demo</h2>
              <p className="mt-1 text-ink-300">
                Three perspectives, one live delivery.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="btn bg-white text-ink-900 hover:bg-ink-100"
              >
                Dispatcher <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/driver"
                className="btn bg-brand-600 text-white hover:bg-brand-500"
              >
                Driver <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/track/CIT-1001"
                className="btn bg-white/10 text-white ring-1 ring-inset ring-white/20 hover:bg-white/20"
              >
                Client <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
