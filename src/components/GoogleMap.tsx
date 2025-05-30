/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useRef, useState } from 'react';
import { Property } from './PropertyList';

interface GoogleMapProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  showNeighborhoodInfo?: boolean;
  onPropertyClick?: (property: Property) => void;
}

export function GoogleMap({
  properties,
  center,
  zoom = 12,
  className = "w-full h-full",
  showNeighborhoodInfo = true,
  onPropertyClick
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Default center (New York City)
  const defaultCenter = center || { lat: 40.7128, lng: -74.0060 };

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
      setError('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.');
      setIsLoading(false);
      return;
    }

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          version: 'weekly',
          libraries: ['places', 'geometry'],
        });

        const { Map } = await loader.importLibrary('maps');
        const { AdvancedMarkerElement } = await loader.importLibrary('marker');

        if (!mapRef.current) return;

        // Calculate bounds if properties have coordinates
        const propertiesWithCoords = properties.filter(p => p.lat && p.lng);
        let mapCenter = defaultCenter;
        let mapZoom = zoom;

        if (propertiesWithCoords.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          propertiesWithCoords.forEach(property => {
            bounds.extend(new google.maps.LatLng(property.lat!, property.lng!));
          });

          if (propertiesWithCoords.length === 1) {
            mapCenter = { lat: propertiesWithCoords[0].lat!, lng: propertiesWithCoords[0].lng! };
            mapZoom = 15;
          }
        }

        const mapInstance = new Map(mapRef.current, {
          center: mapCenter,
          zoom: mapZoom,
          mapId: 'alpha-estates-map', // Required for AdvancedMarkerElement
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        setMap(mapInstance);

        // Fit bounds if multiple properties
        if (propertiesWithCoords.length > 1) {
          const bounds = new google.maps.LatLngBounds();
          propertiesWithCoords.forEach(property => {
            bounds.extend(new google.maps.LatLng(property.lat!, property.lng!));
          });
          mapInstance.fitBounds(bounds);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load Google Maps. Please check your API key and internet connection.');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [center, zoom, defaultCenter, properties]);

  // Add markers when map is ready or properties change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    // Close existing info window
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // Create info window
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    // Add markers for properties with coordinates
    properties.forEach((property, index) => {
      const lat = property.lat || (defaultCenter.lat + (index * 0.01));
      const lng = property.lng || (defaultCenter.lng + (index * 0.01));

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.innerHTML = `
        <div class="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg border-2 border-white transform hover:scale-110 transition-transform cursor-pointer">
          <div class="text-sm font-bold">$${property.price.toLocaleString()}</div>
          <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600 mx-auto"></div>
        </div>
      `;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: property.title,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 0C8.96 0 0 8.96 0 20c0 11.04 20 30 20 30s20-18.96 20-30C40 8.96 31.04 0 20 0z" fill="#2563eb"/>
              <circle cx="20" cy="20" r="8" fill="white"/>
              <text x="20" y="25" text-anchor="middle" fill="#2563eb" font-size="10" font-weight="bold">$</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(40, 50),
          anchor: new google.maps.Point(20, 50),
        },
      });

      // Add click listener
      marker.addListener('click', () => {
        const content = `
          <div class="max-w-xs">
            <div class="mb-3">
              <img src="${property.imageUrl || '/placeholder-property.jpg'}"
                   alt="${property.title}"
                   class="w-full h-32 object-cover rounded-lg"/>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">${property.title}</h3>
            <p class="text-gray-600 mb-2">${property.location || property.address || 'Location not specified'}</p>
            <div class="flex justify-between items-center mb-3">
              <span class="text-2xl font-bold text-blue-600">$${property.price.toLocaleString()}</span>
              ${property.listingType ? `<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">For ${property.listingType === 'sale' ? 'Sale' : 'Rent'}</span>` : ''}
            </div>
            ${property.beds || property.baths ? `
              <div class="flex gap-4 text-sm text-gray-600 mb-3">
                ${property.beds ? `<span>🛏️ ${property.beds} bed${property.beds !== 1 ? 's' : ''}</span>` : ''}
                ${property.baths ? `<span>🚿 ${property.baths} bath${property.baths !== 1 ? 's' : ''}</span>` : ''}
              </div>
            ` : ''}
            <div class="flex gap-2">
              <a href="/properties/${property.id}"
                 class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex-1 text-center">
                View Details
              </a>
              ${showNeighborhoodInfo ? `
                <button onclick="showNeighborhoodInfo('${property.location || property.address}')"
                        class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                  Neighborhood
                </button>
              ` : ''}
            </div>
          </div>
        `;

        infoWindowRef.current!.setContent(content);
        infoWindowRef.current!.open(map, marker);

        // Call onPropertyClick if provided
        if (onPropertyClick) {
          onPropertyClick(property);
        }
      });

      markersRef.current.push(marker);
    });
  }, [map, properties, showNeighborhoodInfo, onPropertyClick, defaultCenter]);

  // Add neighborhood info functionality to window
  useEffect(() => {
    (window as any).showNeighborhoodInfo = (location: string) => {
      // This could integrate with a real neighborhood data service
      alert(`Neighborhood information for ${location} would be displayed here. This could include:\n\n• School ratings\n• Crime statistics\n• Local amenities\n• Transportation options\n• Market trends`);
    };

    return () => {
      delete (window as any).showNeighborhoodInfo;
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Maps Not Available</h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <a
            href="https://console.cloud.google.com/google/maps-apis/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Get API Key
          </a>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
}

export default GoogleMap;
