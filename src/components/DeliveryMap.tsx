"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Truck, MapPin, Flag } from "lucide-react";
import type { DeliveryStatus } from "@/lib/domain";

export interface MapPoint {
  lat: number;
  lng: number;
}

interface DeliveryMapProps {
  pickup: MapPoint;
  destination: MapPoint;
  current: MapPoint | null;
  status: DeliveryStatus;
  progress: number;
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function DeliveryMap(props: DeliveryMapProps) {
  const hasToken = typeof MAPBOX_TOKEN === "string" && MAPBOX_TOKEN.startsWith("pk.");
  if (hasToken) return <MapboxMap {...props} />;
  return <FallbackMap {...props} />;
}

/* ==========================================================================
 * Mapbox implementation (used when NEXT_PUBLIC_MAPBOX_TOKEN is set)
 * ======================================================================== */
function MapboxMap({
  pickup,
  destination,
  current,
  progress,
  className,
}: DeliveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !containerRef.current) return;
      mapboxgl.accessToken = MAPBOX_TOKEN as string;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [
          (pickup.lng + destination.lng) / 2,
          (pickup.lat + destination.lat) / 2,
        ],
        zoom: 12,
        attributionControl: false,
      });
      mapRef.current = map;

      map.on("load", () => {
        if (cancelled) return;

        // Route line
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [pickup.lng, pickup.lat],
                [destination.lng, destination.lat],
              ],
            },
          },
        });
        map.addLayer({
          id: "route-casing",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#1f47f5", "line-width": 7, "line-opacity": 0.15 },
        });
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#1f47f5", "line-width": 3.5 },
        });

        // Pickup + destination markers
        const pk = document.createElement("div");
        pk.className = "cit-marker cit-marker-pickup";
        pk.innerHTML = "A";
        new mapboxgl.Marker({ element: pk })
          .setLngLat([pickup.lng, pickup.lat])
          .addTo(map);

        const dt = document.createElement("div");
        dt.className = "cit-marker cit-marker-dest";
        dt.innerHTML = "B";
        new mapboxgl.Marker({ element: dt })
          .setLngLat([destination.lng, destination.lat])
          .addTo(map);

        // Driver marker
        const dv = document.createElement("div");
        dv.className = "cit-driver-marker";
        dv.innerHTML =
          '<span class="cit-driver-pulse"></span><span class="cit-driver-dot"></span>';
        const start = current ?? pickup;
        driverMarkerRef.current = new mapboxgl.Marker({ element: dv })
          .setLngLat([start.lng, start.lat])
          .addTo(map);

        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([pickup.lng, pickup.lat]);
        bounds.extend([destination.lng, destination.lat]);
        map.fitBounds(bounds, { padding: 70, duration: 0 });
        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move driver marker as position updates.
  useEffect(() => {
    if (!ready || !driverMarkerRef.current) return;
    const pos = current ?? pickup;
    driverMarkerRef.current.setLngLat([pos.lng, pos.lat]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.lat, current?.lng, ready, progress]);

  return (
    <div className={className}>
      <div ref={containerRef} className="h-full w-full rounded-2xl" />
      <style jsx global>{`
        .cit-marker {
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          border: 2px solid white;
        }
        .cit-marker-pickup {
          background: #f59e0b;
        }
        .cit-marker-dest {
          background: #10b981;
        }
        .cit-driver-marker {
          position: relative;
          width: 20px;
          height: 20px;
        }
        .cit-driver-dot {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #1f47f5;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(31, 71, 245, 0.5);
        }
        .cit-driver-pulse {
          position: absolute;
          inset: -6px;
          border-radius: 9999px;
          background: rgba(31, 71, 245, 0.35);
          animation: cit-pulse 1.8s ease-out infinite;
        }
        @keyframes cit-pulse {
          0% {
            transform: scale(0.6);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/* ==========================================================================
 * Fallback map (no token required) — stylized, animated SVG "map"
 * ======================================================================== */
function FallbackMap({
  pickup,
  destination,
  current,
  status,
  className,
}: DeliveryMapProps) {
  const W = 800;
  const H = 500;
  const PAD = 90;

  const project = useMemo(() => {
    const pts = [pickup, destination, current ?? pickup];
    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLng = Math.min(...lngs);
    let maxLng = Math.max(...lngs);
    // Guard against zero-size bounds.
    if (maxLat - minLat < 1e-4) {
      minLat -= 0.01;
      maxLat += 0.01;
    }
    if (maxLng - minLng < 1e-4) {
      minLng -= 0.01;
      maxLng += 0.01;
    }
    return (p: MapPoint) => {
      const x = PAD + ((p.lng - minLng) / (maxLng - minLng)) * (W - 2 * PAD);
      const y =
        PAD + ((maxLat - p.lat) / (maxLat - minLat)) * (H - 2 * PAD);
      return { x, y };
    };
  }, [pickup, destination, current]);

  const a = project(pickup);
  const b = project(destination);
  const driver = project(current ?? pickup);

  // Build a gently curved path between A and B for a more map-like route.
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const norm = Math.hypot(dx, dy) || 1;
  const curve = 40;
  const cx = mx + (-dy / norm) * curve;
  const cy = my + (dx / norm) * curve;
  const routePath = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;

  const delivered = status === "DELIVERED";

  // Decorative "streets" grid.
  const gridLines = [];
  for (let i = 1; i < 8; i++) {
    gridLines.push(
      <line
        key={`v${i}`}
        x1={(W / 8) * i}
        y1={0}
        x2={(W / 8) * i}
        y2={H}
        stroke="#e6eaf1"
        strokeWidth={i % 2 === 0 ? 2 : 1}
      />
    );
  }
  for (let i = 1; i < 5; i++) {
    gridLines.push(
      <line
        key={`h${i}`}
        x1={0}
        y1={(H / 5) * i}
        x2={W}
        y2={(H / 5) * i}
        stroke="#e6eaf1"
        strokeWidth={i % 2 === 0 ? 2 : 1}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className ?? ""}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        style={{ background: "linear-gradient(180deg,#f3f6fb 0%,#eaf0f8 100%)" }}
      >
        {/* subtle block shapes */}
        <g opacity={0.5}>
          <rect x={90} y={70} width={120} height={90} rx={8} fill="#eef2f8" />
          <rect x={560} y={110} width={150} height={110} rx={8} fill="#eef2f8" />
          <rect x={300} y={300} width={160} height={120} rx={8} fill="#eef2f8" />
          <rect x={120} y={330} width={110} height={90} rx={8} fill="#eef2f8" />
        </g>
        {gridLines}

        {/* route casing + line */}
        <path
          d={routePath}
          fill="none"
          stroke="#1f47f5"
          strokeOpacity={0.15}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          d={routePath}
          fill="none"
          stroke="#1f47f5"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="1 14"
          className="cit-route-flow"
        />

        {/* pickup marker */}
        <g>
          <circle cx={a.x} cy={a.y} r={16} fill="#f59e0b" stroke="white" strokeWidth={3} />
          <text
            x={a.x}
            y={a.y + 5}
            textAnchor="middle"
            fontSize={14}
            fontWeight={700}
            fill="white"
          >
            A
          </text>
        </g>

        {/* destination marker */}
        <g>
          <circle cx={b.x} cy={b.y} r={16} fill="#10b981" stroke="white" strokeWidth={3} />
          <text
            x={b.x}
            y={b.y + 5}
            textAnchor="middle"
            fontSize={14}
            fontWeight={700}
            fill="white"
          >
            B
          </text>
        </g>

        {/* driver marker (animated position) */}
        <g
          style={{
            transform: `translate(${driver.x}px, ${driver.y}px)`,
            transition: "transform 1.35s linear",
          }}
        >
          {!delivered && (
            <circle r={22} fill="#1f47f5" opacity={0.18} className="cit-driver-halo" />
          )}
          <circle r={15} fill="#1f47f5" stroke="white" strokeWidth={3} />
        </g>
      </svg>

      {/* Vehicle icon overlaid on driver marker, kept in sync via % positioning */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: `${(driver.x / W) * 100}%`,
          top: `${(driver.y / H) * 100}%`,
          transform: "translate(-50%, -50%)",
          transition: "left 1.35s linear, top 1.35s linear",
        }}
      >
        <Truck className="h-4 w-4 text-white drop-shadow" />
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
        <span className="flex items-center gap-2 font-medium text-ink-700">
          <MapPin className="h-3.5 w-3.5 text-amber-500" /> Pickup
        </span>
        <span className="flex items-center gap-2 font-medium text-ink-700">
          <Truck className="h-3.5 w-3.5 text-brand-600" /> Driver
        </span>
        <span className="flex items-center gap-2 font-medium text-ink-700">
          <Flag className="h-3.5 w-3.5 text-emerald-500" /> Destination
        </span>
      </div>

      <div className="absolute right-3 top-3 rounded-lg bg-white/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-ink-500 shadow-sm backdrop-blur">
        Live Map
      </div>

      <style jsx>{`
        .cit-route-flow {
          animation: cit-dash 1s linear infinite;
        }
        @keyframes cit-dash {
          to {
            stroke-dashoffset: -15;
          }
        }
        .cit-driver-halo {
          animation: cit-halo 1.8s ease-out infinite;
          transform-origin: center;
        }
        @keyframes cit-halo {
          0% {
            opacity: 0.35;
            r: 15;
          }
          100% {
            opacity: 0;
            r: 34;
          }
        }
      `}</style>
    </div>
  );
}
