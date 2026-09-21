import type { AddressDetails } from '@/types';

export interface AddressableEntity {
  name?: string;
  address?: string;
  addressDetails?: AddressDetails | null;
}

/**
 * Consolidates structured addressDetails or raw address into a clean, proper complete address string.
 * Supports passing a single entity or array of candidate entities (e.g. branch, restaurant, settings).
 */
export function formatProperAddress(
  entity?: AddressableEntity | (AddressableEntity | null | undefined)[] | null,
  fallback: string = 'Station Road, Near Sardar Patel Ashram, Bardoli, Gujarat 394601, India'
): string {
  if (!entity) return fallback;

  const entities = Array.isArray(entity) ? entity : [entity];

  for (const ent of entities) {
    if (!ent) continue;

    const details = ent.addressDetails;
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

    if (ent.address && typeof ent.address === 'string' && ent.address.trim().length > 0) {
      const trimmed = ent.address.trim();
      if (trimmed.toLowerCase() !== 'bardoli') {
        return trimmed;
      }
    }
  }

  return fallback;
}
