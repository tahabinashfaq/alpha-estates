"use client";
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useAuth } from '../app/context/AuthContext';
import { useBookmarks } from '../app/context/BookmarkContext';
import { BookmarkButton } from './BookmarkButton';
import { Property } from './PropertyList';

export default function SavedPropertiesPage() {
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch property details for bookmarked properties
  useEffect(() => {
    const fetchBookmarkedProperties = async () => {
      if (!user || bookmarksLoading) return;

      setLoading(true);
      setError(null);

      try {
        const propertyPromises = bookmarks.map(async (bookmark: { propertyId: string }) => {
          const propertyDoc = await getDoc(doc(db, 'properties', bookmark.propertyId));
          if (propertyDoc.exists()) {
            return {
              id: propertyDoc.id,
              ...propertyDoc.data(),
            } as Property;
          }
          return null;
        });

        const fetchedProperties = await Promise.all(propertyPromises);
        const validProperties = fetchedProperties.filter((prop: Property | null): prop is Property => prop !== null);

        setProperties(validProperties);
      } catch (err) {
        console.error('Error fetching bookmarked properties:', err);
        setError('Failed to load saved properties');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedProperties();
  }, [bookmarks, user, bookmarksLoading]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to view your saved properties.</p>
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading || bookmarksLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your saved properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Saved Properties
          </h1>
          <p className="text-gray-600">
            You have saved {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        {/* Empty State */}
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l8 8 8-8Z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No saved properties yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start browsing properties and save your favorites to see them here.
            </p>
            <Link
              href="/search"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          /* Property Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Link href={`/properties/${property.id}`}>
                    <Image
                      src={property.imageUrl || '/placeholder-property.jpg'}
                      alt={property.title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </Link>
                  <div className="absolute top-3 right-3">
                    <BookmarkButton propertyId={property.id} />
                  </div>
                  {property.listingType && (
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${property.listingType === 'sale'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        For {property.listingType === 'sale' ? 'Sale' : 'Rent'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {property.title}
                  </h3>

                  {property.address && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                      📍 {property.address}
                    </p>
                  )}

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      ${property.price?.toLocaleString()}
                      {property.listingType === 'rent' && (
                        <span className="text-sm text-gray-500">/month</span>
                      )}
                    </span>
                  </div>

                  {(property.beds || property.baths || property.squareFeet) && (
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      {property.beds && (
                        <span className="flex items-center gap-1">
                          🛏️ {property.beds} bed{property.beds !== 1 ? 's' : ''}
                        </span>
                      )}
                      {property.baths && (
                        <span className="flex items-center gap-1">
                          🚿 {property.baths} bath{property.baths !== 1 ? 's' : ''}
                        </span>
                      )}
                      {property.squareFeet && (
                        <span className="flex items-center gap-1">
                          📐 {property.squareFeet.toLocaleString()} ft²
                        </span>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/properties/${property.id}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
