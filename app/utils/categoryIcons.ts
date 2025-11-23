/**
 * Category icon mapping utility
 * Maps pin subtypes to their corresponding icon assets
 */

import { PinSubtype } from '@/types/app';

export interface CategoryIconConfig {
  iconPath: string;
  iconAlt: string;
}

export interface IconOption {
  value: string;
  label: string;
  path: string;
}

/**
 * All available icons for pins
 * Icons are stored in /public/assets/pin_icons/
 */
export const AVAILABLE_ICONS: IconOption[] = [
  { value: 'dollar', label: '💰 Dinero', path: '/assets/pin_icons/dollar.png' },
  { value: 'musical-note', label: '🎵 Música', path: '/assets/pin_icons/musical-note.png' },
  { value: 'weight', label: '🏋️ Ejercicio', path: '/assets/pin_icons/weight.png' },
  { value: 'book', label: '📚 Educación', path: '/assets/pin_icons/book.png' },
  { value: 'leaves', label: '🌿 Naturaleza', path: '/assets/pin_icons/leaves.png' },
  { value: 'pawprint', label: '🐾 Mascotas', path: '/assets/pin_icons/pawprint.png' },
  { value: 'playing-cards', label: '🎲 Entretenimiento', path: '/assets/pin_icons/playing-cards.png' },
];

/**
 * Default icons for each pin subtype
 * Icons are stored in /public/assets/pin_icons/
 */
export const CATEGORY_ICONS: Record<PinSubtype, CategoryIconConfig> = {
  [PinSubtype.SERVICE]: {
    iconPath: '/assets/pin_icons/weight.png',
    iconAlt: 'Service icon',
  },
  [PinSubtype.EVENT]: {
    iconPath: '/assets/pin_icons/musical-note.png',
    iconAlt: 'Event icon',
  },
  [PinSubtype.BUSINESS]: {
    iconPath: '/assets/pin_icons/dollar.png',
    iconAlt: 'Business icon',
  },
};

/**
 * Gets the icon path for a given icon value
 * @param iconValue - The icon identifier (e.g., 'dollar', 'musical-note')
 * @returns Icon path or default pin path
 */
export const getIconPath = (iconValue?: string): string => {
  if (!iconValue) {
    return '/assets/pin.png';
  }
  const icon = AVAILABLE_ICONS.find(i => i.value === iconValue);
  return icon?.path || '/assets/pin.png';
};

/**
 * Gets the icon configuration for a given pin subtype or custom icon
 * @param subtypeOrIcon - The pin subtype or custom icon value
 * @returns CategoryIconConfig object with icon path and alt text
 */
export const getCategoryIcon = (subtypeOrIcon?: PinSubtype | string): CategoryIconConfig => {
  if (!subtypeOrIcon) {
    return {
      iconPath: '/assets/pin.png',
      iconAlt: 'Default pin icon',
    };
  }

  // Check if it's a custom icon value
  const customIcon = AVAILABLE_ICONS.find(i => i.value === subtypeOrIcon);
  if (customIcon) {
    return {
      iconPath: customIcon.path,
      iconAlt: customIcon.label,
    };
  }

  // Otherwise use category default
  return CATEGORY_ICONS[subtypeOrIcon as PinSubtype] || {
    iconPath: '/assets/pin.png',
    iconAlt: 'Default pin icon',
  };
};
