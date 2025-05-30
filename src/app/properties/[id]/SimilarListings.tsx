"use client";
import { collection, getDocs, getFirestore, limit, orderBy, query, where } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { app } from "../../components/../../firebase";
import { Property, PropertyList } from "../../../components/PropertyList";

interface SimilarListingsProps {
  property: Property;
}

export function SimilarListings({ property }: SimilarListingsProps) {
  const [similar, setSimilar] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      setLoading(true);
      const db = getFirestore(app);
      const q = query(
        collection(db, "properties"),
        where("type", "==", property.type),
        where("id", "!=", property.id),
        orderBy("createdAt", "desc"),
        limit(4)
      );
      const snap = await getDocs(q);
      setSimilar(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property)));
      setLoading(false);
    }
    if (property.type && property.id) fetchSimilar();
  }, [property.type, property.id]);
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Similar Properties</h3>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading similar properties...</p>
          </div>
        </div>
      </div>
    );
  }
  if (!similar.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Content</h3>

        {/* No similar properties message */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>          <h4 className="text-lg font-semibold text-gray-900 mb-2">No similar properties found</h4>
          <p className="text-gray-600">We couldn&apos;t find properties exactly like this one, but here are some helpful suggestions:</p>
        </div>

        {/* Related content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Expand search criteria */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <h5 className="font-semibold text-gray-900">Expand Your Search</h5>
            </div>
            <p className="text-gray-700 text-sm mb-4">Try broadening your criteria to find more options:</p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                Consider different property types
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                Explore nearby neighborhoods
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                Adjust your price range
              </li>
            </ul>
          </div>

          {/* Market insights */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h5 className="font-semibold text-gray-900">Market Insights</h5>
            </div>
            <p className="text-gray-700 text-sm mb-4">This property type is unique in this area:</p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                High demand for {property.type} properties
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                Limited inventory in {property.location}
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                Great investment opportunity
              </li>
            </ul>
          </div>

          {/* Contact realtor */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                </svg>
              </div>
              <h5 className="font-semibold text-gray-900">Need Help?</h5>
            </div>
            <p className="text-gray-700 text-sm mb-4">Our expert agents can help you find similar properties:</p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
              Contact Our Agent
            </button>
          </div>

          {/* Browse all properties */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h5 className="font-semibold text-gray-900">Browse All Properties</h5>
            </div>            <p className="text-gray-700 text-sm mb-4">Explore our complete property portfolio:</p>
            <Link href="/properties" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm inline-block text-center">
              View All Listings
            </Link>
          </div>
        </div>

        {/* Search suggestions */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Search Suggestions
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-3 text-left transition-colors">
              <div className="text-sm font-medium text-gray-900">All {property.type}</div>
              <div className="text-xs text-gray-600">in this area</div>
            </button>
            <button className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-3 text-left transition-colors">
              <div className="text-sm font-medium text-gray-900">Price Range</div>
              <div className="text-xs text-gray-600">±20% of ${property.price?.toLocaleString()}</div>
            </button>
            <button className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-3 text-left transition-colors">
              <div className="text-sm font-medium text-gray-900">Size Range</div>
              <div className="text-xs text-gray-600">{property.beds}± bedrooms</div>
            </button>
            <button className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-3 text-left transition-colors">
              <div className="text-sm font-medium text-gray-900">Nearby Areas</div>
              <div className="text-xs text-gray-600">within 5 miles</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Similar Properties</h3>
        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {similar.length} {similar.length === 1 ? 'property' : 'properties'} found
        </span>
      </div>
      <PropertyList properties={similar} showSaveButton={true} />
    </div>
  );
}
