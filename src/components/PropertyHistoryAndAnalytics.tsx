"use client";
import { useEffect, useState } from "react";

interface PropertyHistoryProps {
  property: {
    id: string;
    price: number;
    location: string;
    squareFeet: number;
    type: string;
  };
}

interface PriceHistory {
  date: string;
  price: number;
  event: 'listed' | 'price_change' | 'sold' | 'withdrawn';
}

interface MarketStats {
  averagePrice: number;
  pricePerSqFt: number;
  daysOnMarket: number;
  priceChange30Days: number;
  priceChange12Months: number;
  similarPropertiesSold: number;
  marketTrend: 'rising' | 'stable' | 'declining';
}

export function PropertyHistoryAndAnalytics({ property }: PropertyHistoryProps) {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching price history and market data
    setTimeout(() => {
      setPriceHistory([
        { date: '2024-01-15', price: property.price + 25000, event: 'listed' },
        { date: '2024-02-20', price: property.price + 10000, event: 'price_change' },
        { date: '2024-03-10', price: property.price, event: 'price_change' },
      ]);

      setMarketStats({
        averagePrice: property.price * 0.95,
        pricePerSqFt: Math.round(property.price / (property.squareFeet || 1000)),
        daysOnMarket: 45,
        priceChange30Days: -2.5,
        priceChange12Months: 8.2,
        similarPropertiesSold: 12,
        marketTrend: 'stable'
      });

      setLoading(false);
    }, 1000);
  }, [property]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Stats Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Market Analysis</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              ${marketStats?.pricePerSqFt.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Price per sq ft</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {marketStats?.daysOnMarket}
            </div>
            <div className="text-sm text-gray-600">Days on market</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className={`text-2xl font-bold ${(marketStats?.priceChange30Days || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {(marketStats?.priceChange30Days || 0) >= 0 ? '+' : ''}
              {marketStats?.priceChange30Days}%
            </div>
            <div className="text-sm text-gray-600">30-day change</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className={`text-2xl font-bold ${(marketStats?.priceChange12Months || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {(marketStats?.priceChange12Months || 0) >= 0 ? '+' : ''}
              {marketStats?.priceChange12Months}%
            </div>
            <div className="text-sm text-gray-600">12-month change</div>
          </div>
        </div>

        {/* Market Trend Indicator */}
        <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${marketStats?.marketTrend === 'rising' ? 'bg-green-500' :
              marketStats?.marketTrend === 'declining' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
          <span className="font-medium text-gray-900">
            Market Trend: <span className="capitalize">{marketStats?.marketTrend}</span>
          </span>
        </div>
      </div>

      {/* Price History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Price History</h3>

        {priceHistory.length > 0 ? (
          <div className="space-y-4">
            {priceHistory.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${entry.event === 'listed' ? 'bg-blue-500' :
                      entry.event === 'price_change' ? 'bg-orange-500' :
                        entry.event === 'sold' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      ${entry.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${entry.event === 'listed' ? 'bg-blue-100 text-blue-800' :
                      entry.event === 'price_change' ? 'bg-orange-100 text-orange-800' :
                        entry.event === 'sold' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                    }`}>
                    {entry.event.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No price history available
          </div>
        )}
      </div>

      {/* Comparable Properties */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Comparable Sales</h3>

        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {marketStats?.similarPropertiesSold} similar properties
          </div>
          <div className="text-sm text-gray-600">
            sold in the last 6 months in this area
          </div>
          <button className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm">
            View Comparable Sales →
          </button>
        </div>
      </div>

      {/* Neighborhood Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Neighborhood Insights</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Property Types</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Single Family</span>
                <span className="font-medium">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Condos</span>
                <span className="font-medium">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Townhouses</span>
                <span className="font-medium">10%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Market Activity</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg. Days on Market</span>
                <span className="font-medium">32 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Homes Sold (Last 30d)</span>
                <span className="font-medium">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price/List Ratio</span>
                <span className="font-medium">98.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
