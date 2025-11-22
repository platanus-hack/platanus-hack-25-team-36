"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Image from "next/image";
import { useCreatePin } from "@/app/hooks/api";
import { PinSubtype } from "@/types/app";
import { getAvailableCategories, getCategoryColor } from "@/app/utils/categoryColors";
import { getS3Url } from "@/app/services/s3";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type Marker = {
  id: string;
  title: string;
  description: string;
  longitude: number;
  latitude: number;
  color: string;
  picture?: string; // Pin image from form
  authorAvatar?: string; // User profile picture
};

type Props = {
  markers?: Marker[];
  onChangeCenter?: (longitude: number, latitude: number) => void;
};

type MarkerMap = globalThis.Map<string, mapboxgl.Marker>;

/**
 * Creates popup HTML content with image, title, and description
 * @param marker - Marker data including optional image URLs
 * @returns HTML string for popup content
 */
const createPopupContent = (marker: Marker): string => {
  const imageUrl = marker.picture || marker.authorAvatar;

  const imageHtml = imageUrl
    ? `<img src="${imageUrl}" alt="${marker.title}" style="
        width: 100%;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 12px;
        display: block;
      " />`
    : "";

  // Truncate description if longer than 20 characters
  const truncatedDescription =
    marker.description.length > 20
      ? marker.description.substring(0, 20) + ". . ."
      : marker.description;

  return `
    <div style="
      max-width: 280px;
      max-height: 400px;
      overflow-y: auto;
      overflow-x: hidden;
    ">
      ${imageHtml}
      <h3 style="
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: bold;
        line-height: 1.4;
      ">${marker.title}</h3>
      <a style="
        margin: 0;
        font-size: 14px;
        color: #2563eb;
        line-height: 1.5;
        display: block;
        text-decoration: underline;
        cursor: pointer;
        font-weight: 600;
        transition: color 0.2s;
      " onmouseover="this.style.color='#1d4ed8'" onmouseout="this.style.color='#2563eb'">${truncatedDescription}</a>
    </div>
  `;
};

