/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useComparison } from '../app/context/ComparisonContext';
import { Property } from './PropertyList';

interface ComparisonFeature {
  label: string;
  getValue: (property: Property) => string | number | undefined;
  format?: (value: any) => string;
  highlight?: boolean;
}

const comparisonFeatures: ComparisonFeature[] = [
  {
    label: 'Price',
    getValue: (p) => p.price,
    format: (value) => value ? `$${value.toLocaleString()}` : 'N/A',
    highlight: true
  },
  {
    label: 'Price per Sq Ft',
    getValue: (p) => p.price && p.squareFeet ? p.price / p.squareFeet : undefined,
    format: (value) => value ? `$${Math.round(value)}` : 'N/A'
  },
  {
    label: 'Property Type',
    getValue: (p) => p.type,
    format: (value) => value || 'N/A'
  },
  {
    label: 'Bedrooms',
    getValue: (p) => p.beds,
    format: (value) => value || '0'
  },
  {
    label: 'Bathrooms',
    getValue: (p) => p.baths,
    format: (value) => value || '0'
  },
  {
    label: 'Square Feet',
    getValue: (p) => p.squareFeet,
    format: (value) => value ? value.toLocaleString() : 'N/A',
    highlight: true
  },
  {
    label: 'Year Built',
    getValue: (p) => p.yearBuilt,
    format: (value) => value || 'N/A'
  },
  {
    label: 'Lot Size',
    getValue: (p) => p.lotSize,
    format: (value) => value ? `${value.toLocaleString()} sq ft` : 'N/A'
  },
  {
    label: 'Parking Spaces',
    getValue: (p) => p.parkingSpaces,
    format: (value) => value || '0'
  },
  {
    label: 'Listing Type',
    getValue: (p) => p.listingType,
    format: (value) => value === 'rent' ? 'For Rent' : value === 'sale' ? 'For Sale' : 'N/A'
  },
];

export function PropertyComparison() {
  const { comparedProperties, removeFromComparison, clearComparison } = useComparison();
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToPDF();
    }
  };

  const exportToCSV = () => {
    const headers = ['Feature', ...comparedProperties.map(p => p.title)];
    const rows = comparisonFeatures.map(feature => [
      feature.label,
      ...comparedProperties.map(p => {
        const value = feature.getValue(p);
        return feature.format ? feature.format(value) : (value?.toString() || 'N/A');
      })
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // For now, we'll use the browser's print functionality
    // In a real application, you'd use a library like jsPDF or Puppeteer
    window.print();
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Comparison</h1>
              <p className="text-gray-600 mt-2">
                Comparing {comparedProperties.length} properties side by side
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Export Options */}
              <div className="flex items-center space-x-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'csv')}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                </select>
                <button
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Export
                </button>
              </div>

              <button
                onClick={clearComparison}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Property Images and Basic Info */}
        <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: `1fr repeat(${comparedProperties.length}, 300px)` }}>
          <div className="font-semibold text-gray-900 flex items-end pb-4">
            Properties
          </div>
          {comparedProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <Image
                  src={property.imageUrls?.[0] || property.imageUrl}
                  alt={property.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => removeFromComparison(property.id)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{property.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{property.location}</p>
                <Link
                  href={`/properties/${property.id}`}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Feature
                  </th>
                  {comparedProperties.map((property) => (
                    <th
                      key={property.id}
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 min-w-[200px]"
                    >
                      {property.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonFeatures.map((feature, index) => (
                  <tr key={index} className={feature.highlight ? 'bg-blue-50' : 'bg-white'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                      {feature.label}
                    </td>
                    {comparedProperties.map((property) => {
                      const value = feature.getValue(property);
                      const formattedValue = feature.format ? feature.format(value) : (value?.toString() || 'N/A');

                      return (
                        <td
                          key={property.id}
                          className="px-6 py-4 text-sm text-gray-700 text-center border-r border-gray-200"
                        >
                          <span className={feature.highlight ? 'font-semibold text-blue-900' : ''}>
                            {formattedValue}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Features & Amenities</h3>
          <div className="space-y-4">
            {/* Get all unique features */}
            {Array.from(new Set(comparedProperties.flatMap(p => p.features || []))).map(feature => (
              <div key={feature} className="flex items-center space-x-4">
                <div className="w-48 text-sm font-medium text-gray-900">{feature}</div>
                <div className="flex space-x-4">
                  {comparedProperties.map(property => (
                    <div key={property.id} className="w-48 text-center">
                      {property.features?.includes(feature) ? (
                        <span className="inline-flex items-center text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          No
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <Link
            href="/properties"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors mr-4"
          >
            Browse More Properties
          </Link>
          <button
            onClick={clearComparison}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Clear Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
