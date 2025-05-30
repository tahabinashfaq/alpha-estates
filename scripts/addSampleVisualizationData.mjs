// Add sample interactive visualization data to properties in Firebase
import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBBJe0QWl_Vo2kEfJhCGVzF2aBKRUqNII",
  authDomain: "alpha-estates-35a8c.firebaseapp.com",
  projectId: "alpha-estates-35a8c",
  storageBucket: "alpha-estates-35a8c.appspot.com",
  messagingSenderId: "473346938896",
  appId: "1:473346938896:web:e88b36cbcdc982c87b02a3",
  measurementId: "G-41LHGXR9QV",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleVisualizations = [
  // Visualization set 1 - Luxury House
  {
    visualizations: [
      {
        type: "gallery",
        title: "Property Gallery",
        data: {
          images: [
            {
              id: "1",
              url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
              caption:
                "Living Room - Open concept design with modern furniture",
              room: "Living Room",
              angle: "Main View",
            },
            {
              id: "2",
              url: "https://images.unsplash.com/photo-1556912167-f556f1f39eb4?w=800",
              caption: "Kitchen - Gourmet kitchen with granite countertops",
              room: "Kitchen",
              angle: "Main View",
            },
            {
              id: "3",
              url: "https://images.unsplash.com/photo-1556909195-f7b15e6c0bb5?w=800",
              caption: "Master Bedroom - Spacious bedroom with walk-in closet",
              room: "Master Bedroom",
              angle: "Main View",
            },
            {
              id: "4",
              url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800",
              caption: "Bathroom - Luxury bathroom with marble finishes",
              room: "Master Bathroom",
              angle: "Main View",
            },
            {
              id: "5",
              url: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
              caption: "Dining Room - Elegant dining space",
              room: "Dining Room",
              angle: "Main View",
            },
            {
              id: "6",
              url: "https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=800",
              caption: "Home Office - Bright and productive workspace",
              room: "Home Office",
              angle: "Main View",
            },
          ],
        },
      },
      {
        type: "virtual-tour",
        title: "360° Virtual Tour",
        data: {
          tourUrl: "https://example.com/360-tour",
          duration: 8,
          roomCount: 12,
        },
      },
      {
        type: "floor-plan",
        title: "Interactive Floor Plan",
        data: {
          levels: ["Ground Floor", "Second Floor"],
          totalArea: 3200,
          rooms: [
            "Living Room",
            "Kitchen",
            "Dining Room",
            "Master Bedroom",
            "Guest Bedroom",
            "Home Office",
          ],
        },
      },
      {
        type: "3d-model",
        title: "3D Property Model",
        data: {
          modelUrl: "https://example.com/3d-model",
          hasVR: true,
          features: ["Rotate", "Zoom", "Room Selection", "Measurements"],
        },
      },
    ],
  },
  // Visualization set 2 - Modern Apartment
  {
    visualizations: [
      {
        type: "gallery",
        title: "Apartment Gallery",
        data: {
          images: [
            {
              id: "1",
              url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
              caption: "Open Living Space - Modern and bright",
              room: "Living Room",
              angle: "Wide View",
            },
            {
              id: "2",
              url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
              caption: "Kitchen - Sleek design with island",
              room: "Kitchen",
              angle: "Main View",
            },
            {
              id: "3",
              url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
              caption: "Bedroom - Cozy and comfortable",
              room: "Bedroom",
              angle: "Main View",
            },
            {
              id: "4",
              url: "https://images.unsplash.com/photo-1564540583246-934409427776?w=800",
              caption: "Balcony - City views",
              room: "Balcony",
              angle: "Outdoor View",
            },
          ],
        },
      },
      {
        type: "virtual-tour",
        title: "360° Tour",
        data: {
          tourUrl: "https://example.com/360-tour-apt",
          duration: 5,
          roomCount: 6,
        },
      },
      {
        type: "floor-plan",
        title: "Floor Plan",
        data: {
          levels: ["Single Level"],
          totalArea: 1200,
          rooms: ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Balcony"],
        },
      },
    ],
  },
  // Visualization set 3 - Family Home
  {
    visualizations: [
      {
        type: "gallery",
        title: "Family Home Gallery",
        data: {
          images: [
            {
              id: "1",
              url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
              caption: "Family Room - Perfect for gatherings",
              room: "Family Room",
              angle: "Main View",
            },
            {
              id: "2",
              url: "https://images.unsplash.com/photo-1556909114-4f5f0d0e3e16?w=800",
              caption: "Kitchen - Heart of the home",
              room: "Kitchen",
              angle: "Main View",
            },
            {
              id: "3",
              url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
              caption: "Backyard - Great for kids and pets",
              room: "Backyard",
              angle: "Garden View",
            },
          ],
        },
      },
      {
        type: "virtual-tour",
        title: "Virtual Walkthrough",
        data: {
          tourUrl: "https://example.com/family-tour",
          duration: 10,
          roomCount: 15,
        },
      },
    ],
  },
];

async function addVisualizationData() {
  try {
    console.log("🚀 Starting to add sample visualization data...");

    const propertiesRef = collection(db, "properties");
    const snapshot = await getDocs(propertiesRef);

    if (snapshot.empty) {
      console.log("❌ No properties found in database");
      return;
    }

    const properties = snapshot.docs;
    console.log(`📋 Found ${properties.length} properties in database`);

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const visualizationIndex = i % sampleVisualizations.length;
      const visualizationData = sampleVisualizations[visualizationIndex];

      try {
        await updateDoc(doc(db, "properties", property.id), {
          visualizations: visualizationData.visualizations,
        });

        console.log(
          `✅ Updated property ${i + 1}/${properties.length}: ${
            property.data().title || property.id
          }`
        );
        console.log(
          `   📊 Added ${visualizationData.visualizations.length} visualization types`
        );
      } catch (error) {
        console.error(`❌ Failed to update property ${property.id}:`, error);
      }
    }

    console.log("🎉 Successfully added visualization data to all properties!");
    console.log("📝 Visualization types added:");
    console.log("   🖼️  Interactive Gallery with room-specific images");
    console.log("   🌐 360° Virtual Tours");
    console.log("   📐 Interactive Floor Plans");
    console.log("   🏗️  3D Property Models");
  } catch (error) {
    console.error("❌ Error adding visualization data:", error);
  }
}

// Run the script
addVisualizationData()
  .then(() => {
    console.log("📋 Script completed");
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
  });
