"use client";
import { getAuth } from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import Image from "next/image";
import { useState } from "react";
import { app } from "../firebase";

interface AddPropertyFormProps {
  onPropertyAdded?: () => void;
}

export function AddPropertyForm({ onPropertyAdded }: AddPropertyFormProps) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("house");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState(""); const [imageUrl, setImageUrl] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [useFileUpload, setUseFileUpload] = useState(true);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [features, setFeatures] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const db = getFirestore(app);
  const auth = getAuth(app);

  const availableFeatures = [
    'Pool', 'Garage', 'Garden', 'Fireplace', 'Balcony', 'Parking',
    'Air Conditioning', 'Heating', 'Hardwood Floors', 'Updated Kitchen',
    'Walk-in Closet', 'Laundry Room', 'Security System', 'Gym'
  ];
  const handleFeatureToggle = (feature: string) => {
    setFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(files);
      // Create previews for all files
      const previews: string[] = [];
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews[index] = reader.result as string;
          if (previews.length === files.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'alpha_argons');
    formData.append('folder', 'properties');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  };

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadImageToCloudinary(file));
    return Promise.all(uploadPromises);
  }; const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to add a property.");

      let uploadedImageUrls: string[] = [];

      // Upload images to Cloudinary if files are selected
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        try {
          uploadedImageUrls = await uploadMultipleImages(imageFiles);
        } catch {
          throw new Error("Failed to upload images. Please try again.");
        } finally {
          setUploadingImages(false);
        }
      } else if (imageUrl) {
        // If using URL input, store as single image array
        uploadedImageUrls = [imageUrl];
      }

      if (uploadedImageUrls.length === 0) {
        throw new Error("Please provide at least one image for the property.");
      }

      await addDoc(collection(db, "properties"), {
        title,
        price: Number(price),
        location,
        description,
        type,
        beds: Number(beds),
        baths: Number(baths),
        imageUrl: uploadedImageUrls[0], // Keep first image as primary for backward compatibility
        imageUrls: uploadedImageUrls, // New field for multiple images
        realtorId: user.uid,
        createdAt: new Date(),
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        squareFeet: squareFeet ? Number(squareFeet) : undefined,
        yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
        listingType,
        features
      });

      // Reset form
      setTitle(""); setPrice(""); setLocation(""); setDescription("");
      setType("house"); setBeds(""); setBaths(""); setImageUrl("");
      setImageFiles([]); setImagePreviews([]); setUseFileUpload(true);
      setLat(""); setLng(""); setSquareFeet(""); setYearBuilt("");
      setListingType('sale'); setFeatures([]);
      if (onPropertyAdded) onPropertyAdded();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Error adding property");
    }
    setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[#181c23] p-8 rounded-xl shadow-lg border border-[#232a36] max-w-4xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">Add New Property</h2>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Property Title *</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="text"
            placeholder="Beautiful Family Home"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price *</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="number"
            placeholder="500000"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location *</label>
        <input
          className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
          type="text"
          placeholder="123 Main St, City, State"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description *</label>
        <textarea
          className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400 h-32"
          placeholder="Describe your property..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Property Type *</label>
          <select
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={type}
            onChange={e => setType(e.target.value)}
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
            value={beds}
            onChange={e => setBeds(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bathrooms *</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="number"
            placeholder="2"
            value={baths}
            onChange={e => setBaths(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Listing Type *</label>
          <select
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={listingType}
            onChange={e => setListingType(e.target.value as 'sale' | 'rent')}
            required
          >
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Square Feet</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="number"
            placeholder="2000"
            value={squareFeet}
            onChange={e => setSquareFeet(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Year Built</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="number"
            placeholder="2020"
            value={yearBuilt}
            onChange={e => setYearBuilt(e.target.value)}
          />
        </div>
      </div>      <div>
        <label className="block text-sm font-medium mb-2">Property Image *</label>
        <div className="space-y-4">
          {/* Toggle between file upload and URL */}
          <div className="flex items-center space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setUseFileUpload(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${useFileUpload
                ? 'bg-blue-600 text-white'
                : 'bg-[#232a36] text-gray-400 hover:text-white'
                }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUseFileUpload(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!useFileUpload
                ? 'bg-blue-600 text-white'
                : 'bg-[#232a36] text-gray-400 hover:text-white'
                }`}
            >
              Image URL
            </button>
          </div>

          {useFileUpload ? (
            <>              <input
              className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required={!imageUrl}
            />
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Image Previews ({imagePreviews.length} selected):</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={preview}
                          alt={`Property preview ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg border border-[#232a36]"
                        />
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          {index === 0 ? 'Main' : index + 1}
                        </div>
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
            </>
          ) : (
            <input
              className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)} required={imageFiles.length === 0 && !imageUrl}
            />
          )}
        </div>
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium mb-3">Property Features</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {availableFeatures.map(feature => (
            <label key={feature} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={features.includes(feature)}
                onChange={() => handleFeatureToggle(feature)}
                className="rounded bg-[#232a36] border-[#232a36] text-blue-600 focus:ring-blue-600"
              />
              <span className="text-sm">{feature}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Coordinates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Latitude (Optional)</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="text"
            placeholder="40.7128"
            value={lat}
            onChange={e => setLat(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Longitude (Optional)</label>
          <input
            className="w-full bg-[#232a36] border border-[#232a36] text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            type="text"
            placeholder="-74.0060"
            value={lng}
            onChange={e => setLng(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white p-3 rounded-lg font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Adding Property...</span>
          </div>
        ) : 'Add Property'}
      </button>
    </form>
  );
}
