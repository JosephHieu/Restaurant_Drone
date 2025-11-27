"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface LocationPickerLeafletProps {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationChange: (coords: { lat: number; lng: number }) => void;
  isResolvingAddress?: boolean;
}

const DEFAULT_CENTER = {
  lat: 10.776889,
  lng: 106.700806,
};

// Component bản đồ thực sự - sử dụng Leaflet API trực tiếp
function LeafletMapInner({
  selectedLocation,
  onLocationChange,
  center,
}: {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationChange: (coords: { lat: number; lng: number }) => void;
  center: { lat: number; lng: number };
}) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapInitialized = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const mapContainerId = useRef(`location-picker-map-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (mapInitialized.current) return;
    mapInitialized.current = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Tạo map
      const map = L.map(mapContainerId.current, {
        center: [center.lat, center.lng],
        zoom: selectedLocation ? 16 : 13,
        scrollWheelZoom: true,
      });

      mapRef.current = map;

      // Tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Customer marker icon
      const customerIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      // Thêm marker nếu đã có vị trí
      if (selectedLocation) {
        markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], { icon: customerIcon }).addTo(map);
      }

      // Xử lý click trên bản đồ
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        
        // Cập nhật hoặc tạo marker mới
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: customerIcon }).addTo(map);
        }
        
        // Gọi callback
        onLocationChange({ lat, lng });
      });

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

  // Cập nhật marker khi selectedLocation thay đổi từ bên ngoài
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    const updateMarker = async () => {
      const L = (await import("leaflet")).default;
      
      const customerIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      if (selectedLocation) {
        if (markerRef.current) {
          markerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
        } else {
          markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], { icon: customerIcon }).addTo(mapRef.current);
        }
        mapRef.current.setView([selectedLocation.lat, selectedLocation.lng], 16);
      }
    };

    updateMarker();
  }, [selectedLocation, isReady]);

  return <div id={mapContainerId.current} style={{ height: "100%", width: "100%" }} />;
}

export default function LocationPickerLeaflet({
  selectedLocation,
  onLocationChange,
  isResolvingAddress = false,
}: LocationPickerLeafletProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  const center = useMemo(
    () => selectedLocation ?? DEFAULT_CENTER,
    [selectedLocation]
  );

  // Chỉ render sau khi component mount ở client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative h-64 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        {isMounted ? (
          <LeafletMapInner
            selectedLocation={selectedLocation}
            onLocationChange={onLocationChange}
            center={center}
          />
        ) : (
          <div className="h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500">🗺️ Đang tải bản đồ...</span>
          </div>
        )}
        
        {/* Badge hướng dẫn */}
        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow z-[1000]">
          🖱️ Nhấn vào bản đồ để chọn vị trí
        </div>
      </div>
      
      {/* Hiển thị tọa độ đã chọn */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4 text-red-500" />
        {selectedLocation ? (
          <span>
            📍 {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}{" "}
            {isResolvingAddress && <span className="text-orange-500">(đang lấy địa chỉ...)</span>}
          </span>
        ) : (
          <span className="text-gray-400">Chưa chọn vị trí - Hãy nhấn vào bản đồ</span>
        )}
      </div>
    </div>
  );
}
