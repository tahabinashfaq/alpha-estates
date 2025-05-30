// Sample data script for Enhanced Property Details (FR006)
// This script adds sample floor plans, virtual tours, and specifications to existing properties

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";

// Firebase configuration (same as in firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyDJNCu9w-eDm3WjGzd7NdEWgY3V6X5A6r4",
  authDomain: "alpha-argons.firebaseapp.com",
  projectId: "alpha-argons",
  storageBucket: "alpha-argons.firebasestorage.app",
  messagingSenderId: "1082024476092",
  appId: "1:1082024476092:web:9b24f5bc9ee6e9fbc7c15c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample floor plans data
const sampleFloorPlans = [
  {
    id: "fp1",
    name: "Main Floor",
    imageUrl:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
    level: "Ground Floor",
    area: 1250,
    rooms: ["Living Room", "Kitchen", "Dining Room", "Half Bath"],
  },
  {
    id: "fp2",
    name: "Upper Floor",
    imageUrl:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=entropy&cs=tinysrgb",
    level: "Second Floor",
    area: 950,
    rooms: [
      "Master Bedroom",
      "Bedroom 2",
      "Bedroom 3",
      "Full Bath",
      "Master Bath",
    ],
  },
  {
    id: "fp3",
    name: "Basement",
    imageUrl:
      "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop",
    level: "Basement",
    area: 600,
    rooms: ["Family Room", "Storage", "Utility Room"],
  },
];

// Sample virtual tours data
const sampleVirtualTours = [
  {
    id: "vt1",
    name: "360° Home Tour",
    type: "360",
    url: "https://kuula.co/share/collection/7lHBG?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1",
    thumbnail:
      "https://images.unsplash.com/photo-1560449752-c0dfc88ee4c6?w=400&h=300&fit=crop",
    roomCount: 8,
  },
  {
    id: "vt2",
    name: "Property Walkthrough Video",
    type: "video",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1560448076-6ea4ac6c2094?w=400&h=300&fit=crop",
    duration: 180,
  },
  {
    id: "vt3",
    name: "Photo Gallery Tour",
    type: "slideshow",
    url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    thumbnail:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
  },
];

// Sample specifications data
const sampleSpecifications = {
  interior: {
    Flooring: "Hardwood and Tile",
    "Kitchen Appliances": "Stainless Steel Package",
    Countertops: "Granite",
    Cabinets: "Custom Wood",
    HVAC: "Central Air & Heat",
    Fireplace: "Gas Fireplace in Living Room",
    Windows: "Double Pane, Energy Efficient",
    "Ceiling Height": "9 feet",
  },
  exterior: {
    Roof: "Asphalt Shingles",
    Siding: "Brick and Vinyl",
    Garage: "2-Car Attached",
    Driveway: "Concrete",
    Fencing: "Privacy Fence in Backyard",
    Landscaping: "Professional Landscaping",
    "Patio/Deck": "Covered Patio",
    "Sprinkler System": "Automatic",
  },
  utilities: {
    Water: "City Water",
    Sewer: "City Sewer",
    Electricity: "220V Electric",
    Gas: "Natural Gas",
    Internet: "Fiber Ready",
    Cable: "Cable Ready",
  },
  community: {
    HOA: "Yes - $150/month",
    "School District": "Excellent Schools",
    "Nearby Parks": "Community Park (0.5 miles)",
    Shopping: "Shopping Center (1 mile)",
    Transportation: "Bus Stop (0.2 miles)",
    Hospitals: "Regional Medical Center (3 miles)",
  },
};

async function addEnhancedPropertyData() {
  try {
    console.log("🚀 Starting to add Enhanced Property Details sample data...");

    // Get all properties
    const propertiesSnapshot = await getDocs(collection(db, "properties"));
    const properties = propertiesSnapshot.docs;

    if (properties.length === 0) {
      console.log("❌ No properties found in the database");
      return;
    }

    console.log(
      `📋 Found ${properties.length} properties. Adding enhanced data...`
    );

    // Update first few properties with sample data
    for (let i = 0; i < Math.min(3, properties.length); i++) {
      const property = properties[i];
      const propertyId = property.id;
      const propertyData = property.data();

      console.log(`📝 Updating property: ${propertyData.title || propertyId}`);

      await updateDoc(doc(db, "properties", propertyId), {
        floorPlans: sampleFloorPlans,
        virtualTours: sampleVirtualTours,
        specifications: sampleSpecifications,
        lotSize: 7500 + i * 1000, // Varying lot sizes
        parkingSpaces: 2 + i, // Varying parking spaces
        // Update any missing basic fields
        squareFeet: propertyData.squareFeet || 2000 + i * 300,
        yearBuilt: propertyData.yearBuilt || 2010 + i,
        features: propertyData.features || [
          "Hardwood Floors",
          "Granite Countertops",
          "Stainless Steel Appliances",
          "Walk-in Closets",
          "Central Air",
          "Fireplace",
          "Garage",
          "Fenced Yard",
        ],
      });

      console.log(`✅ Enhanced data added to property ${i + 1}`);
    }

    console.log("🎉 Successfully added Enhanced Property Details sample data!");
    console.log(
      "📍 You can now view properties with floor plans, virtual tours, and detailed specifications"
    );
  } catch (error) {
    console.error("❌ Error adding enhanced property data:", error);
  }
}

// Run the script
addEnhancedPropertyData().then(() => {
  console.log("🏁 Script completed");
  process.exit(0);
});
