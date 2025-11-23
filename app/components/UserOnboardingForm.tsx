"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import RegionesYComunas from "./communes";

const interestOptions = [
  { label: "Cafes", emoji: "☕" },
  { label: "Comunidades", emoji: "👥" },
  { label: "Eventos", emoji: "🎉" },
  { label: "Pet friendly", emoji: "🐾" },
  { label: "Vegan", emoji: "🌱" },
  { label: "Local services", emoji: "🔧" },
  { label: "Videogames", emoji: "🎮" },
  { label: "Markets", emoji: "🛒" },
];

export default function UserOnboardingForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const userName = session?.user?.name || "";
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [regionSearchTerm, setRegionSearchTerm] = useState("");
  const [communeSearchTerm, setCommuneSearchTerm] = useState("");
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showCommuneDropdown, setShowCommuneDropdown] = useState(false);

  const filteredRegions = RegionesYComunas.filter((region) =>
    region.name.toLowerCase().includes(regionSearchTerm.toLowerCase())
  );

  const availableCommunes =
    RegionesYComunas.find((region) => region.name === selectedRegion)
      ?.communes || [];

  const filteredCommunes = availableCommunes.filter((commune) =>
    commune.toLowerCase().includes(communeSearchTerm.toLowerCase())
  );

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleSubmit = async () => {
    if (!selectedRegion || !selectedCommune) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    if (!session?.user?.id) {
      alert("No se pudo identificar tu sesión. Por favor, inicia sesión nuevamente.");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Convert region/commune to latitude/longitude using geocoding service
      // For now, using placeholder coordinates (Santiago, Chile)
      // You should implement geocoding to convert region/commune to actual coordinates
      const placeholderLatitude = -33.4489; // Santiago, Chile latitude
      const placeholderLongitude = -70.6693; // Santiago, Chile longitude

      const response = await fetch("/api/user-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: placeholderLatitude,
          longitude: placeholderLongitude,
          interests: selectedInterests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      await response.json();
      router.push("/");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error instanceof Error ? error.message : "Error al enviar los datos. Por favor, intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50 px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #000' }}>
        <Image
          src="/web-app-manifest-512x512.png"
          alt="Pasa el dato"
          width={48}
          height={48}
        />
        <Image
          src="/header-min.png"
          alt="Pasa el dato"
          width={200}
          height={70}
          className="absolute left-1/2 transform -translate-x-1/2 md:w-[300px] w-[200px]"
        />
        <div className="w-12"></div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md space-y-6">

        {/* Greeting */}
        {userName && (
          <div>
            <h2 className="text-2xl font-medium mb-6" style={{ color: "var(--foreground)" }}>
              ¡Hola {userName}!
            </h2>
          </div>
        )}

        {/* Region Autocomplete */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
            ¿En qué región vives?
          </label>
          <div className="relative">
            <input
              type="text"
              value={selectedRegion || regionSearchTerm}
              onChange={(e) => {
                setRegionSearchTerm(e.target.value);
                setSelectedRegion("");
                setSelectedCommune("");
                setShowRegionDropdown(true);
              }}
              onFocus={() => setShowRegionDropdown(true)}
              placeholder="Santiago ..."
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{
                backgroundColor: "white",
                border: "1.5px solid rgb(0, 0, 0)",
                boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                color: "var(--foreground)",
              }}
            />
            {showRegionDropdown && filteredRegions.length > 0 && (
              <div
                className="absolute z-10 w-full mt-2 rounded-lg overflow-hidden max-h-48 overflow-y-auto"
                style={{
                  backgroundColor: "white",
                  border: "1.5px solid rgb(0, 0, 0)",
                  boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
                }}
              >
                {filteredRegions.map((region) => (
                  <div
                    key={region.name}
                    onClick={() => {
                      setSelectedRegion(region.name);
                      setRegionSearchTerm("");
                      setShowRegionDropdown(false);
                      setSelectedCommune("");
                      setCommuneSearchTerm("");
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    style={{
                      fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                    }}
                  >
                    {region.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Commune Autocomplete */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
            ¿En qué comuna vives?
          </label>
          <div className="relative">
            <input
              type="text"
              value={selectedCommune || communeSearchTerm}
              onChange={(e) => {
                setCommuneSearchTerm(e.target.value);
                setSelectedCommune("");
                setShowCommuneDropdown(true);
              }}
              onFocus={() => setShowCommuneDropdown(true)}
              disabled={!selectedRegion}
              placeholder="Providencia ..."
              className="w-full px-4 py-3 rounded-lg outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "white",
                border: "1.5px solid rgb(0, 0, 0)",
                boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                color: "var(--foreground)",
              }}
            />
            {showCommuneDropdown && filteredCommunes.length > 0 && (
              <div
                className="absolute z-10 w-full mt-2 rounded-lg overflow-hidden max-h-48 overflow-y-auto"
                style={{
                  backgroundColor: "white",
                  border: "1.5px solid rgb(0, 0, 0)",
                  boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
                }}
              >
                {filteredCommunes.map((commune) => (
                  <div
                    key={commune}
                    onClick={() => {
                      setSelectedCommune(commune);
                      setCommuneSearchTerm("");
                      setShowCommuneDropdown(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    style={{
                      fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                    }}
                  >
                    {commune}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interests Multi-select */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
            ¿Qué te apasiona?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {interestOptions.map((option) => {
              const isSelected = selectedInterests.includes(option.label);
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => toggleInterest(option.label)}
                  className="aspect-[2/1] rounded-lg flex items-center justify-center text-2xl transition-all"
                  style={{
                    display: "flex",
                    width: '100%',
                    backgroundColor: isSelected ? "var(--color-chip-3)" : "var(--color-light-grey)",
                    border: isSelected ? "2px solid rgb(0, 0, 0)" : "1px solid rgb(0, 0, 0)",
                    boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
                    minHeight: '80px',
                    height: '48px',
                    maxHeight: '56px',
                  }}
                >
                  {option.emoji}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--color-third)",
            border: "1.5px solid rgb(0, 0, 0)",
            boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.7)",
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            color: "var(--foreground)",
          }}
        >
          {isSubmitting ? "Enviando..." : "¡Vamos!"}
        </button>
        </div>
      </div>
    </div>
  );
}
