
"use client";

// ...existing code...
import Image from "next/image";
import { User, Check, Plus } from "lucide-react";

// Dummy data for demonstration
const communities = [
  {
    avatarUrl: "",
    portadaUrl: "",
    title: "Ciclistas de Bellavista",
    isPartOf: true,
  },
  {
    avatarUrl: "",
    portadaUrl: "",
    title: "Ciclistas de Bellavista",
    isPartOf: false,
  },
  {
    avatarUrl: "",
    portadaUrl: "",
    title: "Ciclistas de Bellavista",
    isPartOf: true,
  },
  {
    avatarUrl: "",
    portadaUrl: "",
    title: "Ciclistas de Bellavista",
    isPartOf: false,
  },
];

type CommunityCardProps = {
  avatarUrl: string;
  portadaUrl: string;
  title: string;
  isPartOf: boolean;
};

import { useState } from "react";

function CommunityCard({ avatarUrl, portadaUrl, title, isPartOf: initialIsPartOf }: CommunityCardProps) {
  const [isPartOf, setIsPartOf] = useState(initialIsPartOf);
  return (
    <div
      className="relative flex flex-col w-full min-w-[160px] h-28 rounded-lg shadow-md flex-grow cursor-pointer"
      style={{
        background: "transparent",
        boxShadow: "3px 3px 0px rgba(0,0,0,0.7)",
        border: isPartOf ? "3px solid black" : "1px solid black",
        cursor: "pointer",
      }}
      onClick={() => setIsPartOf((prev) => !prev)}
      tabIndex={0}
      role="button"
      aria-pressed={isPartOf}
    >
      {/* Portada */}
      {portadaUrl ? (
        <Image
          src={portadaUrl}
          alt="Portada"
          fill
          style={{ objectFit: "cover", borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
        />
      ) : (
        <div
          className="absolute top-0 left-0 w-full h-2/5 rounded-t-lg"
          style={{ background: "#C94B4B", height: "40%" }}
        />
      )}
      {/* Avatar and title row */}
      <div className="flex items-center absolute left-2 top-8">
        <div
          className="w-12 h-12 rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center"
          style={{
            border: "1.5px solid rgb(0,0,0)",
            boxShadow: "3px 3px 0px rgba(0,0,0,0.7)",
          }}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" width={48} height={48} className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10" style={{ color: "var(--foreground)" }} />
          )}
        </div>
        <div className="ml-2 flex items-center flex-1 min-w-0">
          <span className="font-semibold text-xs sm:text-sm md:text-lg mt-4 break-words flex-1" style={{}}>{title}</span>
          <button
            className="ml-2 flex items-center justify-center w-6 h-6 rounded-full border border-black shadow mt-4 flex-shrink-0"
            style={{
              background: isPartOf ? "#3DDC97" : "#B3D8FF",
              boxShadow: "2px 2px 0px rgba(0,0,0,0.5)",
              pointerEvents: "none",
              cursor: "pointer",
            }}
            tabIndex={-1}
            aria-label={isPartOf ? "Ya eres parte" : "Unirse"}
          >
            {isPartOf ? (
              <Check size={16} color="#fff" className="" />
            ) : (
              <Plus size={16} color="#1976D2" className="" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const Communities = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate async action
    setTimeout(() => setIsSubmitting(false), 1200);
  };

  return (
    <div className="px-2 py-4 mt-24 flex flex-col min-h-[80vh]">
      <h1 className="font-bold text-lg mb-4">🌳 Mis comunidades</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        {communities.map((c, idx) => (
          <CommunityCard key={idx} {...c} />
        ))}
      </div>
      <div className="flex-grow" />
      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-4 rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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
  );
};

export default Communities;
