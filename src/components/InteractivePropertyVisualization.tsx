/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface PropertyVisualization {
  type: 'gallery' | 'virtual-tour' | 'floor-plan' | '3d-model';
  title: string;
  data: PropertyGallery | VirtualTourData | FloorPlanData | Model3DData;
}

interface VirtualTourData {
  tourUrl: string;
  provider?: string;
}

interface FloorPlanData {
  imageUrl: string;
  rooms: {
    name: string;
    area?: string;
    coordinates?: { x: number; y: number; width: number; height: number };
  }[];
}

interface Model3DData {
  modelUrl: string;
  provider?: string;
}

interface PropertyGallery {
  images: {
    id: string;
    url: string;
    caption?: string;
    room?: string;
    angle?: string;
  }[];
}

interface InteractivePropertyVisualizationProps {
  visualizations: PropertyVisualization[];
  propertyTitle: string;
}

export function InteractivePropertyVisualization({
  visualizations,
  propertyTitle
}: InteractivePropertyVisualizationProps) {
  const [activeVisualization, setActiveVisualization] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const currentVisualization = visualizations[activeVisualization];  // Type guards for proper type checking
  const isGalleryData = (data: unknown): data is PropertyGallery => {
    return Boolean(data && typeof data === 'object' && data !== null && 'images' in data && Array.isArray((data as PropertyGallery).images));
  };

  const isVirtualTourData = (data: unknown): data is VirtualTourData => {
    return Boolean(data && typeof data === 'object' && data !== null && 'tourUrl' in data && typeof (data as VirtualTourData).tourUrl === 'string');
  };

  const isFloorPlanData = (data: unknown): data is FloorPlanData => {
    return Boolean(data && typeof data === 'object' && data !== null && 'imageUrl' in data && 'rooms' in data &&
      typeof (data as FloorPlanData).imageUrl === 'string' && Array.isArray((data as FloorPlanData).rooms));
  };

  const is3DModelData = (data: unknown): data is Model3DData => {
    return Boolean(data && typeof data === 'object' && data !== null && 'modelUrl' in data && typeof (data as Model3DData).modelUrl === 'string');
  };

  // Reset zoom and pan when changing visualizations
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setCurrentImageIndex(0);
  }, [activeVisualization]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(1, Math.min(3, zoomLevel + delta));
    setZoomLevel(newZoom);
    if (newZoom === 1) {
      setPanPosition({ x: 0, y: 0 });
    }
  };

  const renderGalleryVisualization = (gallery: PropertyGallery) => {
    const currentImage = gallery.images[currentImageIndex];

    return (
      <div className="space-y-4">
        {/* Main Image Display */}
        <div
          ref={imageRef}
          className="relative bg-gray-900 rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing"
          style={{ height: isFullscreen ? '80vh' : '500px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="relative w-full h-full transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`
            }}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.caption || `${propertyTitle} - ${currentImage.room || 'Property'}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Image Info Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white rounded-lg px-4 py-2 backdrop-blur-sm">
            <div className="text-sm font-medium">{currentImage.room || 'Property View'}</div>
            {currentImage.caption && (
              <div className="text-xs text-gray-300">{currentImage.caption}</div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              {currentImageIndex + 1} of {gallery.images.length}
            </div>
          </div>

          {/* Navigation Arrows */}
          {gallery.images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(prev =>
                  prev === 0 ? gallery.images.length - 1 : prev - 1
                )}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all opacity-0 group-hover:opacity-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setCurrentImageIndex(prev =>
                  prev === gallery.images.length - 1 ? 0 : prev + 1
                )}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all opacity-0 group-hover:opacity-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleZoom(0.5)}
                disabled={zoomLevel >= 3}
                className="p-2 text-white hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>

              <button
                onClick={() => handleZoom(-0.5)}
                disabled={zoomLevel <= 1}
                className="p-2 text-white hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                </svg>
              </button>

              <div className="text-white text-xs text-center px-2">
                {Math.round(zoomLevel * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {gallery.images.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {gallery.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <Image
                  src={image.url}
                  alt={image.caption || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {image.room && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center truncate">
                    {image.room}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderVirtualTour = (_tourData: VirtualTourData) => {
    return (
      <div className="space-y-4">
        <div className="bg-gray-100 rounded-xl p-8 text-center" style={{ height: isFullscreen ? '80vh' : '500px' }}>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">360° Virtual Tour</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Experience this property in immersive 360° virtual reality. Walk through each room and explore every detail.
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Start Virtual Tour
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFloorPlan = (_floorPlanData: FloorPlanData) => {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-6" style={{ height: isFullscreen ? '80vh' : '500px' }}>
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Floor Plan</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Explore the property layout with our interactive floor plan. Click on rooms to see details and measurements.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                View Floor Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const render3DModel = (_modelData: Model3DData) => {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8" style={{ height: isFullscreen ? '80vh' : '500px' }}>
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3D Property Model</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Explore the property in full 3D. Rotate, zoom, and examine the property from every angle with our interactive 3D model.
              </p>
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Launch 3D Viewer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!visualizations || visualizations.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          Interactive Visualization
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600">Interactive visualizations coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            Interactive Visualization
          </h3>

          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="text-sm font-medium">Fullscreen</span>
          </button>
        </div>

        {/* Visualization Type Selector */}
        {visualizations.length > 1 && (
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {visualizations.map((viz, index) => (
                <button
                  key={index}
                  onClick={() => setActiveVisualization(index)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${activeVisualization === index
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${viz.type === 'gallery' ? 'bg-blue-100 text-blue-600' :
                      viz.type === 'virtual-tour' ? 'bg-purple-100 text-purple-600' :
                        viz.type === 'floor-plan' ? 'bg-green-100 text-green-600' :
                          'bg-indigo-100 text-indigo-600'
                      }`}>
                      {viz.type === 'gallery' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {viz.type === 'virtual-tour' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                      )}
                      {viz.type === 'floor-plan' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {viz.type === '3d-model' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 capitalize">{viz.type.replace('-', ' ')}</h4>
                      <p className="text-xs text-gray-600">{viz.title}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>)}        {/* Render Current Visualization */}
        <div className="space-y-4">
          {currentVisualization.type === 'gallery' && isGalleryData(currentVisualization.data) &&
            renderGalleryVisualization(currentVisualization.data)}
          {currentVisualization.type === 'virtual-tour' && isVirtualTourData(currentVisualization.data) &&
            renderVirtualTour(currentVisualization.data)}
          {currentVisualization.type === 'floor-plan' && isFloorPlanData(currentVisualization.data) &&
            renderFloorPlan(currentVisualization.data)}
          {currentVisualization.type === '3d-model' && is3DModelData(currentVisualization.data) &&
            render3DModel(currentVisualization.data)}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/90 text-white">
            <h2 className="text-lg font-semibold">{propertyTitle} - {currentVisualization.title}</h2>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>          <div className="flex-1 p-4">
            {currentVisualization.type === 'gallery' && isGalleryData(currentVisualization.data) &&
              renderGalleryVisualization(currentVisualization.data)}
            {currentVisualization.type === 'virtual-tour' && isVirtualTourData(currentVisualization.data) &&
              renderVirtualTour(currentVisualization.data)}
            {currentVisualization.type === 'floor-plan' && isFloorPlanData(currentVisualization.data) &&
              renderFloorPlan(currentVisualization.data)}
            {currentVisualization.type === '3d-model' && is3DModelData(currentVisualization.data) &&
              render3DModel(currentVisualization.data)}
          </div>
        </div>
      )}
    </>
  );
}
