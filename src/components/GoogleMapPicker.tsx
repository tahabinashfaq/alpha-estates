"use client";

import { Loader } from '@googlemaps/js-api-loader';
import { useCallback, useEffect, useRef, useState } from "react";

// Define Google Maps types correctly
declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
  initialAddress?: string;
}

export function GoogleMapPicker({
  onLocationSelect,
  initialLocation,
  initialAddress
}: GoogleMapPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [address, setAddress] = useState(initialAddress || "");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Reverse geocoding to get address from coordinates - defined first to avoid circular reference
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) return;

    setIsGeocoding(true);

    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        setIsGeocoding(false);

        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const formattedAddress = results[0].formatted_address;
          setAddress(formattedAddress);
          onLocationSelect({ lat, lng, address: formattedAddress });
        } else {
          // Fallback if no address found
          const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setAddress(fallbackAddress);
          onLocationSelect({ lat, lng, address: fallbackAddress });
        }
      }
    );
  }, [onLocationSelect, setAddress]);

  // Handle map click
  const handleMapClick = useCallback((lat: number, lng: number) => {
    const location = { lat, lng };
    setSelectedLocation(location);

    // Update map and marker
    if (map) {
      map.setCenter(location);

      if (marker) {
        marker.setPosition(location);
      } else {
        const newMarker = new google.maps.Marker({
          position: location,
          map: map,
          draggable: true
        });

        setMarker(newMarker);

        // Handle marker drag events
        google.maps.event.addListener(newMarker, 'dragend', () => {
          const position = newMarker.getPosition();
          if (position) {
            reverseGeocode(position.lat(), position.lng());
          }
        });
      }
    }

    // Get the address for the location
    reverseGeocode(lat, lng);
  }, [map, marker, reverseGeocode]);

  // Geocoding to get coordinates from address
  const geocodeAddress = useCallback((addressStr: string) => {
    if (!addressStr.trim() || !geocoderRef.current || !map) return;

    setIsGeocoding(true);

    geocoderRef.current.geocode(
      { address: addressStr },
      (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        setIsGeocoding(false);

        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          const formattedAddress = results[0].formatted_address;

          // Update map and marker
          map.setCenter({ lat, lng });
          map.setZoom(15);
          handleMapClick(lat, lng);

          // Update state and notify parent
          setAddress(formattedAddress);
          onLocationSelect({ lat, lng, address: formattedAddress });
        }
      }
    );
  }, [map, handleMapClick, onLocationSelect]);

  const handleAddressSearch = useCallback(() => {
    geocodeAddress(address);
  }, [address, geocodeAddress]);

  // City preset handler
  const handleCitySelect = useCallback((lat: number, lng: number) => {
    if (map) {
      map.setCenter({ lat, lng });
      map.setZoom(12);
    }
    handleMapClick(lat, lng);
  }, [map, handleMapClick]);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load()
      .then((google) => {
        // Create geocoder instance
        geocoderRef.current = new google.maps.Geocoder();

        // Initialize map
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: initialLocation || { lat: 51.507351, lng: -0.127758 },
          zoom: 12,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#263c3f" }],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#6b9a76" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#38414e" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }],
            },
          ]
        });

        setMap(mapInstance);

        // Add a marker if initialLocation is provided
        if (initialLocation) {
          const newMarker = new google.maps.Marker({
            position: initialLocation,
            map: mapInstance,
            draggable: true
          });

          setMarker(newMarker);

          // Handle marker drag events
          google.maps.event.addListener(newMarker, 'dragend', () => {
            const position = newMarker.getPosition();
            if (position) {
              const lat = position.lat();
              const lng = position.lng();
              reverseGeocode(lat, lng);
            }
          });
        }

        // Handle map click events
        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            handleMapClick(lat, lng);
          }
        });
      })
      .catch((err: Error) => {
        console.error("Error loading Google Maps:", err);
      });
  }, [initialLocation, handleMapClick, reverseGeocode]);

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Search address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddressSearch();
            }
          }}
          className="flex-1 bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
        />
        <button
          type="button"
          onClick={handleAddressSearch}
          disabled={isGeocoding}
          className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isGeocoding ? "..." : "🔍"}
        </button>
      </div>

      <div className="rounded-lg overflow-hidden">
        <div
          ref={mapRef}
          className="w-full h-80 bg-gray-800"
        />
      </div>

      {selectedLocation && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 text-lg">📍</span>
            <div>
              <h4 className="text-blue-400 font-medium">Selected Location</h4>
              <p className="text-gray-300 text-sm mt-1">
                {address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { name: "London", lat: 51.507351, lng: -0.127758 },
          { name: "Manchester", lat: 53.480759, lng: -2.242631 },
          { name: "Birmingham", lat: 52.486243, lng: -1.890401 },
          { name: "Edinburgh", lat: 55.953251, lng: -3.188267 }
        ].map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => handleCitySelect(city.lat, city.lng)}
            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded hover:bg-gray-600 transition-colors"
          >
            📍 {city.name}
          </button>
        ))}
      </div>
    </div>
  );
}
