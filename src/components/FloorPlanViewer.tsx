"use client";
import Image from "next/image";
import { useState } from "react";

interface FloorPlan {
  id: string;
  name: string;
  imageUrl: string;
  level?: string;
  area?: number;
  rooms?: string[];
}

interface FloorPlanViewerProps {
  floorPlans: FloorPlan[];
  propertyTitle: string;
}

export function FloorPlanViewer({ floorPlans, propertyTitle }: FloorPlanViewerProps) {
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!floorPlans || floorPlans.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          Floor Plans
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <p className="text-gray-600">Floor plans will be available soon</p>
        </div>
      </div>
    );
  }

  const currentPlan = floorPlans[currentPlanIndex];

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            Floor Plans
          </h3>

          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="text-sm font-medium">Fullscreen</span>
          </button>
        </div>

        {/* Floor Plan Navigation */}
        {floorPlans.length > 1 && (
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {floorPlans.map((plan, index) => (
                <button
                  key={plan.id}
                  onClick={() => setCurrentPlanIndex(index)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${currentPlanIndex === index
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {plan.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Floor Plan */}
        <div className="space-y-4">
          {/* Plan Info */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <h4 className="font-semibold text-gray-900">{currentPlan.name}</h4>
              {currentPlan.level && (
                <p className="text-sm text-gray-600">{currentPlan.level}</p>
              )}
            </div>
            <div className="text-right">
              {currentPlan.area && (
                <p className="text-sm font-medium text-gray-900">
                  {currentPlan.area.toLocaleString()} sq ft
                </p>
              )}
              {currentPlan.rooms && (
                <p className="text-xs text-gray-600">
                  {currentPlan.rooms.length} rooms
                </p>
              )}
            </div>
          </div>

          {/* Floor Plan Image */}
          <div className="relative bg-gray-100 rounded-xl overflow-hidden">
            <Image
              src={currentPlan.imageUrl}
              alt={`${propertyTitle} - ${currentPlan.name}`}
              width={800}
              height={600}
              className="w-full h-auto max-h-96 object-contain"
            />

            {/* Zoom controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <button className="w-10 h-10 bg-white/90 hover:bg-white rounded-lg shadow-md flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              <button className="w-10 h-10 bg-white/90 hover:bg-white rounded-lg shadow-md flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Room Details */}
          {currentPlan.rooms && currentPlan.rooms.length > 0 && (
            <div className="bg-purple-50 rounded-xl p-4">
              <h5 className="font-medium text-gray-900 mb-3">Rooms in this floor:</h5>
              <div className="flex flex-wrap gap-2">
                {currentPlan.rooms.map((room, index) => (
                  <span
                    key={index}
                    className="bg-white text-purple-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                  >
                    {room}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <Image
              src={currentPlan.imageUrl}
              alt={`${propertyTitle} - ${currentPlan.name}`}
              width={1200}
              height={900}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />

            {/* Plan info overlay */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <h4 className="font-semibold">{currentPlan.name}</h4>
              {currentPlan.area && (
                <p className="text-sm opacity-90">{currentPlan.area.toLocaleString()} sq ft</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
