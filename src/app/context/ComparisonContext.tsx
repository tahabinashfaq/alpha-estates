"use client";

import React, { createContext, useCallback, useContext, useState } from 'react';
import { Property } from '../../components/PropertyList';

interface ComparisonContextType {
  comparedProperties: Property[];
  addToComparison: (property: Property) => boolean;
  removeFromComparison: (propertyId: string) => void;
  clearComparison: () => void;
  isInComparison: (propertyId: string) => boolean;
  comparisonCount: number;
  maxComparisons: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}

interface ComparisonProviderProps {
  children: React.ReactNode;
  maxComparisons?: number;
}

export function ComparisonProvider({
  children,
  maxComparisons = 4
}: ComparisonProviderProps) {
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);

  const addToComparison = useCallback((property: Property): boolean => {
    if (comparedProperties.length >= maxComparisons) {
      return false; // Can't add more properties
    }

    if (comparedProperties.some(p => p.id === property.id)) {
      return false; // Property already in comparison
    }

    setComparedProperties(prev => [...prev, property]);
    return true;
  }, [comparedProperties, maxComparisons]);

  const removeFromComparison = useCallback((propertyId: string) => {
    setComparedProperties(prev => prev.filter(p => p.id !== propertyId));
  }, []);

  const clearComparison = useCallback(() => {
    setComparedProperties([]);
  }, []);

  const isInComparison = useCallback((propertyId: string): boolean => {
    return comparedProperties.some(p => p.id === propertyId);
  }, [comparedProperties]);

  const value: ComparisonContextType = {
    comparedProperties,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    comparisonCount: comparedProperties.length,
    maxComparisons,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}
