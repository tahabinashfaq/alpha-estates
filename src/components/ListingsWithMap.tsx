"use client";

import dynamic from "next/dynamic";
import { Property, PropertyList } from "./PropertyList";

const MapWithNoSSR = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

interface ListingsWithMapProps {
  properties: Property[];
}

export function ListingsWithMap({ properties }: ListingsWithMapProps) {
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
          ) : (<PropertyList
            properties={properties}
            showSaveButton={true}
          />
          )}
        </div>
      </div>

      {/* Map Side */}
      <div className="w-full lg:w-1/2">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden h-full">
          <div className="h-full min-h-[400px]">
            <MapWithNoSSR properties={properties} />
          </div>
        </div>
      </div>
    </div>
  );
}
