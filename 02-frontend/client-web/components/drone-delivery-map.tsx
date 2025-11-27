"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigation, Package, Timer } from "lucide-react";

const ROUTE_POINTS = [
  { lat: 10.802359, lng: 106.714027 }, // Kho drone
  { lat: 10.797171, lng: 106.700089 },
  { lat: 10.790122, lng: 106.695151 },
  { lat: 10.782536, lng: 106.689406 },
  { lat: 10.775063, lng: 106.683861 },
  { lat: 10.769358, lng: 106.676047 }, // Khách hàng
];

const cardData = [
  {
    title: "Trạng thái",
    value: "Đang bay",
    icon: Package,
  },
  {
    title: "Khoảng cách còn lại",
    value: "~ 2.1 km",
    icon: Navigation,
  },
  {
    title: "Ước tính giao",
    value: "06 phút",
    icon: Timer,
  },
];

// Inner map component - được dynamic import
function LeafletMapInner({ dronePosition }: { dronePosition: { lat: number; lng: number } }) {
  const mapRef = useRef<any>(null);
  const droneMarkerRef = useRef<any>(null);
  const mapInitialized = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (mapInitialized.current) return;
    mapInitialized.current = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Tạo map
      const map = L.map("drone-demo-map", {
        center: [10.785, 106.695],
        zoom: 14,
        scrollWheelZoom: true,
      });

      mapRef.current = map;

      // Tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Polyline
      const routeLatLngs = ROUTE_POINTS.map(p => [p.lat, p.lng] as [number, number]);
      L.polyline(routeLatLngs, { color: "#34d399", weight: 4 }).addTo(map);

      // Warehouse marker
      const warehouseIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      L.marker([ROUTE_POINTS[0].lat, ROUTE_POINTS[0].lng], { icon: warehouseIcon }).addTo(map);

      // Customer marker
      const customerIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      L.marker([ROUTE_POINTS[ROUTE_POINTS.length - 1].lat, ROUTE_POINTS[ROUTE_POINTS.length - 1].lng], { icon: customerIcon }).addTo(map);

      // Drone marker
      const droneIcon = L.divIcon({
        html: `<div style="font-size: 36px; filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.5));">🚁</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        className: "drone-icon-demo",
      });
      droneMarkerRef.current = L.marker([dronePosition.lat, dronePosition.lng], { icon: droneIcon }).addTo(map);

      setIsReady(true);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapInitialized.current = false;
      }
    };
  }, []);

  // Update drone position
  useEffect(() => {
    if (droneMarkerRef.current && isReady) {
      droneMarkerRef.current.setLatLng([dronePosition.lat, dronePosition.lng]);
    }
  }, [dronePosition, isReady]);

  return <div id="drone-demo-map" style={{ height: "100%", width: "100%" }} />;
}

// Dynamic import để tránh SSR
const LeafletMapDemo = dynamic(
  () => Promise.resolve(LeafletMapInner),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-slate-900">
        <span className="text-white/70">🗺️ Đang tải bản đồ...</span>
      </div>
    )
  }
);

export default function DroneDeliveryMap() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 0.995 ? 0 : prev + 0.005));
    }, 120);
    return () => clearInterval(timer);
  }, []);

  const dronePosition = useMemo(() => {
    const segmentCount = ROUTE_POINTS.length - 1;
    const scaledProgress = progress * segmentCount;
    const currentSegment = Math.min(
      Math.floor(scaledProgress),
      ROUTE_POINTS.length - 2
    );
    const intraSegmentProgress = scaledProgress - currentSegment;
    const from = ROUTE_POINTS[currentSegment];
    const to = ROUTE_POINTS[currentSegment + 1];
    return {
      lat: from.lat + (to.lat - from.lat) * intraSegmentProgress,
      lng: from.lng + (to.lng - from.lng) * intraSegmentProgress,
    };
  }, [progress]);

  return (
    <section className="bg-slate-950 py-16">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-col gap-4 text-white md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Drone Delivery
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              Theo dõi lộ trình giao hàng thời gian thực
            </h2>
            <p className="mt-2 text-slate-400">
              Mô phỏng đường bay và vị trí drone khi giao đơn hàng của bạn.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
            <div className="relative h-[420px] w-full">
              <LeafletMapDemo dronePosition={dronePosition} />
              <div className="pointer-events-none absolute left-6 top-6 rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-slate-900 z-[1000]">
                🚁 Live Simulation
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {cardData.map((card) => (
              <div
                key={card.title}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-4 text-white"
              >
                <card.icon className="h-10 w-10 rounded-full bg-white/10 p-2 text-teal-300" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-slate-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-semibold">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

