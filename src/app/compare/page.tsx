"use client";

import Link from 'next/link';
import { Header } from '../../components/Header';
import { PropertyComparison } from '../../components/PropertyComparison';
import { useComparison } from '../context/ComparisonContext';

export default function ComparePage() {
  const { comparedProperties, comparisonCount } = useComparison(); if (comparisonCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="/compare" />
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Comparison</h1>
              <p className="text-lg text-gray-600 mb-8">
                No properties selected for comparison. Browse properties and add them to compare features side by side.
              </p>
              <div className="space-y-4">
                <Link
                  href="/properties"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Browse Properties
                </Link>
                <p className="text-sm text-gray-500">
                  You can compare up to 4 properties at once
                </p>            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (comparisonCount === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="/compare" />
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Add More Properties</h1>
              <p className="text-lg text-gray-600 mb-4">
                You have {comparisonCount} property selected. Add at least one more property to start comparing.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Selected: {comparedProperties[0].title}
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >              Browse More Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="/compare" />
      <PropertyComparison />
    </div>
  );
}
