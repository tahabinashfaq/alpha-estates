"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface AgentProfile {
  id: string;
  name: string;
  photo: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  bio: string;
  specialties: string[];
  languages: string[];
  experience: number;
  totalSales: number;
  averagePrice: number;
  serviceAreas: string[];
  rating: number;
  reviewCount: number;
  responseTime: string;
  certifications: string[];
  recentSales: Array<{
    address: string;
    price: number;
    date: string;
    type: 'sold' | 'listed';
  }>;
  reviews: Array<{
    id: string;
    clientName: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }>;
}

interface AgentProfileProps {
  agentId: string;
  onContactAgent?: () => void;
}

export function AgentProfile({ agentId, onContactAgent }: AgentProfileProps) {
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    // Simulate fetching agent data
    setTimeout(() => {
      setAgent({
        id: agentId,
        name: "Sarah Johnson",
        photo: "/api/placeholder/150/150",
        title: "Senior Real Estate Agent",
        company: "Alpha Properties Group",
        phone: "(555) 123-4567",
        email: "sarah.johnson@alphaprop.com",
        bio: "With over 8 years of experience in residential real estate, I specialize in helping families find their dream homes in the greater metropolitan area. My commitment to personalized service and deep market knowledge has helped over 200 families successfully buy or sell their properties.",
        specialties: ["First-time homebuyers", "Luxury homes", "Investment properties", "Relocation services"],
        languages: ["English", "Spanish", "French"],
        experience: 8,
        totalSales: 247,
        averagePrice: 485000,
        serviceAreas: ["Downtown", "Westside", "North Hills", "Riverside"],
        rating: 4.8,
        reviewCount: 156,
        responseTime: "Within 1 hour",
        certifications: ["ABR - Accredited Buyer's Representative", "CRS - Certified Residential Specialist", "SRES - Seniors Real Estate Specialist"],
        recentSales: [
          { address: "123 Oak Street", price: 675000, date: "2024-03-15", type: "sold" },
          { address: "456 Pine Avenue", price: 425000, date: "2024-03-10", type: "sold" },
          { address: "789 Maple Drive", price: 550000, date: "2024-03-05", type: "listed" },
        ],
        reviews: [
          {
            id: "1",
            clientName: "Michael Chen",
            rating: 5,
            comment: "Sarah made our home buying process incredibly smooth. Her knowledge of the market and attention to detail were exceptional. Highly recommended!",
            date: "2024-03-20",
            verified: true
          },
          {
            id: "2",
            clientName: "Lisa Rodriguez",
            rating: 5,
            comment: "Outstanding service from start to finish. Sarah was always available to answer questions and provided excellent guidance throughout the entire process.",
            date: "2024-03-15",
            verified: true
          },
          {
            id: "3",
            clientName: "David Thompson",
            rating: 4,
            comment: "Very professional and knowledgeable. Helped us find the perfect home within our budget. Great communication throughout.",
            date: "2024-03-10",
            verified: true
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [agentId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-500">Agent profile not found</p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">({agent.reviewCount} reviews)</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <Image
              src={agent.photo}
              alt={agent.name}
              width={120}
              height={120}
              className="rounded-full object-cover border-4 border-blue-100"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{agent.name}</h2>
            <p className="text-lg text-gray-600 mb-2">{agent.title}</p>
            <p className="text-blue-600 font-medium mb-3">{agent.company}</p>

            {renderStars(agent.rating)}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {agent.phone}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Response time: {agent.responseTime}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={onContactAgent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Contact Agent
            </button>
            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
              View Listings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{agent.experience}</div>
          <div className="text-sm text-gray-600">Years Experience</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{agent.totalSales}</div>
          <div className="text-sm text-gray-600">Total Sales</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">${Math.round(agent.averagePrice / 1000)}K</div>
          <div className="text-sm text-gray-600">Avg Sale Price</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{agent.rating}</div>
          <div className="text-sm text-gray-600">Rating</div>
        </div>
      </div>

      {/* About & Specialties */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">About {agent.name}</h3>
        <p className="text-gray-700 mb-6">{agent.bio}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {agent.specialties.map((specialty, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Languages</h4>
            <div className="flex flex-wrap gap-2">
              {agent.languages.map((language, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {language}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-3">Service Areas</h4>
          <div className="flex flex-wrap gap-2">
            {agent.serviceAreas.map((area, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-3">Certifications</h4>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {agent.certifications.map((cert, index) => (
              <li key={index} className="text-sm">{cert}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Sales</h3>
        <div className="space-y-3">
          {agent.recentSales.map((sale, index) => (
            <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{sale.address}</div>
                <div className="text-sm text-gray-600">{new Date(sale.date).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">${sale.price.toLocaleString()}</div>
                <div className={`text-sm ${sale.type === 'sold' ? 'text-green-600' : 'text-blue-600'}`}>
                  {sale.type === 'sold' ? 'Sold' : 'Listed'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Client Reviews</h3>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{agent.rating}</div>
            <div className="text-sm text-gray-600">out of 5 stars</div>
          </div>
        </div>

        <div className="space-y-4">
          {(showAllReviews ? agent.reviews : agent.reviews.slice(0, 3)).map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-gray-900 flex items-center">
                    {review.clientName}
                    {review.verified && (
                      <svg className="w-4 h-4 text-green-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {renderStars(review.rating)}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.date).toLocaleDateString()}
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>

        {agent.reviews.length > 3 && (
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAllReviews ? 'Show Less' : `Show All ${agent.reviews.length} Reviews`}
          </button>
        )}
      </div>
    </div>
  );
}
