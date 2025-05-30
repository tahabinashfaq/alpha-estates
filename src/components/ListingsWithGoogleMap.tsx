/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Property } from "./PropertyList";

const GoogleMapWithNoSSR = dynamic(() => import("./GoogleMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading Google Maps...</p>
      </div>
    </div>
  )
});

interface ListingsWithGoogleMapProps {
  properties: Property[];
  savedIds: string[];
  onSaveToggle: (id: string, save: boolean) => void;
  selectedProperty?: Property | null;
  onPropertySelect?: (property: Property | null) => void;
}

export function ListingsWithGoogleMap({
  properties,
  savedIds,
  onSaveToggle,
  selectedProperty,
  onPropertySelect
}: ListingsWithGoogleMapProps) {
  const handlePropertyClick = (property: Property) => {
    if (onPropertySelect) {
      onPropertySelect(selectedProperty?.id === property.id ? null : property);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[800px]">
      {/* Property List Side */}
      <div className="w-full lg:w-1/2 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-sm border">
          {properties.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600">Try adjusting your search filters to find more properties.</p>
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Found
                </h3>
                <div className="text-sm text-gray-600">
                  {selectedProperty ? `Selected: ${selectedProperty.title}` : 'Click a property to highlight on map'}
                </div>
              </div>

              <div className="space-y-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedProperty?.id === property.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    onClick={() => handlePropertyClick(property)}
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={property.imageUrl || '/placeholder-property.jpg'}
                          alt={property.title}
                          className="w-full h-full object-cover"
                          width={100}
                          height={100}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{property.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">{property.location || property.address}</p>
                        <p className="text-lg font-bold text-blue-600">${property.price.toLocaleString()}</p>
                        {(property.beds || property.baths) && (
                          <div className="flex gap-3 text-sm text-gray-600 mt-1">
                            {property.beds && <span>🛏️ {property.beds} bed{property.beds !== 1 ? 's' : ''}</span>}
                            {property.baths && <span>🚿 {property.baths} bath{property.baths !== 1 ? 's' : ''}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Google Map Side */}
      <div className="w-full lg:w-1/2">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden h-full">
          <div className="h-full min-h-[400px] flex items-center justify-center">
            {selectedProperty ? (
              <GoogleMapWithNoSSR
                properties={[selectedProperty]}
                showNeighborhoodInfo={true}
                onPropertyClick={handlePropertyClick}
                center={{
                  lat: selectedProperty.lat ?? 40.7128,
                  lng: selectedProperty.lng ?? -74.0060
                }}
                zoom={15}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-8">
                <svg className="w-16 h-16 mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-xl font-semibold mb-2">Select a property to view on the map</h3>
                <p className="text-gray-600">Click a property from the list to see its location here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingsWithGoogleMap;
