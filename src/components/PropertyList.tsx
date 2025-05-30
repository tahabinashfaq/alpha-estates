/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import Link from "next/link";
import { BookmarkButton } from "./BookmarkButton";
import { ComparePropertyButton } from "./ComparePropertyButton";

export interface Property {
  id: string;
  title: string;
  address?: string;
  price: number;
  imageUrl: string;
  imageUrls?: string[]; // New field for multiple images
  realtorId: string;
  location?: string;
  description?: string;
  type?: string;
  beds?: number;
  baths?: number;
  lat?: number;
  lng?: number;
  squareFeet?: number;
  yearBuilt?: number;
  features?: string[];
  listingType?: 'sale' | 'rent' | string;
  createdAt?: any;
  // Enhanced Property Details (FR006)
  lotSize?: number;
  parkingSpaces?: number;
  floorPlans?: FloorPlan[];
  virtualTours?: VirtualTour[];
  specifications?: {
    interior?: Record<string, string>;
    exterior?: Record<string, string>;
    utilities?: Record<string, string>;
    community?: Record<string, string>;
  };
  // Interactive Property Visualization (FR004)
  visualizations?: PropertyVisualization[];
}

// Supporting interfaces for Enhanced Property Details
export interface FloorPlan {
  id: string;
  name: string;
  imageUrl: string;
  level?: string;
  area?: number;
  rooms?: string[];
}

export interface VirtualTour {
  id: string;
  name: string;
  type: '360' | 'video' | 'slideshow';
  url: string;
  thumbnail?: string;
  duration?: number; // for videos
  roomCount?: number; // for 360 tours
}

// Interactive Property Visualization (FR004)
export interface PropertyVisualization {
  type: 'gallery' | 'virtual-tour' | 'floor-plan' | '3d-model';
  title: string;
  data: any;
}

interface PropertyCardProps {
  property: Property;
  actionButton?: (id: string) => React.ReactNode;
  showSaveButton?: boolean;
}

export function PropertyCard({ property, actionButton, showSaveButton }: PropertyCardProps) {
  const displayImage = property.imageUrls && property.imageUrls.length > 0 ? property.imageUrls[0] : property.imageUrl;
  const totalImages = property.imageUrls ? property.imageUrls.length : 1;

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
      <div className="relative overflow-hidden">
        <Image
          src={displayImage}
          alt={property.title}
          width={400}
          height={280}
          className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Property Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide shadow-lg">
            {property.type || 'Property'}
          </span>
        </div>

        {/* Multiple Images Indicator */}
        {totalImages > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{totalImages}</span>
            </div>
          </div>
        )}        {/* Bookmark Button */}
        {showSaveButton && (
          <div className="absolute top-4 right-4">
            <BookmarkButton propertyId={property.id} />
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
            <span className="text-lg font-bold">${property.price.toLocaleString()}</span>
            {property.listingType && (
              <span className="text-sm opacity-90 ml-1">
                /{property.listingType === 'rent' ? 'month' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-6">
        {/* Title and Location */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium">{property.location || property.address}</span>
          </div>
        </div>

        {/* Property Details */}
        {(property.beds || property.baths || property.squareFeet) && (
          <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-lg p-3">
            {property.beds && (
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.5a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 20v-6l18-6v6l-18 6z" />
                </svg>
                <span className="font-semibold">{property.beds}</span>
                <span className="text-sm ml-1">bed{property.beds !== 1 ? 's' : ''}</span>
              </div>
            )}
            {property.baths && (
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <span className="font-semibold">{property.baths}</span>
                <span className="text-sm ml-1">bath{property.baths !== 1 ? 's' : ''}</span>
              </div>
            )}
            {property.squareFeet && (
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="font-semibold">{property.squareFeet?.toLocaleString()}</span>
                <span className="text-sm ml-1">sq ft</span>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {property.features.slice(0, 3).map((feature, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  {feature}
                </span>
              ))}
              {property.features.length > 3 && (
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                  +{property.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            href={`/properties/${property.id}`}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            View Details
          </Link>
          <ComparePropertyButton property={property} />
        </div>

        {/* Custom Action Button */}
        {actionButton && (
          <div className="mt-3">
            {actionButton(property.id)}
          </div>
        )}
      </div>
    </div>
  );
}

export interface PropertyListProps {
  properties: Property[];
  actionButton?: (id: string) => React.ReactNode;
  showSaveButton?: boolean;
}

export function PropertyList({ properties, actionButton, showSaveButton }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-gray-200">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties Found</h3>
          <p className="text-gray-600">Try adjusting your search criteria to find more properties.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">      {properties.map((property) => (
      <PropertyCard
        key={property.id}
        property={property}
        actionButton={actionButton}
        showSaveButton={showSaveButton}
      />
    ))}
    </div>
  );
}
