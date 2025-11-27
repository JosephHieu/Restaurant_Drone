"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface DroneTrackingMapProps {
  restaurantLocation: { lat: number; lng: number };
  customerLocation: { lat: number; lng: number };
  isDelivering: boolean;
  onDeliveryComplete?: () => void;
  animationDuration?: number;
  orderId?: number; // Thêm orderId để track animation state
}

// Component bản đồ - sử dụng Leaflet API trực tiếp
function LeafletMapInner({
  restaurantLocation,
  customerLocation,
  dronePosition,
}: {
  restaurantLocation: { lat: number; lng: number };
  customerLocation: { lat: number; lng: number };
  dronePosition: { lat: number; lng: number };
}) {
  const mapRef = useRef<any>(null);
  const droneMarkerRef = useRef<any>(null);
  const mapInitialized = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const mapContainerId = useRef(`drone-tracking-map-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (mapInitialized.current) return;
    mapInitialized.current = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Tính center và bounds
      const centerLat = (restaurantLocation.lat + customerLocation.lat) / 2;
      const centerLng = (restaurantLocation.lng + customerLocation.lng) / 2;

      // Tạo map
      const map = L.map(mapContainerId.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        scrollWheelZoom: true,
      });

      mapRef.current = map;

      // Tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Fit bounds
      const bounds = L.latLngBounds(
        [restaurantLocation.lat, restaurantLocation.lng],
        [customerLocation.lat, customerLocation.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });

      // Route line
      L.polyline(
        [
          [restaurantLocation.lat, restaurantLocation.lng],
          [customerLocation.lat, customerLocation.lng],
        ],
        { color: "#3b82f6", weight: 3, dashArray: "10, 10" }
      ).addTo(map);

      // Restaurant marker
      const restaurantIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      L.marker([restaurantLocation.lat, restaurantLocation.lng], { icon: restaurantIcon }).addTo(map);

      // Customer marker
      const customerIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      L.marker([customerLocation.lat, customerLocation.lng], { icon: customerIcon }).addTo(map);

      // Drone marker
      const droneIcon = L.divIcon({
        html: `<div style="font-size: 32px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));">🚁</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        className: "drone-icon",
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

  return <div id={mapContainerId.current} style={{ height: "100%", width: "100%" }} />;
}

export default function DroneTrackingMap({
  restaurantLocation,
  customerLocation,
  isDelivering,
  onDeliveryComplete,
  animationDuration = 5000,
  orderId,
}: DroneTrackingMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [dronePosition, setDronePosition] = useState(restaurantLocation);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasCalledCompleteRef = useRef(false);

  // Chỉ render sau khi mount ở client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animation drone - bắt đầu ngay khi mount và isDelivering = true
  useEffect(() => {
    if (!isMounted || !isDelivering) {
      return;
    }

    // Bắt đầu animation
    console.log("🚁 Bắt đầu animation drone...");
    setProgress(0);
    setDronePosition(restaurantLocation);
    startTimeRef.current = Date.now();
    hasCalledCompleteRef.current = false;

    const animate = () => {
      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      const progressPercent = Math.min((elapsed / animationDuration) * 100, 100);
      
      setProgress(progressPercent);

      const lat = restaurantLocation.lat + (customerLocation.lat - restaurantLocation.lat) * (progressPercent / 100);
      const lng = restaurantLocation.lng + (customerLocation.lng - restaurantLocation.lng) * (progressPercent / 100);
      
      setDronePosition({ lat, lng });

      if (progressPercent < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        console.log("🚁 Animation hoàn thành! Drone đã đến nơi.");
        // Chỉ gọi callback 1 lần
        if (onDeliveryComplete && !hasCalledCompleteRef.current) {
          hasCalledCompleteRef.current = true;
          onDeliveryComplete();
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMounted]); // Chỉ chạy 1 lần khi mounted

  return (
    <div className="space-y-3">
      {/* Thanh tiến trình */}
      <div className="bg-gray-100 rounded-lg p-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">🚁 Trạng thái giao hàng</span>
          <span className="text-blue-600 font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 via-blue-500 to-red-500 h-3 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>🏪 Nhà hàng</span>
          <span>🏠 Địa chỉ của bạn</span>
        </div>
      </div>

      {/* Bản đồ */}
      <div className="relative h-72 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        {isMounted ? (
          <LeafletMapInner
            restaurantLocation={restaurantLocation}
            customerLocation={customerLocation}
            dronePosition={dronePosition}
          />
        ) : (
          <div className="h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500">🗺️ Đang tải bản đồ...</span>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 rounded-lg px-3 py-2 shadow-lg z-[1000] text-xs">
          <div className="flex items-center gap-4">
            <span>🟢 Nhà hàng</span>
            <span>🔴 Bạn</span>
            <span>🚁 Drone</span>
          </div>
        </div>

        {/* Status badge */}
        <div className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold shadow-lg z-[1000] ${
          progress >= 100 
            ? "bg-green-500 text-white" 
            : "bg-blue-500 text-white animate-pulse"
        }`}>
          {progress >= 100 ? "✅ Đã giao xong!" : "🚁 Đang giao hàng..."}
        </div>
      </div>

      {/* Thông tin thời gian */}
      <div className="text-center text-sm text-gray-600">
        {progress >= 100 ? (
          <span className="text-green-600 font-semibold">
            🎉 Đơn hàng đã được giao thành công!
          </span>
        ) : (
          <span>
            ⏱️ Thời gian giao dự kiến: <strong>{Math.ceil((animationDuration - (progress / 100 * animationDuration)) / 1000)}s</strong>
          </span>
        )}
      </div>
    </div>
  );
}
