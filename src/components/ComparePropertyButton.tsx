"use client";

import React, { useState } from 'react';
import { useComparison } from '../app/context/ComparisonContext';
import { Property } from './PropertyList';

interface ComparePropertyButtonProps {
  property: Property;
  className?: string;
  showText?: boolean;
}

export function ComparePropertyButton({
  property,
  className = "",
  showText = false
}: ComparePropertyButtonProps) {
  const {
    addToComparison,
    removeFromComparison,
    isInComparison,
    comparisonCount,
    maxComparisons
  } = useComparison();

  const [isHovered, setIsHovered] = useState(false);
  const isComparing = isInComparison(property.id);
  const canAddMore = comparisonCount < maxComparisons;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isComparing) {
      removeFromComparison(property.id);
    } else if (canAddMore) {
      const success = addToComparison(property);
      if (!success) {
        // Could show a toast notification here
        console.log('Unable to add property to comparison');
      }
    }
  };

  const getButtonText = () => {
    if (isComparing) return showText ? 'Remove from Compare' : '';
    if (!canAddMore) return showText ? 'Compare List Full' : '';
    return showText ? 'Add to Compare' : '';
  };

  const getTooltipText = () => {
    if (isComparing) return 'Remove from comparison';
    if (!canAddMore) return `Maximum ${maxComparisons} properties can be compared`;
    return 'Add to comparison';
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={!canAddMore && !isComparing}
        className={`
          group flex items-center justify-center p-2 rounded-lg transition-all duration-200
          ${isComparing
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : canAddMore
              ? 'bg-white text-gray-600 border border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          }
          ${className}
        `}
        title={getTooltipText()}
      >
        {/* Compare Icon */}
        <svg
          className={`w-5 h-5 transition-colors duration-200 ${showText ? 'mr-2' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isComparing ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          )}
        </svg>

        {showText && (
          <span className="text-sm font-medium">
            {getButtonText()}
          </span>
        )}
      </button>

      {/* Tooltip */}
      {isHovered && !showText && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
          {getTooltipText()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
