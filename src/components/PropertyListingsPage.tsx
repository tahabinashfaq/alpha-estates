"use client";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { app } from "../firebase";
import { useAuth } from "../app/context/AuthContext";
import ListingsWithGoogleMap from "./ListingsWithGoogleMap";
import { ListingsWithMap } from "./ListingsWithMap";
import { Property, PropertyList } from "./PropertyList";

interface PropertyListingsPageProps {
  viewMode?: 'grid' | 'map' | 'google-map';
}

interface Filters {
  location: string;
  minPrice: string;
  maxPrice: string;
  type: string;
  beds: string;
  baths: string;
}

type SortBy = 'newest' | 'price-low' | 'price-high' | 'size-large' | 'size-small';

export function PropertyListingsPage({ viewMode = 'grid' }: PropertyListingsPageProps) {
  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'map' | 'google-map'>(viewMode);
  const [filters, setFilters] = useState<Filters>({
    location: '',
    minPrice: '',
    maxPrice: '',
    type: '',
    beds: '',
    baths: ''
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    async function fetchSavedIds() {
      if (!user) {
        setSavedIds([]);
        return;
      }
      try {
        const db = getFirestore(app);
        const snap = await getDocs(query(collection(db, "savedListings"), where("userId", "==", user.uid)));
        setSavedIds(snap.docs.map(doc => doc.data().propertyId));
      } catch {
        console.error("Failed to fetch saved listings");
      }
    }
    fetchSavedIds();
  }, [user]);

  // Fetch all properties on mount
  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        const db = getFirestore(app);
        const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
        setProperties(results);
      } catch {
        console.error("Failed to fetch properties");
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  // Apply filters and sorting when filters or sorting changes
  useEffect(() => {
    let results = [...properties];

    // Apply filters
    if (filters.location) {
      results = results.filter(
        p => p.location && p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.type) {
      results = results.filter(p => p.type === filters.type);
    }

    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      results = results.filter(p => p.price >= minPrice);
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      results = results.filter(p => p.price <= maxPrice);
    }

    if (filters.beds) {
      const bedrooms = parseInt(filters.beds);
      results = results.filter(p => p.beds && p.beds >= bedrooms);
    }

    if (filters.baths) {
      const bathrooms = parseInt(filters.baths);
      results = results.filter(p => p.baths && p.baths >= bathrooms);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'size-large':
        results.sort((a, b) => (b.squareFeet || 0) - (a.squareFeet || 0));
        break;
      case 'size-small':
        results.sort((a, b) => (a.squareFeet || 0) - (b.squareFeet || 0));
        break;
      default: // 'newest'
        // Already sorted by createdAt desc from the query
        break;
    }

    setFilteredProperties(results);
  }, [properties, filters, sortBy]);

  const handleSaveToggle = async (id: string, save: boolean) => {
    if (!user) {
      setSaveError("Login to save properties.");
      return;
    }
    setSaveError("");
    const db = getFirestore(app);
    try {
      if (save) {
        await addDoc(collection(db, "savedListings"), { userId: user.uid, propertyId: id });
        setSavedIds(prev => [...prev, id]);
      } else {
        const snap = await getDocs(query(collection(db, "savedListings"), where("userId", "==", user.uid), where("propertyId", "==", id)));
        if (!snap.empty) {
          await deleteDoc(doc(db, "savedListings", snap.docs[0].id));
          setSavedIds(prev => prev.filter(sid => sid !== id));
        }
      }
    } catch {
      setSaveError("Error saving property.");
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      type: '',
      beds: '',
      baths: ''
    });
    setSortBy('newest');
  };

  // Deselect property if filteredProperties change and selectedProperty is not in the list
  useEffect(() => {
    if (selectedProperty && !filteredProperties.some(p => p.id === selectedProperty.id)) {
      setSelectedProperty(null);
    }
  }, [filteredProperties, selectedProperty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section */}
        <div className="text-center mb-12">          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Find Your Dream Home
        </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover extraordinary properties that match your lifestyle. From luxury estates to cozy apartments, your perfect home awaits.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
              <span className="text-gray-600 font-medium">
                {!loading && (
                  <>
                    {filteredProperties.length.toLocaleString()}
                    {filteredProperties.length === 1 ? ' property' : ' properties'} available
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Modern Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-gray-100">
          {/* Quick Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Search by location, neighborhood, or property type..."
                value={filters.location}
                onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
              />
            </div>
          </div>

          {/* Price Range with Visual Sliders */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Price</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg">$</span>
                  </div>
                  <input
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-lg text-black"
                    placeholder="0"
                    type="number"
                    value={filters.minPrice}
                    onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Price</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg">$</span>
                  </div>
                  <input
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-lg text-black"
                    placeholder="No limit"
                    type="number"
                    value={filters.maxPrice}
                    onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium"
                value={filters.type}
                onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
              >
                <option value="">All Types</option>
                <option value="house">🏠 House</option>
                <option value="apartment">🏢 Apartment</option>
                <option value="condo">🏙️ Condo</option>
                <option value="villa">🏛️ Villa</option>
                <option value="townhouse">🏘️ Townhouse</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <select
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium"
                value={filters.beds}
                onChange={e => setFilters(f => ({ ...f, beds: e.target.value }))}
              >
                <option value="">Any</option>
                <option value="1">1+ Bedroom</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
              <select
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium"
                value={filters.baths}
                onChange={e => setFilters(f => ({ ...f, baths: e.target.value }))}
              >
                <option value="">Any</option>
                <option value="1">1+ Bathroom</option>
                <option value="2">2+ Bathrooms</option>
                <option value="3">3+ Bathrooms</option>
                <option value="4">4+ Bathrooms</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortBy)}
              >
                <option value="newest">📅 Newest First</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
                <option value="size-large">📐 Size: Large to Small</option>
                <option value="size-small">🏠 Size: Small to Large</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:text-gray-900 border-2 border-gray-200 hover:border-gray-300 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                Clear All
              </button>
            </div>          </div>
        </div>

        {/* View Mode Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">View Options</h3>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${currentViewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </button>
              {/* <button
                onClick={() => setCurrentViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${currentViewMode === 'map'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Map
              </button> */}
              <button
                onClick={() => setCurrentViewMode('google-map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${currentViewMode === 'google-map'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Google Maps
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {saveError && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 shadow-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {saveError}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center px-8 py-4 bg-white rounded-full shadow-lg border border-gray-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
              <span className="text-xl font-medium text-gray-700">Finding perfect properties...</span>
            </div>
          </div>) : currentViewMode === 'map' ? (
            <ListingsWithMap properties={filteredProperties} />
          ) : currentViewMode === 'google-map' ? (
            <ListingsWithGoogleMap
              properties={filteredProperties}
              savedIds={savedIds}
              onSaveToggle={handleSaveToggle}
              selectedProperty={selectedProperty}
              onPropertySelect={setSelectedProperty}
            />
          ) : (
          <div className="space-y-8">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-gray-200">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties Found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search criteria or clear all filters to see more properties.</p>
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (<PropertyList
              properties={filteredProperties}
              showSaveButton={true}
            />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
