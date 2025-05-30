"use client";

interface PropertySpecification {
  category: string;
  icon: string;
  items: {
    label: string;
    value: string | number;
    unit?: string;
    highlight?: boolean;
  }[];
}

interface PropertySpecificationsProps {
  property: {
    id: string;
    type?: string;
    beds?: number;
    baths?: number;
    squareFeet?: number;
    yearBuilt?: number;
    lotSize?: number;
    parkingSpaces?: number;
    features?: string[];
    // Enhanced specifications
    specifications?: {
      interior?: Record<string, string>;
      exterior?: Record<string, string>;
      utilities?: Record<string, string>;
      community?: Record<string, string>;
    };
  };
}

export function PropertySpecifications({ property }: PropertySpecificationsProps) {
  // Generate specifications from property data
  const specifications: PropertySpecification[] = [
    {
      category: "Property Details",
      icon: "🏠",
      items: [
        { label: "Property Type", value: property.type || "N/A" },
        { label: "Bedrooms", value: property.beds || 0, highlight: true },
        { label: "Bathrooms", value: property.baths || 0, highlight: true },
        { label: "Square Feet", value: property.squareFeet || 0, unit: "sq ft", highlight: true },
        { label: "Year Built", value: property.yearBuilt || "N/A" },
        { label: "Lot Size", value: property.lotSize || 0, unit: "sq ft" },
        { label: "Parking Spaces", value: property.parkingSpaces || 0 },
      ].filter(item => item.value !== 0 && item.value !== "N/A")
    },
    {
      category: "Interior Features",
      icon: "🛋️",
      items: [
        ...(property.specifications?.interior ?
          Object.entries(property.specifications.interior).map(([key, value]) => ({
            label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            value: value
          })) : []),
        // Default interior features if not specified
        ...(property.specifications?.interior ? [] : [
          { label: "Flooring", value: "Hardwood, Tile, Carpet" },
          { label: "Kitchen", value: "Updated with Modern Appliances" },
          { label: "Air Conditioning", value: "Central A/C" },
          { label: "Heating", value: "Forced Air" },
        ])
      ]
    },
    {
      category: "Exterior Features",
      icon: "🌳",
      items: [
        ...(property.specifications?.exterior ?
          Object.entries(property.specifications.exterior).map(([key, value]) => ({
            label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            value: value
          })) : []),
        // Default exterior features if not specified
        ...(property.specifications?.exterior ? [] : [
          { label: "Exterior Material", value: "Brick, Siding" },
          { label: "Roof", value: "Shingle" },
          { label: "Landscaping", value: "Professional" },
          { label: "Driveway", value: "Concrete" },
        ])
      ]
    },
    {
      category: "Utilities & Systems",
      icon: "⚡",
      items: [
        ...(property.specifications?.utilities ?
          Object.entries(property.specifications.utilities).map(([key, value]) => ({
            label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            value: value
          })) : []),
        // Default utilities if not specified
        ...(property.specifications?.utilities ? [] : [
          { label: "Water", value: "City" },
          { label: "Sewer", value: "City" },
          { label: "Electric", value: "220V" },
          { label: "Gas", value: "Natural Gas" },
        ])
      ]
    }
  ];

  // Add community features if available
  if (property.specifications?.community || property.features) {
    specifications.push({
      category: "Community & Amenities",
      icon: "🏘️",
      items: [
        ...(property.specifications?.community ?
          Object.entries(property.specifications.community).map(([key, value]) => ({
            label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            value: value
          })) : []),
        // Use property features as community amenities
        ...(property.features ?
          property.features.slice(0, 8).map(feature => ({
            label: feature,
            value: "Available"
          })) : [])
      ]
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h.01M9 16h.01" />
          </svg>
        </div>
        Property Specifications
      </h3>

      <div className="space-y-8">
        {specifications.map((spec, index) => (
          spec.items.length > 0 && (
            <div key={index} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <span className="text-2xl">{spec.icon}</span>
                <h4 className="text-lg font-semibold text-gray-900">{spec.category}</h4>
              </div>

              {/* Specification Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spec.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`flex justify-between items-center p-4 rounded-lg transition-colors ${item.highlight
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200"
                        : "bg-gray-50 hover:bg-gray-100"
                      }`}
                  >
                    <div className="flex-1">
                      <span className={`font-medium ${item.highlight ? "text-indigo-900" : "text-gray-700"
                        }`}>
                        {item.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${item.highlight ? "text-indigo-700" : "text-gray-900"
                        }`}>
                        {typeof item.value === 'number' && item.value > 0
                          ? item.value.toLocaleString()
                          : item.value}
                      </span>
                      {item.unit && (
                        <span className={`text-sm ml-1 ${item.highlight ? "text-indigo-600" : "text-gray-500"
                          }`}>
                          {item.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}

        {/* Key Features Summary */}
        {property.features && property.features.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <span className="text-2xl">✨</span>
              <h4 className="text-lg font-semibold text-gray-900">Key Features</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {property.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-green-800 font-medium text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Energy Efficiency */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Energy Efficiency</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">A+</div>
              <div className="text-sm text-gray-600">Energy Rating</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">LED</div>
              <div className="text-sm text-gray-600">Lighting</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">Smart</div>
              <div className="text-sm text-gray-600">Thermostat</div>
            </div>
          </div>
        </div>

        {/* Property History */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Property Timeline</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">Year Built</span>
              <span className="font-semibold text-gray-900">{property.yearBuilt || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">Last Renovation</span>
              <span className="font-semibold text-gray-900">2023</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-gray-700">Property Age</span>
              <span className="font-semibold text-gray-900">
                {property.yearBuilt ? new Date().getFullYear() - property.yearBuilt : "N/A"} years
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
