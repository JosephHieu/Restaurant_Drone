"use client";

import { useCallback, useMemo } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Loader2, MapPin } from "lucide-react";

interface LocationPickerMapProps {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationChange: (coords: { lat: number; lng: number }) => void;
  isResolvingAddress?: boolean;
}

const DEFAULT_CENTER = {
  lat: 10.776889,
  lng: 106.700806,
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  styles: [
    {
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }],
    },
    {
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#f5f5f5" }],
    },
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#e5e5e5" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#dadada" }],
    },
    {
      featureType: "transit",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#c9c9c9" }],
    },
  ],
};

export default function LocationPickerMap({
  selectedLocation,
  onLocationChange,
  isResolvingAddress = false,
}: LocationPickerMapProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: "checkout-location-picker",
    googleMapsApiKey: googleMapsApiKey || "",
  });

  const center = useMemo(
    () => selectedLocation ?? DEFAULT_CENTER,
    [selectedLocation]
  );

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      onLocationChange({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    },
    [onLocationChange]
  );

  if (!googleMapsApiKey) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        Thiết lập biến môi trường <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
        để bật bản đồ chọn địa điểm.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
        Không tải được bản đồ Google. Vui lòng kiểm tra API key của bạn.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative h-64 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        {!isLoaded ? (
          <div className="flex h-full w-full items-center justify-center bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <GoogleMap
            mapContainerClassName="absolute inset-0"
            center={center}
            zoom={selectedLocation ? 16 : 13}
            options={mapOptions}
            onClick={handleMapClick}
          >
            {selectedLocation && <Marker position={selectedLocation} />}
          </GoogleMap>
        )}
        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow">
          Nhấn vào bản đồ để chọn vị trí
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4 text-red-500" />
        {selectedLocation ? (
          <span>
            {selectedLocation.lat.toFixed(5)},{" "}
            {selectedLocation.lng.toFixed(5)}{" "}
            {isResolvingAddress && "(đang lấy địa chỉ...)"}
          </span>
        ) : (
          <span>Chưa chọn vị trí</span>
        )}
      </div>
    </div>
  );
}

