import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safe string trim helper: returns "" if input is not a string.
 * Prevents "Cannot read properties of undefined (reading 'trim')".
 */
export function safeTrim(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  return '';
}