const Map = ({ markers = [], onChangeCenter }: Props) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<MarkerMap>(new globalThis.Map<string, mapboxgl.Marker>());
  const lastValidMarkersRef = useRef<Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [showForm, setShowForm] = useState(false);

  // React Query hook for creating pins
  const createPinMutation = useCreatePin();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-70.6009, -33.4173],
      zoom: 12,
    });

    map.on("load", () => {
      setIsMapLoaded(true);
      map.on("moveend", () => {
        if (onChangeCenter) {
          const center = map.getCenter();
          if (center) {
            onChangeCenter(center.lng, center.lat);
          }
        }
      });
    });

    mapRef.current = map;

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

    return () => {
      setIsMapLoaded(false);
      // Clean up all markers
      const currentMarkers = markersRef.current;
      for (const marker of currentMarkers.values()) {
        marker.remove();
      }
      currentMarkers.clear();
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate useEffect to handle click events with updated isCreatingPin state
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      if (isCreatingPin) {
        setClickedLocation({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        setShowForm(true);
        console.log("Map clicked at:", e.lngLat.lng, e.lngLat.lat);
      }
    };

    const handleMouseMove = () => {
      if (isCreatingPin) {
        map.getCanvas().style.cursor = "crosshair";
      } else {
        map.getCanvas().style.cursor = "";
      }
    };

    map.on("click", handleMapClick);
    map.on("mousemove", handleMouseMove);

    // Set initial cursor
    handleMouseMove();

    return () => {
      map.off("click", handleMapClick);
      map.off("mousemove", handleMouseMove);
    };
  }, [isCreatingPin, isMapLoaded]);

  // Effect to add/remove markers when markers prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    // Use the new markers if available, otherwise keep the last valid markers
    // This prevents flickering when data is being fetched
    const markersToUse = markers.length > 0 ? markers : lastValidMarkersRef.current;

    // Update lastValidMarkersRef if we have new valid data
    if (markers.length > 0) {
      lastValidMarkersRef.current = markers;
    }

    // Create a Set of current marker IDs from the data we're using
    const currentMarkerIds = new Set(markersToUse.map((m) => m.id));

    // Remove markers that are no longer in the current data
    for (const [id, marker] of markersRef.current.entries()) {
      if (!currentMarkerIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    // Add new markers
    for (const marker of markersToUse) {
      if (!markersRef.current.has(marker.id)) {
        const popup = new mapboxgl.Popup({
          offset: {
            top: [0, 0],
            "top-left": [0, 0],
            "top-right": [0, 0],
            bottom: [0, -40],
            "bottom-left": [25, -40],
            "bottom-right": [-25, -40],
            left: [10, -20],
            right: [-10, -20],
          },
          closeButton: true,
          closeOnClick: true,
          maxWidth: "300px",
        }).setHTML(createPopupContent(marker));

        const mapMarker = new mapboxgl.Marker({
          color: marker.color,
        })
          .setLngLat([marker.longitude, marker.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.set(marker.id, mapMarker);
      }
    }
  }, [markers, isMapLoaded]);

  // Helper: Create marker popup HTML (for newly created pins)
  const createPopupHTML = (
    title: string,
    description: string,
    address: string,
    pictureUrl: string
  ) => {
    const imageHtml = pictureUrl
      ? `<img src="${pictureUrl}" alt="${title}" style="
          width: 100%;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 12px;
          display: block;
        " />`
      : '';

    // Truncate description if longer than 20 characters
    const truncatedDescription = description.length > 20
      ? description.substring(0, 20) + '. . .'
      : description;

    return `
      <div style="
        max-width: 280px;
        max-height: 400px;
        overflow-y: auto;
        overflow-x: hidden;
      ">
        ${imageHtml}
        <h3 style="
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: bold;
          line-height: 1.4;
        ">${title}</h3>
        <a style="
          margin: 0;
          font-size: 14px;
          color: #2563eb;
          line-height: 1.5;
          display: block;
          text-decoration: underline;
          cursor: pointer;
          font-weight: 600;
          transition: color 0.2s;
        " onmouseover="this.style.color='#1d4ed8'" onmouseout="this.style.color='#2563eb'">${truncatedDescription}</a>
      </div>
    `;
  };

  // Helper: Add marker to map
  const addMarkerToMap = (
    location: { lng: number; lat: number },
    popupHTML: string,
    color: string
  ) => {
    if (!mapRef.current) {
      throw new Error("Map not ready");
    }

    const popup = new mapboxgl.Popup({
      offset: {
        top: [0, 0],
        "top-left": [0, 0],
        "top-right": [0, 0],
        bottom: [0, -40],
        "bottom-left": [25, -40],
        "bottom-right": [-25, -40],
        left: [10, -20],
        right: [-10, -20],
      },
      closeButton: true,
      closeOnClick: true,
      maxWidth: "300px",
    }).setHTML(popupHTML);
    const marker = new mapboxgl.Marker({ color })
      .setLngLat([location.lng, location.lat])
      .setPopup(popup)
      .addTo(mapRef.current);

    // Pan to marker
    setTimeout(() => {
      mapRef.current!.flyTo({
        center: [location.lng, location.lat],
        zoom: Math.max(mapRef.current!.getZoom(), 16),
        duration: 1500,
      });
    }, 100);

    return marker;
  };

  // Main handler
  const handleCreatePin = async (formData: {
    title: string;
    description: string;
    address: string;
    subtype: PinSubtype;
    picture?: File;
  }) => {
    if (!clickedLocation) return;

    try {
      // Generate unique ID for this pin
      const uniqueId = `pin_${Date.now()}`;

      // Step 1: Generate AI background from description
      console.log("Generating AI background image...");
      const { generateBackgroundImage } = await import(
        "@/app/services/imageGeneration"
      );
      const { convertFileToBase64 } = await import("@/app/services/s3");

      const backgroundImage = await generateBackgroundImage(
        formData.description.trim()
      );

      if (!backgroundImage.b64_json) {
        throw new Error("Failed to generate background image");
      }

      // Upload background to pins/background_image/
      const backgroundResponse = await fetch("/api/s3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `pins/background_image/${uniqueId}.png`,
          imageBase64: `data:image/png;base64,${backgroundImage.b64_json}`,
        }),
      });

      if (!backgroundResponse.ok) {
        throw new Error("Failed to upload background image");
      }

      const backgroundResult = await backgroundResponse.json();
      const backgroundImageUrl = backgroundResult.s3Key;
      console.log("Background uploaded:", backgroundImageUrl);

      // Step 2: Upload user picture if provided
      let pictureUrl = "";
      if (formData.picture && formData.picture.size > 0) {
        try {
          console.log("Uploading user picture...");
          const imageBase64 = await convertFileToBase64(formData.picture);

          const imageResponse = await fetch("/api/s3", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: `pins/image/${uniqueId}.png`,
              imageBase64,
            }),
          });

          if (!imageResponse.ok) {
            throw new Error("Failed to upload user image");
          }

          const imageResult = await imageResponse.json();
          pictureUrl = imageResult.s3Key;
          console.log("User image uploaded:", pictureUrl);
        } catch {
          alert("Falló la carga de la imagen, pero el pin se creará sin imagen");
        }
      }

      // Step 3: Get the color based on the selected category
      const categoryColor = getCategoryColor(formData.subtype);

      // Step 4: Add marker to map
      // Convert S3 key to accessible URL
      const pictureDisplayUrl = pictureUrl ? getS3Url(pictureUrl) || "" : "";
      const popupHTML = createPopupHTML(
        formData.title,
        formData.description,
        formData.address,
        pictureDisplayUrl
      );
      try {
        addMarkerToMap(clickedLocation, popupHTML, categoryColor);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        alert("Error al agregar marcador al mapa: " + errorMessage);
        return;
      }

      // Step 5: Save to database using React Query

      try {
        await createPinMutation.mutateAsync({
          formData: {
            title: formData.title,
            description: formData.description,
            address: formData.address,
            subtype: formData.subtype,
            colour: categoryColor,
            picture: pictureUrl,
            background_image: backgroundImageUrl,
          },
          location: {
            lng: clickedLocation.lng,
            lat: clickedLocation.lat,
            radius: 100,
          },
        });
        alert("¡Pin creado y guardado exitosamente!");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        alert(`Pin creado en el mapa pero falló al guardar: ${errorMessage}`);
      }

      // Step 5: Reset states
      setShowForm(false);
      setClickedLocation(null);
      setIsCreatingPin(false);
    } catch (error) {
      console.error("Error creating pin:", error);
      alert(
        `Error al crear pin: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Add Pin Button */}
      <button
        className={`absolute bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center ${
          isCreatingPin
            ? "bg-gray-200 hover:bg-gray-300"
            : "bg-white hover:bg-gray-50"
        }`}
        onClick={() => {
          if (isCreatingPin) {
            setIsCreatingPin(false);
            setShowForm(false);
            setClickedLocation(null);
          } else {
            setIsCreatingPin(true);
            console.log(
              "Pin creation mode activated - click on the map to place a pin"
            );
          }
        }}
        title={isCreatingPin ? "Cancel pin creation" : "Add new pin"}
      >
        {isCreatingPin ? (
          <svg
            className="w-6 h-6 text-gray-900"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6L18 18" />
          </svg>
        ) : (
          <Image src="/assets/pin_2.png" alt="Add Pin" width={36} height={36} />
        )}
      </button>

      {/* Pin Creation Mode Indicator */}
      {isCreatingPin && !showForm && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-10">
          📍 Haz clic en el mapa para colocar un pin
        </div>
      )}

      {/* Simple Pin Creation Form Modal */}
      {showForm && clickedLocation && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none p-4 overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full max-h-full overflow-y-auto pointer-events-auto border-2 border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Crear Nuevo Pin
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log("Form submission started");

                const formData = new FormData(e.currentTarget);
                const title = formData.get("title") as string;
                const description = formData.get("description") as string;
                const address = formData.get("address") as string;
                const subtype = formData.get("subtype") as string;
                const pictureFile = formData.get("picture") as File;

                console.log("Form data extracted:");
                console.log("- Title:", title);
                console.log("- Description:", description);
                console.log("- Address:", address);
                console.log(
                  "- Picture file:",
                  pictureFile ? pictureFile.name : "none"
                );
                console.log(
                  "- Picture size:",
                  pictureFile ? pictureFile.size : 0
                );
                console.log("- Clicked location:", clickedLocation);

                // Validate required fields
                if (!title || !address || !subtype) {
                  alert(
                    "Por favor completa todos los campos requeridos (Título, Dirección y Categoría)"
                  );
                  return;
                }

                if (!clickedLocation) {
                  alert(
                    "No se ha seleccionado una ubicación. Por favor haz clic en el mapa nuevamente."
                  );
                  return;
                }

                handleCreatePin({
                  title: title.trim(),
                  description: description?.trim() || "",
                  address: address.trim(),
                  subtype: subtype as PinSubtype,
                  picture:
                    pictureFile && pictureFile.size > 0
                      ? pictureFile
                      : undefined,
                });
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Título *
                </label>
                <input
                  name="title"
                  required
                  className="w-full p-3 border-2 border-gray-800 rounded-lg text-gray-900"
                  placeholder="Título del pin"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  name="description"
                  className="w-full p-3 border-2 border-gray-800 rounded-lg text-gray-900"
                  rows={3}
                  placeholder="Describe esta ubicación..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Dirección *
                </label>
                <input
                  name="address"
                  required
                  className="w-full p-3 border-2 border-gray-800 rounded-lg text-gray-900"
                  placeholder="Ingresa la dirección"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Categoría *
                </label>
                <select
                  name="subtype"
                  required
                  className="w-full p-3 border-2 border-gray-800 rounded-lg text-gray-900"
                >
                  <option value="">Selecciona una categoría</option>
                  {getAvailableCategories().map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Imagen (opcional)
                </label>
                <input
                  name="picture"
                  type="file"
                  accept="image/*"
                  className="w-full p-3 border-2 border-gray-800 rounded-lg text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-blue-700"
                />
              </div>
              <div className="mb-4 p-3 bg-gray-100 border-2 border-gray-800 rounded-lg">
                <p className="text-sm text-gray-900 font-medium">
                  <strong>Ubicación:</strong> {clickedLocation.lat.toFixed(6)},{" "}
                  {clickedLocation.lng.toFixed(6)}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsCreatingPin(false);
                  }}
                  className="flex-1 px-4 py-3 text-gray-900 bg-gray-200 border-2 border-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Crear Pin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
