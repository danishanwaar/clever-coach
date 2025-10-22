import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phoneNumber: string | null): string {
  if (!phoneNumber) return '';
  
  // Remove any spaces, dashes, or parentheses
  const cleaned = phoneNumber.replace(/[\s()-]/g, '');
  
  // If starts with 0 and not with +49, replace 0 with +49
  if (cleaned.startsWith('0')) {
    return cleaned.replace(/^0/, '+49');
  }
  
  return cleaned;
}
