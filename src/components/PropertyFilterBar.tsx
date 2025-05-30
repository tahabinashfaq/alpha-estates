/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from 'react';

export interface PropertyFilters {
  priceRange: [number, number];
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  location: string;
  features: string[];
  sortBy: 'price-asc' | 'price-desc' | 'newest' | 'size-desc' | 'size-asc';
  sqftRange: [number, number];
  yearBuilt: [number, number];
  listingType: 'sale' | 'rent' | 'all';
}

interface PropertyFilterBarProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onReset: () => void;
  resultCount?: number;
}

export function PropertyFilterBar({
  filters,
  onFiltersChange,
  onReset,
  resultCount = 0
}: PropertyFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceInput, setPriceInput] = useState({
    min: filters.priceRange[0].toString(),
    max: filters.priceRange[1].toString()
  });

  const propertyTypes = [
    { value: '', label: 'All Types' },
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'villa', label: 'Villa' },
    { value: 'land', label: 'Land/Lot' }
  ];

  const availableFeatures = [
    'Pool', 'Garage', 'Garden/Yard', 'Balcony/Deck', 'Fireplace',
    'Air Conditioning', 'Heating', 'Dishwasher', 'Laundry Room',
    'Gym/Fitness', 'Security System', 'Pet Friendly', 'Furnished',
    'Parking', 'Walk-in Closet', 'Hardwood Floors', 'Updated Kitchen'
  ];

  const bedroomOptions = [
    { value: 0, label: 'Any' },
    { value: 1, label: '1+' },
    { value: 2, label: '2+' },
    { value: 3, label: '3+' },
    { value: 4, label: '4+' },
    { value: 5, label: '5+' }
  ];

  const bathroomOptions = [
    { value: 0, label: 'Any' },
    { value: 1, label: '1+' },
    { value: 2, label: '2+' },
    { value: 3, label: '3+' },
    { value: 4, label: '4+' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'size-desc', label: 'Size: Large to Small' },
    { value: 'size-asc', label: 'Size: Small to Large' }
  ];

  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handlePriceChange = () => {
    const min = parseInt(priceInput.min) || 0;
    const max = parseInt(priceInput.max) || 10000000;
    updateFilter('priceRange', [min, max]);
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    updateFilter('features', newFeatures);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.propertyType) count++;
    if (filters.bedrooms > 0) count++;
    if (filters.bathrooms > 0) count++;
    if (filters.location) count++;
    if (filters.features.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) count++;
    if (filters.sqftRange[0] > 0 || filters.sqftRange[1] < 10000) count++;
    if (filters.yearBuilt[0] > 1900 || filters.yearBuilt[1] < new Date().getFullYear()) count++;
    if (filters.listingType !== 'all') count++;
    return count;
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Quick Filters Row */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Listing Type */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => updateFilter('listingType', 'all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filters.listingType === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              All
            </button>
            <button
              onClick={() => updateFilter('listingType', 'sale')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filters.listingType === 'sale'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              For Sale
            </button>
            <button
              onClick={() => updateFilter('listingType', 'rent')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filters.listingType === 'rent'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              For Rent
            </button>
          </div>

          {/* Property Type */}
          <select
            value={filters.propertyType}
            onChange={(e) => updateFilter('propertyType', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {propertyTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Bedrooms */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Beds:</span>
            <select
              value={filters.bedrooms}
              onChange={(e) => updateFilter('bedrooms', parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {bedroomOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Bathrooms */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Baths:</span>
            <select
              value={filters.bathrooms}
              onChange={(e) => updateFilter('bathrooms', parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {bathroomOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Price:</span>
            <input
              type="number"
              placeholder="Min"
              value={priceInput.min}
              onChange={(e) => setPriceInput(prev => ({ ...prev, min: e.target.value }))}
              onBlur={handlePriceChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceInput.max}
              onChange={(e) => setPriceInput(prev => ({ ...prev, max: e.target.value }))}
              onBlur={handlePriceChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <span>More Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>

        {/* Results and Sort */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {resultCount > 0 ? (
              <span>{resultCount.toLocaleString()} properties found</span>
            ) : (
              <span>No properties found</span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={onReset}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="City, neighborhood, or zip code"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Square Footage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Square Footage</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min sq ft"
                    value={filters.sqftRange[0] || ''}
                    onChange={(e) => updateFilter('sqftRange', [parseInt(e.target.value) || 0, filters.sqftRange[1]])}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max sq ft"
                    value={filters.sqftRange[1] === 10000 ? '' : filters.sqftRange[1]}
                    onChange={(e) => updateFilter('sqftRange', [filters.sqftRange[0], parseInt(e.target.value) || 10000])}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Year Built */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year Built</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="From"
                    value={filters.yearBuilt[0] === 1900 ? '' : filters.yearBuilt[0]}
                    onChange={(e) => updateFilter('yearBuilt', [parseInt(e.target.value) || 1900, filters.yearBuilt[1]])}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="To"
                    value={filters.yearBuilt[1] === new Date().getFullYear() ? '' : filters.yearBuilt[1]}
                    onChange={(e) => updateFilter('yearBuilt', [filters.yearBuilt[0], parseInt(e.target.value) || new Date().getFullYear()])}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Property Features */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Property Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {availableFeatures.map(feature => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Apply/Cancel Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAdvanced(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAdvanced(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
