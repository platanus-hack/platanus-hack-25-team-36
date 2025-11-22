"use client";

import { LngLatBounds } from "mapbox-gl";
import MapComponent from "../ui/Map";
import { useMapData } from "../../hooks/api";
import { MapPin } from "@/types/app";

import "mapbox-gl/dist/mapbox-gl.css";
import { Suspense } from "react";

// Interface for markers expected by MapComponent
interface MapComponentMarker {
  title: string;
  description: string;
  longitude: number;
  latitude: number;
  color: string;
}

/**
 * Parses MapPin data from API to format expected by MapComponent
 */
const parseMapDataToMarkers = (mapPins: MapPin[]): MapComponentMarker[] => {
  return mapPins.map((pin) => ({
    title: pin.title,
    description: pin.description,
    longitude: pin.location.point.coordinates[0], // GeoJSON format: [longitude, latitude]
    latitude: pin.location.point.coordinates[1],
    color: pin.colour || "#9ECAD6", // Default color if not provided
  }));
};

const Map = () => {
  const { data: mapData, isLoading, error, refetch } = useMapData();

  console.log("Map data:", mapData);

  // Fallback markers if API fails or while loading
  const fallbackMarkers: MapComponentMarker[] = [
    {
      title: "Marker 1",
      description: "Description 1",
      longitude: -70.598,
      latitude: -33.415,
      color: "#A1BC98",
    },
    {
      title: "Marker 2",
      description: "Description 2",
      longitude: -70.599,
      latitude: -33.422,
      color: "#AAC4F5",
    },
    {
      title: "Marker 3",
      description: "Description 3",
      longitude: -70.601,
      latitude: -33.414,
      color: "#E9B63B",
    },
    {
      title: "Marker 4",
      description: "Description 4",
      longitude: -70.603,
      latitude: -33.418,
      color: "#B77466",
    },
  ];

  const onChangeBounds = (newBounds: LngLatBounds) => {
    console.log("New bounds:", newBounds);
  };

  // Error state with retry option and fallback
  if (error) {
    console.error("Map data fetch error:", error);
    // Still render the map with fallback data
    return (
      <div className="relative">
        <MapComponent
          markers={fallbackMarkers}
          onChangeBounds={onChangeBounds}
        />
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow">
          <span>API Error</span>
          <button
            onClick={() => refetch()}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log("Raw API data:", mapData?.data);

  // Parse API data to markers format, or use fallback markers
  const markers = mapData?.data
    ? parseMapDataToMarkers(mapData.data)
    : fallbackMarkers;

  console.log("Parsed markers:", markers);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-100 animate-pulse rounded flex items-center justify-center">
        <div className="text-gray-500">Loading map data...</div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading map...</div>}>
      <MapComponent markers={markers} onChangeBounds={onChangeBounds} />
    </Suspense>
  );
};

export default Map;
