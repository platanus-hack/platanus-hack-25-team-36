"use client";

import { useState, useEffect } from "react";
import ToggleSwitch from "./ToggleSwitch";
import { PinSubtype } from "@/types/app";

type ChipFilterProps = {
  label: string;
  colorClass: string;
  subtype: PinSubtype;
  isActive: boolean;
  onToggle: (subtype: PinSubtype, active: boolean) => void;
};

export function ChipFilter({ label, colorClass, subtype, isActive, onToggle }: ChipFilterProps) {
  const handleClick = () => {
    if (label === "Comunidades") {
      return; // Prevent toggling for "Comunidades"
    }
    const newState = !isActive;
    onToggle(subtype, newState);
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

type ChipFiltersProps = {
  onActiveSubtypesChange?: (activeSubtypes: string[]) => void;
};

export default function ChipFilters({ onActiveSubtypesChange }: ChipFiltersProps) {
  const allFilters = [
    { label: "Servicios", colorClass: "bg-[var(--color-chip-3)]", subtype: PinSubtype.SERVICE },
    { label: "Eventos", colorClass: "bg-[var(--color-chip-2)]", subtype: PinSubtype.EVENT },
    { label: "Negocios", colorClass: "bg-[var(--color-chip-1)]", subtype: PinSubtype.BUSINESS },
  ];

  const [checked, setChecked] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Record<PinSubtype, boolean>>({
    [PinSubtype.SERVICE]: false,
    [PinSubtype.EVENT]: false,
    [PinSubtype.BUSINESS]: false,
  });

  const handleToggle = (value: boolean) => setChecked(value);

  const handleFilterToggle = (subtype: PinSubtype, active: boolean) => {
    setActiveFilters((prev) => ({
      ...prev,
      [subtype]: active,
    }));
  };

  useEffect(() => {
    const activeSubtypes = Object.entries(activeFilters)
      .filter(([_, isActive]) => isActive)
      .map(([subtype]) => subtype);
    onActiveSubtypesChange?.(activeSubtypes);
  }, [activeFilters, onActiveSubtypesChange]);

  // Determine which filters to show
  const visibleFilters = allFilters;

  return (
    <div className="w-full flex flex-wrap gap-0 space-between items-center">
      {/* use 50% width here */}
      <div className="w-1/2 flex justify-start flex-wrap gap-3"> 
        {visibleFilters.map((filter) => (
          <ChipFilter
            key={filter.label}
            label={filter.label}
            colorClass={filter.colorClass}
            subtype={filter.subtype}
            isActive={activeFilters[filter.subtype]}
            onToggle={handleFilterToggle}
          />
        ))}
      </div>
      <div className="w-1/2 flex justify-end items-center gap-2">
        {!checked && (
          <span style={{
            fontWeight: 600,
            color: '#1a1a1a',
            fontSize: '1.1em',
            marginRight: '8px',
            whiteSpace: 'nowrap',
          }}>
            Modo Comunidad 🌳
          </span>
        )}
        <ToggleSwitch label="" checked={checked} onChange={handleToggle} height="48px" />
      </div>
    </div>
  );
}

