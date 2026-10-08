// Commission slab logic (pure, side-effect free)

import { CommissionTier } from '../types/partner';
import { ValidationError } from './partnerValidation';

/**
 * Validate that slabs form a contiguous, non-overlapping cover.
 * - Sorted by fromValue, each slab's `fromValue` must equal the previous slab's `toValue`.
 * - Only the last slab may be unbounded (toValue === null).
 * - fromValue must be < toValue for bounded slabs.
 */
export function validateSlabs(tiers: CommissionTier[]): ValidationError[] {
  const errors: ValidationError[] = [];
  if (tiers.length === 0) {
    errors.push({ field: 'tiers', message: 'At least one slab is required' });
    return errors;
  }

  const sorted = [...tiers].sort((a, b) => a.fromValue - b.fromValue);

  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];
    const isLast = i === sorted.length - 1;

    if (tier.fromValue < 0) {
      errors.push({ field: `tier[${i}].fromValue`, message: 'fromValue must be >= 0' });
    }

    if (tier.toValue === null && !isLast) {
      errors.push({
        field: `tier[${i}].toValue`,
        message: 'Only the last slab may be unbounded',
      });
    }

    if (tier.toValue !== null && tier.toValue <= tier.fromValue) {
      errors.push({
        field: `tier[${i}].toValue`,
        message: 'toValue must be greater than fromValue',
      });
    }

    if (tier.commissionValue < 0) {
      errors.push({
        field: `tier[${i}].commissionValue`,
        message: 'Commission value must be >= 0',
      });
    }

    // Contiguity check against previous slab
    if (i > 0) {
      const prev = sorted[i - 1];
      if (prev.toValue === null) {
        errors.push({
          field: `tier[${i}].fromValue`,
          message: 'A slab cannot follow an unbounded slab',
        });
      } else if (tier.fromValue !== prev.toValue) {
        errors.push({
          field: `tier[${i}].fromValue`,
          message: 'Slabs must be contiguous (no gaps or overlaps)',
        });
      }
    }
  }

  return errors;
}

/**
 * Resolve which slab a given metric value falls into.
 * Returns null if the value is below the first slab's fromValue.
 * A slab covers [fromValue, toValue); the unbounded last slab covers [fromValue, Infinity).
 */
export function resolveSlab(tiers: CommissionTier[], value: number): CommissionTier | null {
  const sorted = [...tiers].sort((a, b) => a.fromValue - b.fromValue);
  for (const tier of sorted) {
    const upper = tier.toValue === null ? Infinity : tier.toValue;
    if (value >= tier.fromValue && value < upper) {
      return tier;
    }
  }
  // Value equal to the final bounded toValue falls into the top slab if unbounded,
  // otherwise is out of range.
  const last = sorted[sorted.length - 1];
  if (last && last.toValue === null && value >= last.fromValue) {
    return last;
  }
  return null;
}

/**
 * Compute commission for a metric value.
 * - For Percentage: returns commissionValue% of `unitsOrAmount`.
 * - For Flat: returns commissionValue * unitsOrAmount (per-unit flat payout).
 * `value` selects the slab (tier metric), `unitsOrAmount` is the base the payout applies to.
 * For amount-based metrics, value and unitsOrAmount are typically the same.
 */
export function computeCommission(
  tiers: CommissionTier[],
  value: number,
  unitsOrAmount: number
): number {
  const slab = resolveSlab(tiers, value);
  if (!slab) return 0;
  if (slab.commissionType === 'Percentage') {
    return (slab.commissionValue / 100) * unitsOrAmount;
  }
  return slab.commissionValue * unitsOrAmount;
}
