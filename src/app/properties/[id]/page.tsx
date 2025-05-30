"use client";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { app } from "../../../firebase";
import { AgentProfile } from "../../../components/AgentProfile";
import { FloorPlanViewer } from "../../../components/FloorPlanViewer";
// import { InteractivePropertyVisualization } from "../../components/InteractivePropertyVisualization";
import { MortgageCalculator } from "../../../components/MortgageCalculator";
import { NeighborhoodInsights } from "../../../components/NeighborhoodInsights";
import { PropertyHistoryAndAnalytics } from "../../../components/PropertyHistoryAndAnalytics";
import { Property } from "../../../components/PropertyList";
import { PropertySpecifications } from "../../../components/PropertySpecifications";
import { VirtualTourViewer } from "../../../components/VirtualTourViewer";
import { useAuth } from "../../context/AuthContext";
import ContactAgentForm from "./ContactAgentForm";
import { SimilarListings } from "./SimilarListings";

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Use AuthContext instead of local state
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter(); useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      const db = getFirestore(app);
      const snap = await getDoc(doc(db, "properties", resolvedParams.id));
      if (!snap.exists()) {
        setProperty(null);
      } else {
        const data = snap.data(); setProperty({
          id: snap.id,
          title: data.title || "",
          price: data.price || 0,
          imageUrl: data.imageUrl || "",
          imageUrls: data.imageUrls || [], // Include multiple images
          realtorId: data.realtorId || "",
          location: data.location || "",
          description: data.description || "",
          type: data.type || "",
          beds: data.beds || 0,
          baths: data.baths || 0,
          lat: data.lat,
          lng: data.lng,
          squareFeet: data.squareFeet,
          yearBuilt: data.yearBuilt,
          features: data.features || [],
          listingType: data.listingType,
          lotSize: data.lotSize,
          parkingSpaces: data.parkingSpaces,
          floorPlans: data.floorPlans || [],
          virtualTours: data.virtualTours || [],
          specifications: data.specifications,
          visualizations: data.visualizations || [
            // Mock visualization data for testing
            {
              type: 'gallery',
              title: 'Property Gallery',
              data: {
                images: [
                  {
                    id: '1',
                    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
                    caption: 'Living Room - Open concept design with modern furniture',
                    room: 'Living Room',
                    angle: 'Main View'
                  },
                  {
                    id: '2',
                    url: 'https://images.unsplash.com/photo-1556912167-f556f1f39eb4?w=800',
                    caption: 'Kitchen - Gourmet kitchen with granite countertops',
                    room: 'Kitchen',
                    angle: 'Main View'
                  },
                  {
                    id: '3',
                    url: 'https://images.unsplash.com/photo-1556909195-f7b15e6c0bb5?w=800',
                    caption: 'Master Bedroom - Spacious bedroom with walk-in closet',
                    room: 'Master Bedroom',
                    angle: 'Main View'
                  },
                  {
                    id: '4',
                    url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800',
                    caption: 'Bathroom - Luxury bathroom with marble finishes',
                    room: 'Master Bathroom',
                    angle: 'Main View'
                  }
                ]
              }
            },
            {
              type: 'virtual-tour',
              title: '360° Virtual Tour',
              data: {
                tourUrl: 'https://example.com/360-tour',
                duration: 8,
                roomCount: 12
              }
            },
            {
              type: 'floor-plan',
              title: 'Interactive Floor Plan',
              data: {
                levels: ['Ground Floor', 'Second Floor'],
                totalArea: 3200,
                rooms: ['Living Room', 'Kitchen', 'Dining Room', 'Master Bedroom', 'Guest Bedroom', 'Home Office']
              }
            },
            {
              type: '3d-model',
              title: '3D Property Model',
              data: {
                modelUrl: 'https://example.com/3d-model',
                hasVR: true,
                features: ['Rotate', 'Zoom', 'Room Selection', 'Measurements']
              }
            }
          ],
        });
      }
      setLoading(false);
    } fetchProperty();
  }, [resolvedParams.id]);

  useEffect(() => {
    async function checkSaved() {
      if (!user || !property) { setIsSaved(false); return; }
      const db = getFirestore(app);
      const snap = await getDocs(query(collection(db, "savedListings"), where("userId", "==", user.uid), where("propertyId", "==", property.id)));
      setIsSaved(!snap.empty);
    }
    checkSaved();
  }, [user, property]);

  const handleSaveToggle = async () => {
    if (!user || !property) { setSaveError("Login to save properties."); return; }
    setSaveLoading(true);
    setSaveError("");
    const db = getFirestore(app);
    try {
      if (!isSaved) {
        await addDoc(collection(db, "savedListings"), { userId: user.uid, propertyId: property.id });
        setIsSaved(true);
      } else {
        const snap = await getDocs(query(collection(db, "savedListings"), where("userId", "==", user.uid), where("propertyId", "==", property.id)));
        if (!snap.empty) {
          await deleteDoc(doc(db, "savedListings", snap.docs[0].id));
          setIsSaved(false);
        }
      }
    } catch {
      setSaveError("Failed to update saved state.");
    } setSaveLoading(false);
  };

  const handleContactAgent = () => {
    setShowContactModal(true);
  };

  const handleScheduleTour = () => {
    setShowTourModal(true);
  };

  const handleGetFinancing = () => {
    setShowFinancingModal(true);
  };

  const handleShareProperty = () => {
    setShowShareModal(true);
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
  };
  // Image carousel navigation functions
  const images = property?.imageUrls && property.imageUrls.length > 0
    ? property.imageUrls
    : property?.imageUrl
      ? [property.imageUrl]
      : [];
  const totalImages = images.length;

  // Reset currentImageIndex if images array changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const currentImage = images[currentImageIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors group"
              onClick={() => router.back()}
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Listings</span>
            </button>

            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${isSaved
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              onClick={handleSaveToggle}
              disabled={saveLoading}
            >
              <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-medium">{isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>
      </div>      {/* Main Content */}
      <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/properties" className="hover:text-blue-600 transition-colors">Properties</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">Property Details</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">            {/* Property Image Gallery */}
            {images.length > 0 && currentImage && (
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                  <Image
                    src={currentImage}
                    alt={`${property.title} - Image ${currentImageIndex + 1}`}
                    width={800}
                    height={500}
                    className="w-full h-96 lg:h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide shadow-lg">
                      {property.type || 'Property'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      {currentImageIndex + 1} / {totalImages}
                    </div>
                  </div>

                  {/* Navigation Arrows - Only show if multiple images */}
                  {totalImages > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                </div>

                {/* Thumbnail Gallery - Only show if multiple images */}
                {totalImages > 1 && (
                  <div className="grid grid-cols-4 gap-2 max-w-md">
                    {images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${currentImageIndex === index
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        {image && (
                          <Image
                            src={image}
                            alt={`${property.title} - Thumbnail ${index + 1}`}
                            width={200}
                            height={150}
                            className="w-full h-20 object-cover"
                          />
                        )}
                        {currentImageIndex === index && (
                          <div className="absolute inset-0 bg-blue-500/20"></div>
                        )}
                      </button>
                    ))}
                    {totalImages > 4 && (
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">+{totalImages - 4}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Image dots indicator for mobile */}
                {totalImages > 1 && (
                  <div className="flex justify-center space-x-2 lg:hidden">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${currentImageIndex === index ? "bg-blue-600" : "bg-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Property Title and Location */}
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-lg">{property.location}</span>
                </div>
              </div>

              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700">{saveError}</span>
                  </div>
                </div>
              )}
            </div>            {/* Property Details Grid */}
            {(property.beds || property.baths || property.squareFeet || property.yearBuilt) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Property Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {property.beds && (
                    <div className="text-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.5a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 20v-6l18-6v6l-18 6z" />
                        </svg>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{property.beds}</div>
                      <div className="text-sm text-gray-600">Bedroom{property.beds !== 1 ? 's' : ''}</div>
                    </div>
                  )}

                  {property.baths && (
                    <div className="text-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{property.baths}</div>
                      <div className="text-sm text-gray-600">Bathroom{property.baths !== 1 ? 's' : ''}</div>
                    </div>
                  )}

                  {property.squareFeet && (
                    <div className="text-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m-2-2h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{property.squareFeet?.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Square Feet</div>
                    </div>
                  )}

                  {property.yearBuilt && (
                    <div className="text-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{property.yearBuilt}</div>
                      <div className="text-sm text-gray-600">Year Built</div>
                    </div>
                  )}
                </div>
              </div>
            )}            {/* Description */}
            {property.description && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  About This Property
                </h3>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">{property.description}</p>
                </div>

                {/* Quick highlights */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-green-600 font-semibold text-sm">Move-in Ready</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-blue-600 font-semibold text-sm">Great Location</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-purple-600 font-semibold text-sm">Modern Design</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="text-orange-600 font-semibold text-sm">Quality Build</div>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  Features & Amenities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors">
                      <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>))}
                </div>
              </div>
            )}

            {/* Interactive Property Visualization */}
            {/* <InteractivePropertyVisualization
              visualizations={property.visualizations || []}
              propertyTitle={property.title}
            /> */}

            {/* Map */}
            {property.lat && property.lng && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Location</h3>
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.lng - 0.01}%2C${property.lat - 0.01}%2C${property.lng + 0.01}%2C${property.lat + 0.01}&layer=mapnik&marker=${property.lat}%2C${property.lng}`}
                  ></iframe>
                </div>
              </div>
            )}

            {/* Enhanced Property Details - Floor Plans */}
            <FloorPlanViewer
              floorPlans={property.floorPlans || []}
              propertyTitle={property.title}
            />

            {/* Enhanced Property Details - Virtual Tours */}
            <VirtualTourViewer
              tours={property.virtualTours || []}
              propertyTitle={property.title}
            />

            {/* Enhanced Property Details - Property Specifications */}
            <PropertySpecifications property={property} />
          </div>{/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ${property.price?.toLocaleString()}
                </div>
                {property.listingType && (
                  <div className="text-gray-600">
                    {property.listingType === 'rent' ? 'per month' : 'total price'}
                  </div>
                )}

                {/* Price per sq ft if available */}
                {property.squareFeet && (
                  <div className="text-sm text-gray-500 mt-1">
                    ${Math.round(property.price / property.squareFeet)}/sq ft
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{property.beds || 0}</div>
                  <div className="text-xs text-gray-600">Beds</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{property.baths || 0}</div>
                  <div className="text-xs text-gray-600">Baths</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {property.squareFeet ? `${property.squareFeet.toLocaleString()}` : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">Sq Ft</div>
                </div>
              </div>              {/* Quick Contact */}
              <div className="space-y-3">
                <button
                  onClick={handleContactAgent}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  📞 Contact Agent
                </button>
                <button
                  onClick={handleScheduleTour}
                  className="w-full border border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:bg-blue-50"
                >
                  🏠 Schedule Tour
                </button>
                <button
                  onClick={handleGetFinancing}
                  className="w-full border border-gray-300 hover:border-green-400 text-gray-700 hover:text-green-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:bg-green-50"
                >
                  💰 Get Financing
                </button>
              </div>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Property ID:</span>
                  <span className="font-medium text-gray-900">{property.id}</span>
                </div>
                {property.yearBuilt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Year Built:</span>
                    <span className="font-medium text-gray-900">{property.yearBuilt}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Available</span>
                </div>
              </div>              {/* Share Button */}
              <div className="mt-6">
                <button
                  onClick={handleShareProperty}
                  className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="text-sm font-medium">Share Property</span>
                </button>
              </div>
              {/* Contact Form */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <ContactAgentForm propertyId={property.id} realtorId={property.realtorId} />
              </div>
            </div>

          </div>
        </div>        {/* Market Insights */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Market Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Price Trend</h4>
                  <div className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    <span className="text-sm font-medium">+2.3%</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Property values in this area have increased over the past year.</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Days on Market</h4>
                  <div className="text-blue-600 font-bold">28</div>
                </div>
                <p className="text-gray-600 text-sm">Average time properties stay on the market in this neighborhood.</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Price per Sq Ft</h4>
                  <div className="text-purple-600 font-bold">
                    ${property.squareFeet ? Math.round(property.price / property.squareFeet) : 'N/A'}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Competitive pricing compared to similar properties in the area.</p>
              </div>
            </div>
          </div>        </div>        {/* Property Analytics and Market Data */}
        <div className="mt-12">
          <PropertyHistoryAndAnalytics
            property={{
              id: property.id,
              price: property.price,
              location: property.location || "",
              squareFeet: property.squareFeet || 0,
              type: property.type || ""
            }}
          />
        </div>

        {/* Neighborhood Insights */}
        <div className="mt-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Neighborhood Insights</h3>
            <NeighborhoodInsights
              location={property.location || ""}
              propertyPrice={property.price}
            />
          </div>
        </div>

        {/* Mortgage Calculator */}
        <div className="mt-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Mortgage Calculator</h3>
            <MortgageCalculator propertyPrice={property.price} />
          </div>
        </div>

        {/* Agent Profile */}
        {property.realtorId && (
          <div className="mt-12">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Agent</h3>
              <AgentProfile
                agentId={property.realtorId}
                onContactAgent={() => setShowContactModal(true)}
              />
            </div>
          </div>
        )}

        {/* Similar Listings */}
        <div className="mt-12">
          <SimilarListings property={property} />
        </div>
      </div>

      {/* Contact Agent Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Contact Agent</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-0">
              <ContactAgentForm propertyId={property.id} realtorId={property.realtorId} />
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tour Modal */}
      {showTourModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Schedule a Tour</h2>
              <button
                onClick={() => setShowTourModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                  <select className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                    <option value="">Select a time</option>
                    <option value="9:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder-gray-500 mb-3"
                  />
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Any specific areas you'd like to focus on during the tour..."
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder-gray-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Schedule Tour
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Get Financing Modal */}
      {showFinancingModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Get Financing Information</h2>
              <button
                onClick={() => setShowFinancingModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Financing Options Available</h3>
                <p className="text-gray-600">Get pre-approved and explore mortgage options for this property.</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Estimated Monthly Payment</h4>
                  <div className="text-2xl font-bold text-blue-700">
                    ${Math.round((property.price * 0.004)).toLocaleString()}/mo
                  </div>
                  <p className="text-sm text-blue-600">Based on 20% down, 30-year fixed at 7.5% APR</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Down Payment Options</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-green-700">20% Down:</span>
                      <span className="font-semibold text-green-900">${(property.price * 0.2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">10% Down:</span>
                      <span className="font-semibold text-green-900">${(property.price * 0.1).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">5% Down:</span>
                      <span className="font-semibold text-green-900">${(property.price * 0.05).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email for financing options"
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder-gray-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
                    <input
                      type="number"
                      placeholder="$75,000"
                      className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credit Score</label>
                    <select className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                      <option value="">Select range</option>
                      <option value="excellent">Excellent (750+)</option>
                      <option value="good">Good (700-749)</option>
                      <option value="fair">Fair (650-699)</option>
                      <option value="poor">Poor (below 650)</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Pre-Approved
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Share Property Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Share Property</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">Copy Link</div>
                    <div className="text-sm text-gray-600">Share the property URL</div>
                  </div>
                </button>

                <a
                  href={`mailto:?subject=Check out this property: ${property.title}&body=I found this amazing property on Alpha Estates: ${window.location.href}`}
                  className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-sm text-gray-600">Send via email</div>
                  </div>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">Facebook</div>
                    <div className="text-sm text-gray-600">Share on Facebook</div>
                  </div>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=Check out this amazing property: ${property.title}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">Twitter</div>
                    <div className="text-sm text-gray-600">Share on Twitter</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
