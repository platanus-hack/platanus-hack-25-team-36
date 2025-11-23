"use client";

import { useState } from "react";
import ToggleSwitch from "./ToggleSwitch";

type ChipFilterProps = {
  label: string;
  colorClass: string;
  onToggle?: (active: boolean) => void;
};

export function ChipFilter({ label, colorClass, onToggle }: ChipFilterProps) {
  const [isActive, setIsActive] = useState(true);

  const handleClick = () => {
    if (label === "Comunidades") {
      return; // Prevent toggling for "Comunidades"
    }
    const newState = !isActive;
    setIsActive(newState);
    onToggle?.(newState);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-3 rounded-full font-medium transition-all ${
        isActive ?    colorClass : ''
      } ${isActive ? "shadow-lg" : ""}`}
      style={{
        background: isActive ? undefined : 'var(--color-light-grey)',
        color: isActive ? 'var(--foreground)' : '#444',
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
  const allFilters = [
    { label: "Servicios", colorClass: "bg-[var(--color-chip-3)]" },
    { label: "Eventos", colorClass: "bg-[var(--color-chip-2)]" },
    { label: "Comunidades", colorClass: "bg-[var(--color-chip-4)]" },
    { label: "Negocios", colorClass: "bg-[var(--color-chip-1)]" },
  ];

  const [checked, setChecked] = useState(true);
  const handleToggle = (value: boolean) => setChecked(value);

  // Determine which filters to show
  const visibleFilters = checked
    ? allFilters.filter(f => f.label !== "Comunidades")
    : allFilters.filter(f => f.label === "Comunidades");

  return (
    <div className="w-full flex flex-wrap gap-0 space-between items-center">
      {/* use 50% width here */}
      <div className="w-1/2 flex justify-start flex-wrap gap-3"> 
        {visibleFilters.map((filter) => (
          <ChipFilter
            key={filter.label}
            label={filter.label}
            colorClass={filter.colorClass}
          />
        ))}
      </div>
      <div className="w-1/2 flex justify-end">
        <ToggleSwitch label="" checked={checked} onChange={handleToggle} height="48px" />
      </div>
    </div>
  );
}

