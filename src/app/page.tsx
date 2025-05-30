"use client";
import { useState } from "react";
import { AdvancedSearch } from "../components/AdvancedSearch";
import { Header } from "../components/Header";
import { PropertyAlerts } from "../components/PropertyAlerts";
import { PropertyListingsPage } from "../components/PropertyListingsPage";
import { useAuth } from "./context/AuthContext";

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

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showPropertyAlerts, setShowPropertyAlerts] = useState(false);
  const { user } = useAuth();
  const handleAdvancedSearch = (criteria: SearchCriteria) => {
    console.log('Advanced search criteria:', criteria);
    // Here you would typically filter properties based on criteria
    setShowAdvancedSearch(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation Header */}
      <Header currentPage="/properties" />{/* Page Header */}
      <div className="bg-gradient-to-r from-white to-blue-50 border-b border-gray-200/50">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">Properties for Sale</h1>
              <p className="text-gray-600 mt-2 text-lg">Discover your perfect home from thousands of premium listings</p>
            </div>
            {/* Advanced Search Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAdvancedSearch(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Advanced Search</span>
              </button>

              {/* Property Alerts Button */}
              {user && (
                <button
                  onClick={() => setShowPropertyAlerts(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h0z" />
                  </svg>
                  <span>Property Alerts</span>
                </button>
              )}

              {/* View Mode Toggle */}
              <div className="flex bg-white rounded-lg p-1 shadow-md border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'map'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Main Content */}
      <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PropertyListingsPage viewMode={viewMode} />
      </div>
      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}

      {/* Property Alerts Modal */}
      {showPropertyAlerts && (
        <PropertyAlerts
          onClose={() => setShowPropertyAlerts(false)}
        />
      )}
    </div>
  );
}
