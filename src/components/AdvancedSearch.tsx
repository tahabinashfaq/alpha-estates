"use client";
import { useState } from "react";

interface AdvancedSearchProps {
  onSearch: (criteria: SearchCriteria) => void;
  onClose: () => void;
}

interface SearchCriteria {
  keywords: string;
  priceRange: { min: number; max: number };
  bedrooms: string;
  bathrooms: string;
  propertyType: string[];
  yearBuilt: { min: number; max: number };
  squareFootage: { min: number; max: number };
  features: string[];
  schoolDistrict: string;
  commuteTo: string;
  maxCommuteTime: number;
  listingAge: string;
  openHouse: boolean;
  virtualTour: boolean;
  newConstruction: boolean;
  foreclosure: boolean;
  priceReduced: boolean;
}

export function AdvancedSearch({ onSearch, onClose }: AdvancedSearchProps) {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    keywords: "",
    priceRange: { min: 0, max: 10000000 },
    bedrooms: "",
    bathrooms: "",
    propertyType: [],
    yearBuilt: { min: 1900, max: new Date().getFullYear() },
    squareFootage: { min: 0, max: 10000 },
    features: [],
    schoolDistrict: "",
    commuteTo: "",
    maxCommuteTime: 30,
    listingAge: "",
    openHouse: false,
    virtualTour: false,
    newConstruction: false,
    foreclosure: false,
    priceReduced: false
  });

  const propertyTypes = ["House", "Condo", "Townhouse", "Apartment", "Villa", "Land", "Commercial"];
  const features = [
    "Pool", "Garage", "Garden", "Fireplace", "Balcony", "Parking",
    "Air Conditioning", "Heating", "Hardwood Floors", "Updated Kitchen",
    "Walk-in Closet", "Laundry Room", "Security System", "Gym",
    "Waterfront", "Mountain View", "City View", "Gated Community",
    "Pet Friendly", "Senior Living", "Wheelchair Accessible"
  ];

  const handlePropertyTypeToggle = (type: string) => {
    setCriteria(prev => ({
      ...prev,
      propertyType: prev.propertyType.includes(type)
        ? prev.propertyType.filter(t => t !== type)
        : [...prev.propertyType, type]
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setCriteria(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4 text-gray-900">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
            <input
              type="text"
              placeholder="e.g., waterfront, luxury, updated"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={criteria.keywords}
              onChange={e => setCriteria(prev => ({ ...prev, keywords: e.target.value }))}
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="$0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={criteria.priceRange.min || ''}
                  onChange={e => setCriteria(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                  }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder="No max"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={criteria.priceRange.max || ''}
                  onChange={e => setCriteria(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Property Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Property Type</label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {propertyTypes.map(type => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={criteria.propertyType.includes(type)}
                    onChange={() => handlePropertyTypeToggle(type)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Square Footage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Square Footage</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Min sq ft"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                value={criteria.squareFootage.min || ''}
                onChange={e => setCriteria(prev => ({
                  ...prev,
                  squareFootage: { ...prev.squareFootage, min: Number(e.target.value) }
                }))}
              />
              <input
                type="number"
                placeholder="Max sq ft"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                value={criteria.squareFootage.max || ''}
                onChange={e => setCriteria(prev => ({
                  ...prev,
                  squareFootage: { ...prev.squareFootage, max: Number(e.target.value) }
                }))}
              />
            </div>
          </div>

          {/* Special Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Features & Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
              {features.map(feature => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={criteria.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Listing Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Listing Preferences</label>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.openHouse}
                  onChange={e => setCriteria(prev => ({ ...prev, openHouse: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Open House Only</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.virtualTour}
                  onChange={e => setCriteria(prev => ({ ...prev, virtualTour: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Virtual Tour Available</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.newConstruction}
                  onChange={e => setCriteria(prev => ({ ...prev, newConstruction: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">New Construction</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.priceReduced}
                  onChange={e => setCriteria(prev => ({ ...prev, priceReduced: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Price Reduced</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSearch(criteria)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Search Properties
          </button>
        </div>
      </div>
    </div>
  );
}
