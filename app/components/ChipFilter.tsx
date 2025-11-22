"use client";

import { useState } from "react";

type ChipFilterProps = {
  label: string;
  colorClass: string;
  onToggle?: (active: boolean) => void;
};

export function ChipFilter({ label, colorClass, onToggle }: ChipFilterProps) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    const newState = !isActive;
    setIsActive(newState);
    onToggle?.(newState);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-3 rounded-full font-medium transition-all ${colorClass} ${
        isActive ? "shadow-lg" : ""
      }`}
      style={{ 
        color: 'var(--foreground)', 
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        border: '1.5px solid rgb(0, 0, 0)',
        boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.7)'
      }}
    >
      {label}
    </button>
  );
}

export default function ChipFilters() {
  const filters = [
    { label: "Servicios", colorClass: "bg-[var(--color-chip-3)]" },
    { label: "Eventos", colorClass: "bg-[var(--color-chip-2)]" },
    { label: "Comunidades", colorClass: "bg-[var(--color-chip-4)]" },
    { label: "Negocios", colorClass: "bg-[var(--color-chip-1)]" },
    
  ];

  return (
    <div className="w-full flex flex-wrap gap-3 justify-between">
      {filters.map((filter) => (
      <ChipFilter
        key={filter.label}
        label={filter.label}
        colorClass={filter.colorClass}
      />
      ))}
    </div>
  );
}
