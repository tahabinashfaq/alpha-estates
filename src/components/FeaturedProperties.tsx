"use client";
import { collection, getDocs, getFirestore, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { app } from "../firebase";
import { Property, PropertyList } from "./PropertyList";

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true);
      const db = getFirestore(app);
      const q = query(collection(db, "properties"), orderBy("createdAt", "desc"), limit(4));
      const snap = await getDocs(q);
      setProperties(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property)));
      setLoading(false);
    }
    fetchFeatured();
  }, []);
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading featured properties...</p>
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p className="text-gray-600">No featured properties available yet.</p>
      </div>
    );
  }

  return <PropertyList properties={properties} />;
}
