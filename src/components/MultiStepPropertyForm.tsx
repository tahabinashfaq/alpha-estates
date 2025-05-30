"use client";
import { getAuth } from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { app } from "../firebase";

interface MultiStepPropertyFormProps {
  onPropertyAdded?: () => void;
  initialValues?: PropertyFormData;
  editMode?: boolean;
  propertyId?: string;
}

export interface PropertyFormData {
  // Financial Info
  price: string;
  listingType: 'sale' | 'rent';

  // House Info
  title: string;
  description: string;
  type: string;
  beds: string;
  baths: string;
  squareFeet: string;
  yearBuilt: string;
  features: string[];

  // Location Info
  location: string;
  lat: string;
  lng: string;

  // Images
  imageUrl: string;
  imageFiles: File[];
  useFileUpload: boolean;
  imageUrls?: string[]; // <-- add this for multiple images
}

export function MultiStepPropertyForm({ onPropertyAdded, initialValues, editMode = false, propertyId }: MultiStepPropertyFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>(initialValues || {
    price: "",
    listingType: 'sale',
    title: "",
    description: "",
    type: "house",
    beds: "",
    baths: "",
    squareFeet: "",
    yearBuilt: "",
    features: [],
    location: "",
    lat: "",
    lng: "",
    imageUrl: "",
    imageFiles: [],
    useFileUpload: true,
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const db = getFirestore(app);
  const auth = getAuth(app);

  const availableFeatures = [
    'Pool', 'Garage', 'Garden', 'Fireplace', 'Balcony', 'Parking',
    'Air Conditioning', 'Heating', 'Hardwood Floors', 'Updated Kitchen',
    'Walk-in Closet', 'Laundry Room', 'Security System', 'Gym'
  ];

  const steps = [
    { number: 1, title: "Financial Info", icon: "💰" },
    { number: 2, title: "House Details", icon: "🏠" },
    { number: 3, title: "Location", icon: "📍" },
    { number: 4, title: "Images", icon: "📸" }
  ];

  const updateFormData = (field: keyof PropertyFormData, value: string | string[] | File[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    const updatedFeatures = formData.features.includes(feature)
      ? formData.features.filter(f => f !== feature)
      : [...formData.features, feature];
    updateFormData('features', updatedFeatures);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Append new files to existing ones, avoiding duplicates by name+size
      const existingFiles = formData.imageFiles;
      const allFiles = [...existingFiles, ...files].filter((file, idx, arr) =>
        arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
      );
      updateFormData('imageFiles', allFiles);
      // Create preview URLs for all files
      const previews = allFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  // Remove image by index
  const handleRemoveImage = (index: number) => {
    const newFiles = formData.imageFiles.filter((_, i) => i !== index);
    updateFormData('imageFiles', newFiles);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Cloudinary upload function (now uses env variables)
  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration is missing. Please check your .env.local file.");
    }
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!data.secure_url) throw new Error("Cloudinary upload failed.");
      return data.secure_url;
    });
    return Promise.all(uploadPromises);
  };

  const validateStep = (step: number): boolean => {
    setError("");

    switch (step) {
      case 1:
        if (!formData.price) {
          setError("Price is required");
          return false;
        }
        break;
      case 2:
        if (!formData.title || !formData.description || !formData.beds || !formData.baths) {
          setError("Please fill in all required house details");
          return false;
        }
        break;
      case 3:
        if (!formData.location) {
          setError("Location is required");
          return false;
        }
        break;
      case 4:
        if (formData.imageFiles.length === 0 && !formData.imageUrl) {
          setError("Please provide at least one image");
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to add or edit a property.");

      let uploadedImageUrls: string[] = [];

      // Upload images to Cloudinary if files are selected
      if (formData.imageFiles.length > 0) {
        setUploadingImages(true);
        try {
          uploadedImageUrls = await uploadMultipleImages(formData.imageFiles);
        } catch {
          throw new Error("Failed to upload images. Please try again.");
        } finally {
          setUploadingImages(false);
        }
      } else if (formData.imageUrl) {
        uploadedImageUrls = [formData.imageUrl];
      }

      // Ensure at least one valid image URL is present
      if (!uploadedImageUrls[0] || typeof uploadedImageUrls[0] !== 'string' || uploadedImageUrls[0].trim() === "") {
        throw new Error("A valid property image is required. Please upload an image or provide a valid image URL.");
      }

      if (editMode && propertyId) {
        // Update property
        const { doc, updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "properties", propertyId), {
          title: formData.title,
          price: Number(formData.price),
          location: formData.location,
          description: formData.description,
          type: formData.type,
          beds: Number(formData.beds),
          baths: Number(formData.baths),
          imageUrl: uploadedImageUrls[0],
          imageUrls: uploadedImageUrls,
          lat: formData.lat ? Number(formData.lat) : null,
          lng: formData.lng ? Number(formData.lng) : null,
          squareFeet: formData.squareFeet ? Number(formData.squareFeet) : undefined,
          yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
          listingType: formData.listingType,
          features: formData.features
        });
        if (onPropertyAdded) onPropertyAdded();
      } else {
        // Add property
        await addDoc(collection(db, "properties"), {
          title: formData.title,
          price: Number(formData.price),
          location: formData.location,
          description: formData.description,
          type: formData.type,
          beds: Number(formData.beds),
          baths: Number(formData.baths),
          imageUrl: uploadedImageUrls[0],
          imageUrls: uploadedImageUrls,
          realtorId: user.uid,
          createdAt: new Date(),
          lat: formData.lat ? Number(formData.lat) : null,
          lng: formData.lng ? Number(formData.lng) : null,
          squareFeet: formData.squareFeet ? Number(formData.squareFeet) : undefined,
          yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
          listingType: formData.listingType,
          features: formData.features
        });
        // Reset form
        setFormData({
          price: "", listingType: 'sale', title: "", description: "",
          type: "house", beds: "", baths: "", squareFeet: "", yearBuilt: "",
          features: [], location: "", lat: "", lng: "", imageUrl: "",
          imageFiles: [], useFileUpload: true,
        });
        setImagePreviews([]);
        setCurrentStep(1);
        if (onPropertyAdded) onPropertyAdded();
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred while saving the property.");
    } finally {
      setLoading(false);
    }
  };

  // If initialValues change (e.g., after fetch), update formData
  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
      // Show image previews from URLs if editing
      if (editMode) {
        // Support both imageUrl (single) and imageUrls (array)
        const urls: string[] = [];
        if (initialValues.imageUrls && Array.isArray(initialValues.imageUrls)) {
          urls.push(...initialValues.imageUrls);
        } else if (initialValues.imageUrl) {
          urls.push(initialValues.imageUrl);
        }
        setImagePreviews(urls);
      }
    }
  }, [initialValues, editMode]);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-lg ${currentStep >= step.number
            ? 'bg-blue-600 text-white'
            : 'bg-gray-600 text-gray-400'
            }`}>
            {step.icon}
          </div>
          <div className="ml-2 mr-6">
            <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-blue-400' : 'text-gray-400'
              }`}>
              Step {step.number}
            </div>
            <div className={`text-xs ${currentStep >= step.number ? 'text-white' : 'text-gray-500'
              }`}>
              {step.title}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mr-6 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-600'
              }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">💰 Financial Information</h2>

      <div>
        <label className="block text-sm font-medium mb-2">Property Price *</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400">$</span>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 pl-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="number"
            placeholder="250,000"
            value={formData.price ?? ""}
            onChange={e => updateFormData('price', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Listing Type *</label>
        <select
          className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={formData.listingType}
          onChange={e => updateFormData('listingType', e.target.value as 'sale' | 'rent')}
          required
        >
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-blue-400 text-lg">💡</span>
          </div>
          <div>
            <h3 className="text-blue-400 font-medium">Pricing Tips</h3>
            <p className="text-gray-300 text-sm mt-1">
              Research comparable properties in your area to set a competitive price.
              Consider market conditions and property condition when pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">🏠 House Details</h2>

      <div>
        <label className="block text-sm font-medium mb-2">Property Title *</label>
        <input
          className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
          type="text"
          placeholder="Beautiful 3-bedroom family home"
          value={formData.title ?? ""}
          onChange={e => updateFormData('title', e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description *</label>
        <textarea
          className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400 h-32"
          placeholder="Describe your property in detail..."
          value={formData.description ?? ""}
          onChange={e => updateFormData('description', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Property Type *</label>
          <select
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={formData.type}
            onChange={e => updateFormData('type', e.target.value)}
            required
          >
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="villa">Villa</option>
            <option value="townhouse">Townhouse</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bedrooms *</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="number"
            placeholder="3"
            value={formData.beds ?? ""}
            onChange={e => updateFormData('beds', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Bathrooms *</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="number"
            placeholder="2"
            value={formData.baths ?? ""}
            onChange={e => updateFormData('baths', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Square Feet</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="number"
            placeholder="2000"
            value={formData.squareFeet ?? ""}
            onChange={e => updateFormData('squareFeet', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Year Built</label>
        <input
          className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
          type="number"
          placeholder="2020"
          value={formData.yearBuilt ?? ""}
          onChange={e => updateFormData('yearBuilt', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Property Features</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availableFeatures.map(feature => (
            <label key={feature} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-700/50">
              <input
                type="checkbox"
                checked={formData.features.includes(feature)}
                onChange={() => handleFeatureToggle(feature)}
                className="rounded bg-[#232a36] border-[#232a36] text-blue-600 focus:ring-blue-600"
              />
              <span className="text-sm">{feature}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">📍 Location Information</h2>
      <div>
        <label className="block text-sm font-medium mb-2">Property Address *</label>
        <input
          className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
          type="text"
          placeholder="123 Main Street, City, State 12345"
          value={formData.location ?? ""}
          onChange={e => updateFormData('location', e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Latitude (Optional)</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="text"
            placeholder="40.7128"
            value={formData.lat ?? ""}
            onChange={e => updateFormData('lat', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Longitude (Optional)</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="text"
            placeholder="-74.0060"
            value={formData.lng ?? ""}
            onChange={e => updateFormData('lng', e.target.value)}
          />
        </div>
      </div>
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-green-400 text-lg">📍</span>
          </div>
          <div>
            <h3 className="text-green-400 font-medium">Location Tips</h3>
            <p className="text-gray-300 text-sm mt-1">
              Enter the full property address. Optionally, you can provide latitude and longitude for more precise location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">📸 Property Images</h2>

      <div className="flex items-center space-x-4 mb-4">
        <button
          type="button"
          onClick={() => updateFormData('useFileUpload', true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.useFileUpload
            ? 'bg-blue-600 text-white'
            : 'bg-[#232a36] text-gray-400 hover:text-white'
            }`}
        >
          📁 Upload Files
        </button>
        <button
          type="button"
          onClick={() => updateFormData('useFileUpload', false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!formData.useFileUpload
            ? 'bg-blue-600 text-white'
            : 'bg-[#232a36] text-gray-400 hover:text-white'
            }`}
        >
          🔗 Image URL
        </button>
      </div>

      {formData.useFileUpload ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Property Images *</label>
            <input
              className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required={!formData.imageUrl}
            />
          </div>

          {imagePreviews.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-4">
                📷 Image Previews ({imagePreviews.length} selected)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={preview}
                      alt={`Property preview ${index + 1}`}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg border border-[#232a36] group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {index === 0 ? '⭐ Main' : `${index + 1}`}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 text-gray-300 hover:text-white transition-colors"
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadingImages && (
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Uploading images...</span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-2">Image URL *</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.imageUrl ?? ""}
            onChange={e => updateFormData('imageUrl', e.target.value)}
            required={formData.imageFiles.length === 0}
          />
        </div>
      )}

      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-purple-400 text-lg">💡</span>
          </div>
          <div>
            <h3 className="text-purple-400 font-medium">Photo Tips</h3>
            <p className="text-gray-300 text-sm mt-1">
              The first image will be used as the main property photo. Include photos of
              key rooms, exterior views, and special features to attract more buyers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#1a1f2e] border border-[#232a36] rounded-2xl p-8 shadow-2xl">
      {renderStepIndicator()}
      <div className="min-h-[500px]">
        {renderCurrentStep()}
      </div>
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mt-6">
          {error}
        </div>
      )}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <div className="flex space-x-4">
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{editMode ? "Saving..." : "Adding Property..."}</span>
                </div>
              ) : (
                editMode ? '💾 Save Changes' : '✨ Add Property'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
