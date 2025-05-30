"use client";
import { useEffect, useState } from "react";

interface NeighborhoodData {
  name: string;
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  crimeRate: 'low' | 'moderate' | 'high';
  schoolRating: number;
  averagePrice: number;
  priceChange: number;
  demographics: {
    medianAge: number;
    averageIncome: number;
    familyFriendly: boolean;
  };
  amenities: {
    restaurants: number;
    shopping: number;
    entertainment: number;
    healthcare: number;
    education: number;
  };
  commuteData: {
    toDowntown: string;
    publicTransport: boolean;
    majorHighways: string[];
  };
  schools: Array<{
    name: string;
    type: 'elementary' | 'middle' | 'high';
    rating: number;
    distance: string;
  }>;
}

interface NeighborhoodInsightsProps {
  location: string;
  propertyPrice?: number;
}

export function NeighborhoodInsights({ location, propertyPrice }: NeighborhoodInsightsProps) {
  const [data, setData] = useState<NeighborhoodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'schools' | 'transport' | 'lifestyle'>('overview');

  useEffect(() => {
    // Simulate fetching neighborhood data
    setTimeout(() => {
      setData({
        name: location || "Downtown District",
        walkScore: 85,
        transitScore: 72,
        bikeScore: 68,
        crimeRate: 'low',
        schoolRating: 8.5,
        averagePrice: 650000,
        priceChange: 5.2,
        demographics: {
          medianAge: 34,
          averageIncome: 75000,
          familyFriendly: true
        },
        amenities: {
          restaurants: 45,
          shopping: 28,
          entertainment: 12,
          healthcare: 8,
          education: 15
        },
        commuteData: {
          toDowntown: "15 minutes",
          publicTransport: true,
          majorHighways: ["I-95", "Route 1", "US-202"]
        },
        schools: [
          { name: "Washington Elementary", type: 'elementary', rating: 9.1, distance: "0.3 miles" },
          { name: "Lincoln Middle School", type: 'middle', rating: 8.7, distance: "0.8 miles" },
          { name: "Jefferson High School", type: 'high', rating: 8.9, distance: "1.2 miles" }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [location]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Neighborhood Insights</h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
          <span className="text-gray-600">Loading neighborhood data...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCrimeColor = (rate: string) => {
    switch (rate) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Neighborhood Insights</h3>
        <span className="text-lg font-semibold text-blue-600">{data.name}</span>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: '🏠' },
          { id: 'schools', label: 'Schools', icon: '🎓' },
          { id: 'transport', label: 'Transport', icon: '🚌' },
          { id: 'lifestyle', label: 'Lifestyle', icon: '🌟' }
        ].map(tab => (
          <button
            key={tab.id}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors ${activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-800 font-medium">Walk Score</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(data.walkScore)}`}>
                    {data.walkScore}
                  </span>
                </div>
                <p className="text-blue-700 text-sm">Most errands can be accomplished on foot</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-800 font-medium">Transit Score</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(data.transitScore)}`}>
                    {data.transitScore}
                  </span>
                </div>
                <p className="text-green-700 text-sm">Excellent public transportation</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-800 font-medium">Bike Score</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(data.bikeScore)}`}>
                    {data.bikeScore}
                  </span>
                </div>
                <p className="text-purple-700 text-sm">Very bikeable with good infrastructure</p>
              </div>
            </div>

            {/* Market Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Market Overview
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Median Home Price</span>
                    <span className="font-semibold">${data.averagePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price Change (12 months)</span>
                    <span className={`font-semibold ${data.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.priceChange >= 0 ? '+' : ''}{data.priceChange}%
                    </span>
                  </div>
                  {propertyPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Property vs. Average</span>
                      <span className={`font-semibold ${propertyPrice > data.averagePrice ? 'text-red-600' : 'text-green-600'}`}>
                        {propertyPrice > data.averagePrice ? 'Above' : 'Below'} average
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Safety & Demographics
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crime Rate</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCrimeColor(data.crimeRate)}`}>
                      {data.crimeRate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Median Age</span>
                    <span className="font-semibold">{data.demographics.medianAge} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Income</span>
                    <span className="font-semibold">${data.demographics.averageIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Family Friendly</span>
                    <span className={`font-semibold ${data.demographics.familyFriendly ? 'text-green-600' : 'text-gray-600'}`}>
                      {data.demographics.familyFriendly ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schools' && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-blue-900">School District Rating</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-blue-600">{data.schoolRating}</span>
                  <span className="text-blue-600">/10</span>
                </div>
              </div>
              <p className="text-blue-800">Excellent schools with strong academic performance</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Nearby Schools</h4>
              {data.schools.map((school, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">{school.name}</h5>
                    <p className="text-sm text-gray-600 capitalize">{school.type} School • {school.distance}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{school.rating}/10</div>
                    <div className="text-xs text-gray-500">GreatSchools Rating</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'transport' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Commute Times
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-800">To Downtown</span>
                    <span className="font-semibold text-green-900">{data.commuteData.toDowntown}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-800">Public Transport</span>
                    <span className={`font-semibold ${data.commuteData.publicTransport ? 'text-green-600' : 'text-red-600'}`}>
                      {data.commuteData.publicTransport ? 'Available' : 'Limited'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Major Highways
                </h4>
                <div className="space-y-2">
                  {data.commuteData.majorHighways.map((highway, index) => (
                    <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block mr-2">
                      {highway}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lifestyle' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900">Local Amenities</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(data.amenities).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{value}</div>
                  <div className="text-sm text-gray-600 capitalize">{key}</div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-4">What Makes This Neighborhood Special</h4>
              <div className="space-y-3 text-purple-800">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  <span>Walkable downtown area with vibrant nightlife</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  <span>Family-friendly parks and recreational facilities</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  <span>Growing tech hub with new businesses</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  <span>Easy access to major employment centers</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
