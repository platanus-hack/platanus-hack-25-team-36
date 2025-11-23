/**
 * Category color mapping utility
 * Maps pin subtypes to their corresponding CSS color variables
 */

import { PinSubtype } from '@/types/app';

export interface CategoryConfig {
  label: string;
  colorClass: string;
  hexColor: string;
}

/**
 * Maps each pin subtype to its color configuration
 * Based on the ChipFilter colors from globals.css
 * Note: Enum values are in English (matching MongoDB schema), but labels are in Spanish for UI
 */
export const CATEGORY_COLORS: Record<PinSubtype, CategoryConfig> = {
  [PinSubtype.SERVICE]: {
    label: 'Servicios',
    colorClass: 'bg-[var(--color-chip-3)]',
    hexColor: '#E8F5E3', // soft pastel mint green
  },
  [PinSubtype.EVENT]: {
    label: 'Eventos',
    colorClass: 'bg-[var(--color-chip-2)]',
    hexColor: '#E3D9F5', // soft pastel lavender
  },
  [PinSubtype.BUSINESS]: {
    label: 'Negocios',
    colorClass: 'bg-[var(--color-chip-1)]',
    hexColor: '#D4E9F2', // soft pastel sky blue
  },
};

/**
 * Gets the hex color for a given pin subtype
 * @param subtype - The pin subtype
 * @returns Hex color string (e.g., '#9ECAD6') or default red color
 */
export const getCategoryColor = (subtype?: PinSubtype): string => {
  if (!subtype) return '#ef4444'; // Default red if no subtype
  return CATEGORY_COLORS[subtype]?.hexColor || '#ef4444';
};

/**
 * Gets the category configuration for a given subtype
 * @param subtype - The pin subtype
 * @returns CategoryConfig object or undefined
 */
export const getCategoryConfig = (subtype?: PinSubtype): CategoryConfig | undefined => {
  if (!subtype) return undefined;
  return CATEGORY_COLORS[subtype];
};

/**
 * Gets all available categories (excluding "Comunidades")
 * Used for the pin creation form dropdown
 */
export const getAvailableCategories = (): Array<{ value: PinSubtype; label: string; color: string }> => {
  return Object.entries(CATEGORY_COLORS).map(([key, config]) => ({
    value: key as PinSubtype,
    label: config.label,
    color: config.hexColor,
  }));
};
