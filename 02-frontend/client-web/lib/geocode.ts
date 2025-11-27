"use client";

export interface ReverseGeocodeResult {
  formattedAddress: string | null;
  placeId: string | null;
}

/**
 * Resolve a human-friendly address from latitude & longitude using
 * OpenStreetMap Nominatim API (FREE - không cần API key)
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`,
      {
        headers: {
          "User-Agent": "RestaurantDroneApp/1.0", // Nominatim yêu cầu User-Agent
        },
      }
    );
    
    if (!response.ok) {
      return { formattedAddress: null, placeId: null };
    }
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return {
        formattedAddress: data.display_name,
        placeId: data.place_id?.toString() ?? null,
      };
    }
  } catch (error) {
    console.error("reverseGeocode error", error);
  }

  return { formattedAddress: null, placeId: null };
}

