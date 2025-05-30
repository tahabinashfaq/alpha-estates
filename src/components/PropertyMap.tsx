"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Property } from "./PropertyList";

interface PropertyMapProps {
  properties: Property[];
}

export default function PropertyMap({ properties }: PropertyMapProps) {
  const defaultPosition = [40.7128, -74.006]; // New York City
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="w-full h-full flex items-center justify-center text-gray-400">Loading map...</div>;
  return (
    // @ts-expect-error: react-leaflet type mismatch, center prop is valid
    <MapContainer center={defaultPosition} zoom={12} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {properties.map((p, i) => {
        const lat = typeof p.lat === "number" ? p.lat : defaultPosition[0] + i * 0.01;
        const lng = typeof p.lng === "number" ? p.lng : defaultPosition[1] + i * 0.01;
        return (
          <Marker key={p.id} position={[lat, lng]}>
            <Popup>
              <div className="font-bold">{p.title}</div>
              <div>{p.location}</div>
              <div>${p.price.toLocaleString()}</div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
