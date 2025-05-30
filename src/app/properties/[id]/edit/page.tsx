"use client";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { app } from "../../../../firebase";
import type { PropertyFormData } from "../../../../components/MultiStepPropertyForm";
import { MultiStepPropertyForm } from "../../../../components/MultiStepPropertyForm";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialValues, setInitialValues] = useState<PropertyFormData | undefined>(undefined);

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      const db = getFirestore(app);
      const snap = await getDoc(doc(db, "properties", id));
      if (!snap.exists()) {
        setError("Property not found");
      } else {
        const data = snap.data();
        setInitialValues({
          price: data.price?.toString() || "",
          listingType: data.listingType || "sale",
          title: data.title || "",
          description: data.description || "",
          type: data.type || "house",
          beds: data.beds?.toString() || "",
          baths: data.baths?.toString() || "",
          squareFeet: data.squareFeet?.toString() || "",
          yearBuilt: data.yearBuilt?.toString() || "",
          features: data.features || [],
          location: data.location || "",
          lat: data.lat?.toString() || "",
          lng: data.lng?.toString() || "",
          imageUrl: data.imageUrl || "",
          imageUrls: data.imageUrls || (data.imageUrl ? [data.imageUrl] : []), // support both single and multiple
          imageFiles: [],
          useFileUpload: false,
        });
      }
      setLoading(false);
    }
    if (id) fetchProperty();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading property...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#10141a] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Property</h1>
      <div className="bg-[#181c23] p-8 rounded-xl shadow-lg max-w-4xl mx-auto border border-[#232a36]">
        <MultiStepPropertyForm
          initialValues={initialValues}
          editMode={true}
          propertyId={id}
          onPropertyAdded={() => router.push("/dashboard")}
        />
      </div>
    </div>
  );
}
