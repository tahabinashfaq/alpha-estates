'use client';

import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  HomeIcon,
  MapPinIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';

interface AnalyticsData {
  totalUsers: number;
  totalProperties: number;
  totalViews: number;
  totalBookmarks: number;
  newUsersThisMonth: number;
  newPropertiesThisMonth: number;
  averagePropertyPrice: number;
  topLocations: Array<{ location: string; count: number }>;
  priceRanges: Array<{ range: string; count: number }>;
  propertyTypes: Array<{ type: string; count: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    user?: string;
  }>;
}

export default function AdminAnalytics() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalProperties: 0,
    totalViews: 0,
    totalBookmarks: 0,
    newUsersThisMonth: 0,
    newPropertiesThisMonth: 0,
    averagePropertyPrice: 0,
    topLocations: [],
    priceRanges: [],
    propertyTypes: [],
    userGrowth: [],
    recentActivity: []
  });
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // Check if user is admin
    if (user.email !== 'admin@alphaargons.com') {
      router.push('/');
      return;
    }

    fetchAnalyticsData();
  }, [user, router, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Calculate date ranges
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch users data
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;

      // New users this month
      const newUsersQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
      );
      const newUsersSnapshot = await getDocs(newUsersQuery);
      const newUsersThisMonth = newUsersSnapshot.size;

      // Fetch properties data
      const propertiesQuery = query(collection(db, 'properties'));
      const propertiesSnapshot = await getDocs(propertiesQuery);
      const totalProperties = propertiesSnapshot.size;

      // New properties this month
      const newPropertiesQuery = query(
        collection(db, 'properties'),
        where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
      );
      const newPropertiesSnapshot = await getDocs(newPropertiesQuery);
      const newPropertiesThisMonth = newPropertiesSnapshot.size;

      // Calculate average property price
      let totalPrice = 0;
      const properties = propertiesSnapshot.docs;
      properties.forEach(doc => {
        const data = doc.data();
        if (data.price) {
          totalPrice += data.price;
        }
      });
      const averagePropertyPrice = properties.length > 0 ? totalPrice / properties.length : 0;

      // Analyze property locations
      const locationCounts: { [key: string]: number } = {};
      properties.forEach(doc => {
        const data = doc.data();
        const location = data.location || data.city || 'Unknown';
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      });
      const topLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Analyze property types
      const typeCounts: { [key: string]: number } = {};
      properties.forEach(doc => {
        const data = doc.data();
        const type = data.type || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      const propertyTypes = Object.entries(typeCounts)
        .map(([type, count]) => ({ type, count }));

      // Price range analysis
      const priceRanges = [
        { range: '$0 - $100k', count: 0 },
        { range: '$100k - $300k', count: 0 },
        { range: '$300k - $500k', count: 0 },
        { range: '$500k - $1M', count: 0 },
        { range: '$1M+', count: 0 }
      ];

      properties.forEach(doc => {
        const data = doc.data();
        const price = data.price || 0;
        if (price < 100000) priceRanges[0].count++;
        else if (price < 300000) priceRanges[1].count++;
        else if (price < 500000) priceRanges[2].count++;
        else if (price < 1000000) priceRanges[3].count++;
        else priceRanges[4].count++;
      });

      // Fetch bookmarks data
      const bookmarksQuery = query(collection(db, 'bookmarks'));
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      const totalBookmarks = bookmarksSnapshot.size;

      // Generate recent activity (mock data for now)
      const recentActivity = [
        {
          id: '1',
          type: 'user_registration',
          description: 'New user registered: john.doe@email.com',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          user: 'john.doe@email.com'
        },
        {
          id: '2',
          type: 'property_added',
          description: 'New property listed: Luxury Villa in Beverly Hills',
          timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000)
        },
        {
          id: '3',
          type: 'property_approved',
          description: 'Property approved: Modern Apartment Downtown',
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000)
        },
        {
          id: '4',
          type: 'user_login',
          description: 'User login: sarah.wilson@email.com',
          timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
          user: 'sarah.wilson@email.com'
        }
      ];

      // User growth data (mock for last 6 months)
      const userGrowth = [
        { month: 'Jan', users: Math.max(0, totalUsers - 150) },
        { month: 'Feb', users: Math.max(0, totalUsers - 120) },
        { month: 'Mar', users: Math.max(0, totalUsers - 90) },
        { month: 'Apr', users: Math.max(0, totalUsers - 60) },
        { month: 'May', users: Math.max(0, totalUsers - 30) },
        { month: 'Jun', users: totalUsers }
      ];

      setAnalytics({
        totalUsers,
        totalProperties,
        totalViews: totalBookmarks * 5, // Estimate views based on bookmarks
        totalBookmarks,
        newUsersThisMonth,
        newPropertiesThisMonth,
        averagePropertyPrice,
        topLocations,
        priceRanges,
        propertyTypes,
        userGrowth,
        recentActivity
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UsersIcon className="h-4 w-4 text-blue-500" />;
      case 'property_added':
        return <HomeIcon className="h-4 w-4 text-green-500" />;
      case 'property_approved':
        return <ChartBarIcon className="h-4 w-4 text-emerald-500" />;
      case 'user_login':
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <EyeIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Platform insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="1year">Last year</option>
              </select>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers.toLocaleString()}</p>                <p className="text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +{analytics.newUsersThisMonth} this month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HomeIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalProperties.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +{analytics.newPropertiesThisMonth} this month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Estimated from bookmarks</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Property Price</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.averagePropertyPrice)}</p>
                <p className="text-sm text-gray-500">Across all listings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Locations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-blue-600" />
              Top Locations
            </h3>
            <div className="space-y-4">
              {analytics.topLocations.map((location, index) => (
                <div key={location.location} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900">{location.location}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{location.count} properties</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HomeIcon className="h-5 w-5 mr-2 text-green-600" />
              Property Types
            </h3>
            <div className="space-y-4">              {analytics.propertyTypes.map((type) => (
              <div key={type.type} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 capitalize">{type.type}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(type.count / analytics.totalProperties) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{type.count}</span>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Price Ranges */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2 text-yellow-600" />
              Price Ranges
            </h3>
            <div className="space-y-3">              {analytics.priceRanges.map((range) => (
              <div key={range.range} className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{range.range}</span>
                <span className="text-sm font-medium text-gray-600">{range.count}</span>
              </div>
            ))}
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-blue-600" />
              User Growth
            </h3>
            <div className="space-y-3">              {analytics.userGrowth.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{month.month}</span>
                <span className="text-sm font-medium text-gray-600">{month.users}</span>
              </div>
            ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-purple-600" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
