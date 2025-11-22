"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { uploadPictureToS3 } from "@/app/services/s3";
import { useCreatePin } from "@/app/hooks/api";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type Marker = {
  title: string;
  description: string;
  longitude: number;
  latitude: number;
  color: string;
};

type Props = {
  markers?: Marker[];
  onChangeBounds?: (newBounds: mapboxgl.LngLatBounds) => void;
};

const Map = ({ markers = [], onChangeBounds }: Props) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
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
      map.on("moveend", () => {
        console.log("Map moved, checking bounds...");
        if (onChangeBounds) {
          console.log("Calling onChangeBounds with new bounds");
          const bounds = map.getBounds();
          console.log("New bounds:", bounds);
          if (bounds) {
            onChangeBounds(bounds);
          }
        }
      });
    });

    mapRef.current = map;

    // Add click handler for pin creation
    map.on("click", (e) => {
      if (isCreatingPin) {
        setClickedLocation({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        setShowForm(true);
        console.log("Map clicked at:", e.lngLat.lng, e.lngLat.lat);
      }
    });

    // Change cursor when in creation mode
    map.on("mouseenter", () => {
      if (isCreatingPin) {
        map.getCanvas().style.cursor = "crosshair";
      }
    });

    map.on("mouseleave", () => {
      map.getCanvas().style.cursor = "";
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

    // Test marker to verify marker functionality works
    map.on("load", () => {
      console.log("Map loaded, adding test marker...");
      new mapboxgl.Marker({ color: "#00ff00" })
        .setLngLat([-70.6009, -33.4173])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            "<div><strong>Test Marker</strong><p>This marker tests if markers work</p></div>"
          )
        )
        .addTo(map);
      console.log("Test marker added successfully");
    });

    return () => map.remove();
  }, [markers, onChangeBounds, isCreatingPin]);

  // Helper: Create marker popup HTML
  const createPopupHTML = (
    title: string,
    description: string,
    address: string,
    pictureUrl: string
  ) => {
    return `<div>
      <strong>${title}</strong>
      ${description ? `<p>${description}</p>` : ""}
      <p><small>📍 ${address}</small></p>
      ${pictureUrl ? `<p><small>📷 Image uploaded</small></p>` : ""}
    </div>`;
  };

  // Helper: Add marker to map
  const addMarkerToMap = (
    location: { lng: number; lat: number },
    popupHTML: string
  ) => {
    if (!mapRef.current) {
      throw new Error("Map not ready");
    }

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML);
    const marker = new mapboxgl.Marker({ color: "#ef4444" })
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
    picture?: File;
  }) => {
    if (!clickedLocation) return;

    try {
      // Step 1: Upload picture if provided
      let pictureUrl = "";
      if (formData.picture && formData.picture.size > 0) {
        try {
          pictureUrl = await uploadPictureToS3(formData.picture);
        } catch {
          alert("Picture upload failed, but pin will be created without image");
        }
      }

      // Step 2: Add marker to map
      const popupHTML = createPopupHTML(
        formData.title,
        formData.description,
        formData.address,
        pictureUrl
      );
      try {
        addMarkerToMap(clickedLocation, popupHTML);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        alert("Failed to add marker to map: " + errorMessage);
        return;
      }

      // Step 3: Save to database using React Query
      try {
        await createPinMutation.mutateAsync({
          formData: {
            title: formData.title,
            description: formData.description,
            address: formData.address,
            colour: "#ef4444",
            picture: pictureUrl,
          },
          location: {
            lng: clickedLocation.lng,
            lat: clickedLocation.lat,
            radius: 100,
          },
        });
        alert("Pin created and saved successfully!");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        alert(`Pin created on map but failed to save: ${errorMessage}`);
      }

      // Step 4: Reset states
      setShowForm(false);
      setClickedLocation(null);
      setIsCreatingPin(false);
    } catch (error) {
      console.error("Error creating pin:", error);
      alert(
        `Failed to create pin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Add Pin Button */}
      <button
        className={`absolute bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 ${
          isCreatingPin
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        } text-white flex items-center justify-center`}
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
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {isCreatingPin ? (
            <path d="M18 6L6 18M6 6L18 18" />
          ) : (
            <path d="M12 5v14m-7-7h14" />
          )}
        </svg>
      </button>

      {/* Pin Creation Mode Indicator */}
      {isCreatingPin && !showForm && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-10">
          📍 Click on the map to place a pin
        </div>
      )}

      {/* Simple Pin Creation Form Modal */}
      {showForm && clickedLocation && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none p-4 overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full max-h-full overflow-y-auto pointer-events-auto border-2 border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create New Pin
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log("Form submission started");

                const formData = new FormData(e.currentTarget);
                const title = formData.get("title") as string;
                const description = formData.get("description") as string;
                const address = formData.get("address") as string;
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
                if (!title || !address) {
                  alert(
                    "Please fill in all required fields (Title and Address)"
                  );
                  return;
                }

                if (!clickedLocation) {
                  alert(
                    "No location selected. Please try clicking on the map again."
                  );
                  return;
                }

                handleCreatePin({
                  title: title.trim(),
                  description: description?.trim() || "",
                  address: address.trim(),
                  picture:
                    pictureFile && pictureFile.size > 0
                      ? pictureFile
                      : undefined,
                });
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Title *
                </label>
                <input
                  name="title"
                  required
                  className="w-full p-3 border-2 border-gray-800 rounded-lg text-gray-900"
                  placeholder="Pin title"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  className="w-full p-3 border-2 border-gray-800 rounded-lg text-gray-900"
                  rows={3}
                  placeholder="Describe this location..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Address *
                </label>
                <input
                  name="address"
                  required
                  className="w-full p-3 border-2 border-gray-800 rounded-lg text-gray-900"
                  placeholder="Enter address"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Picture (optional)
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
                  <strong>Location:</strong> {clickedLocation.lat.toFixed(6)},{" "}
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Create Pin
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
