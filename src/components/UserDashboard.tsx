/* eslint-disable react/no-unescaped-entities */
"use client";

import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, query, where } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { app } from "../firebase";
import { useAuth } from "../app/context/AuthContext";
import { Property, PropertyList } from "./PropertyList";

export function UserDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Property[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchUserProperties() {
      setLoading(true);
      setError("");
      try {
        if (!user) throw new Error("Not logged in");
        const db1 = getFirestore(app);
        const q1 = query(collection(db1, "properties"), where("realtorId", "==", user.uid));
        const snap = await getDocs(q1);
        setProperties(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property)));
      } catch {
        setError("Failed to load your listings.");
      }
      setLoading(false);
    }
    async function fetchSaved() {
      setSavedLoading(true);
      try {
        if (!user) return;
        const db2 = getFirestore(app);
        const savedSnap = await getDocs(query(collection(db2, "savedListings"), where("userId", "==", user.uid)));
        const propertyIds = savedSnap.docs.map(doc => doc.data().propertyId);
        if (propertyIds.length) {
          const propSnap = await getDocs(query(collection(db2, "properties")));
          setSaved(propSnap.docs.filter(doc => propertyIds.includes(doc.id)).map(doc => ({ id: doc.id, ...doc.data() } as Property)));
        } else {
          setSaved([]);
        }
      } catch {
        setSaved([]);
      }
      setSavedLoading(false);
    }
    if (user) {
      fetchUserProperties();
      fetchSaved();
    }
  }, [user]);

  // Delete property handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      const db = getFirestore(app);
      await deleteDoc(doc(db, "properties", id));
      setProperties(props => props.filter(p => p.id !== id));
    } catch {
      alert("Failed to delete property.");
    }
  };

  // Save/Unsave property handler
  const handleSave = async (id: string) => {
    if (!user) return;
    const db = getFirestore(app);
    // Check if already saved
    const savedSnap = await getDocs(query(collection(db, "savedListings"), where("userId", "==", user.uid), where("propertyId", "==", id)));
    if (savedSnap.empty) {
      // Save
      await addDoc(collection(db, "savedListings"), { userId: user.uid, propertyId: id });
      setSaved(prev => [...prev, properties.find(p => p.id === id)!]);
    } else {
      // Unsave
      const docId = savedSnap.docs[0].id;
      await deleteDoc(doc(db, "savedListings", docId));
      setSaved(prev => prev.filter(p => p.id !== id));
    }
  };

  // Edit property handler
  const handleEdit = (id: string) => {
    router.push(`/properties/${id}/edit`);
  };

  // Show loading while authentication is being determined
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-6">Please log in to view your dashboard and manage your properties.</p>
          <div className="space-x-4">
            <Link href="/auth/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Your Listings</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Saved Properties</p>
              <p className="text-2xl font-bold text-gray-900">{saved.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
              <p className="text-xs text-gray-500">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Property Listings Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Property Listings</h2>
              <p className="text-sm text-gray-600">Manage and edit your property listings</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Add New Property
              </Link>
              <Link href="/properties" className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors">
                Browse All Properties
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6">
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Listed</h3>
              <p className="text-gray-600 mb-6">Start by adding your first property listing to reach potential buyers.</p>
              <Link href="/dashboard/add" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Add Your First Property
              </Link>
            </div>
          ) : (
            <PropertyList
              properties={properties}
              actionButton={(id) => (
                <div className="flex gap-2 mt-3">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => handleEdit(id)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => handleDelete(id)}
                  >
                    Delete
                  </button>                </div>
              )}
              showSaveButton={true}
            />
          )}
        </div>
      </div>

      {/* Saved Listings Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Saved Properties</h2>
              <p className="text-sm text-gray-600">Properties you've bookmarked for later</p>
            </div>
            <Link href="/properties" className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors">
              Browse & Save More
            </Link>
          </div>
        </div>

        <div className="p-6">
          {savedLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading saved listings...</p>
            </div>
          ) : saved.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Properties</h3>
              <p className="text-gray-600 mb-6">Start browsing properties and save your favorites by clicking the heart icon.</p>
              <Link href="/properties" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Browse Properties
              </Link>
            </div>
          ) : (
            <PropertyList
              properties={saved}
              actionButton={(id) => (
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors mt-3"
                  onClick={() => handleSave(id)}
                >
                  Remove from Saved
                </button>)}
              showSaveButton={true}
            />
          )}
          {saved.length > 0 && (
            <div className="text-sm text-gray-500 mt-4 p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Tip:</span> You can save more properties by clicking the heart icon on any property card or detail page.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
