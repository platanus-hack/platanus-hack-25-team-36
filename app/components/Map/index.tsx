"use client";

import { useState, useEffect } from "react";
import Content from "./Content";

const Map = () => {
  const [initialLatitude, setInitialLatitude] = useState<number | undefined>(
    undefined
  );
  const [initialLongitude, setInitialLongitude] = useState<number | undefined>(
    undefined
  );
  const [initialZoom, setInitialZoom] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setInitialLatitude(position.coords.latitude);
          setInitialLongitude(position.coords.longitude);
          setInitialZoom(10);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <Content
      initialLatitude={initialLatitude}
      initialLongitude={initialLongitude}
      initialZoom={initialZoom}
    />
  );
};

export default Map;
