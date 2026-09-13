import type { AddressDetails } from '@/types';

export interface AddressableEntity {
  name?: string;
  address?: string;
  addressDetails?: AddressDetails | null;
}

/**
 * Consolidates structured addressDetails or raw address into a clean, proper complete address string.
 */
export function formatProperAddress(
  entity?: AddressableEntity | null,
  fallback: string = 'Station Road, Near Sardar Patel Ashram, Bardoli, Gujarat 394601, India'
): string {
  if (!entity) return fallback;

  const details = entity.addressDetails;
  if (details && (details.street || details.city || details.state || details.pincode)) {
    const parts = [
      details.street?.trim(),
      details.landmark?.trim() ? `Near ${details.landmark.trim()}` : undefined,
      details.city?.trim(),
      details.state?.trim() && details.pincode?.trim()
        ? `${details.state.trim()} - ${details.pincode.trim()}`
        : details.state?.trim() || details.pincode?.trim(),
      details.country?.trim() || 'India',
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(', ');
    }
  }

  if (entity.address && entity.address.trim().length > 0) {
    const trimmed = entity.address.trim();
    // If it's just a single town name like "Bardoli", expand with fallback details if applicable
    if (trimmed.toLowerCase() === 'bardoli') {
      return fallback;
    }
    return trimmed;
  }

  return fallback;
}
