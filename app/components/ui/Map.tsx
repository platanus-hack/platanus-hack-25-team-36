"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type Marker = {
  title: string;
  description: string;
  longitude: number;
  latitude: number;
  color: string;
};

type Props = {
  markers: Marker[];
};

const Map = ({ markers }: Props) => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-70.6009, -33.4173],
      zoom: 12,
    });

    markers.forEach((marker) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<strong>${marker.title}</strong><p>${marker.description}</p>`
      );

      new mapboxgl.Marker({
        color: marker.color,
      })
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map);
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      })
    );

    return () => map.remove();
  }, [markers]);

  return <div className="w-150 h-150" ref={mapContainerRef} />;
};

export default Map;
