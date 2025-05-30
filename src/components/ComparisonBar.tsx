"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useComparison } from '../app/context/ComparisonContext';

export function ComparisonBar() {
  const {
    comparedProperties,
    removeFromComparison,
    clearComparison,
    comparisonCount
  } = useComparison();

  if (comparisonCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-200 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Selected Properties */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {comparisonCount} Selected
              </div>
              <span className="text-gray-600 text-sm">for comparison</span>
            </div>

            <div className="flex items-center space-x-2 max-w-md overflow-x-auto">
              {comparedProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex-shrink-0 relative group"
                >
                  <div className="w-16 h-12 rounded-lg overflow-hidden border-2 border-blue-200">
                    <Image
                      src={property.imageUrls?.[0] || property.imageUrl}
                      alt={property.title}
                      width={64}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromComparison(property.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>

                  {/* Property title tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {property.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={clearComparison}
              className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors"
            >
              Clear All
            </button>

            <Link href="/compare">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Compare Properties</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
