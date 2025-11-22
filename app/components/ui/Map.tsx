"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const Map = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-70.6693, -33.4489],
      zoom: 12,
    });

    // Render custom marker components
    /* geoJson.features.forEach((feature) => {
      // Create a React ref
      const ref = React.createRef();
      // Create a new DOM node and save it to the React ref
      ref.current = document.createElement('div');
      // Render a Marker Component on our new DOM node
      createRoot(ref.current).render(
        <Marker onClick={markerClicked} feature={feature} />
      );

      // Create a Mapbox Marker at our new DOM node
      new mapboxgl.Marker(ref.current)
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);
    }); */

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
  }, []);

  const markerClicked = (title: string) => {
    window.alert(title);
  };

  return <div className="w-100 h-100" ref={mapContainerRef} />;
};

export default Map;
