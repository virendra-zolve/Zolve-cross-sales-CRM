/**
 * Unit Tests: Commission slab logic
 * Requirements: 3.9, 7.4
 */

import { describe, test, expect } from 'vitest';
import { validateSlabs, resolveSlab, computeCommission } from '../../utils/commissionSlabs';
import { CommissionTier } from '../../types/partner';

function tier(partial: Partial<CommissionTier>): CommissionTier {
  return {
    id: 't',
    commissionId: 'c',
    slabIndex: 0,
    fromValue: 0,
    toValue: null,
    commissionType: 'Percentage',
    commissionValue: 1,
    ...partial,
  };
}

const validThreeSlab: CommissionTier[] = [
  tier({ id: 't1', slabIndex: 0, fromValue: 0, toValue: 100, commissionValue: 0.5 }),
  tier({ id: 't2', slabIndex: 1, fromValue: 100, toValue: 300, commissionValue: 0.75 }),
  tier({ id: 't3', slabIndex: 2, fromValue: 300, toValue: null, commissionValue: 1.0 }),
];

describe('validateSlabs', () => {
  test('accepts contiguous slabs with unbounded last', () => {
    expect(validateSlabs(validThreeSlab)).toHaveLength(0);
  });

  test('rejects empty slab list', () => {
    expect(validateSlabs([])).not.toHaveLength(0);
  });

  test('rejects gaps / overlaps', () => {
    const gapped = [
      tier({ id: 'a', fromValue: 0, toValue: 100 }),
      tier({ id: 'b', fromValue: 150, toValue: null }),
    ];
    expect(validateSlabs(gapped)).not.toHaveLength(0);
  });

  test('rejects unbounded slab that is not last', () => {
    const bad = [
      tier({ id: 'a', fromValue: 0, toValue: null }),
      tier({ id: 'b', fromValue: 100, toValue: 200 }),
    ];
    expect(validateSlabs(bad)).not.toHaveLength(0);
  });
});

describe('resolveSlab', () => {
  test('resolves values into exactly one slab', () => {
    expect(resolveSlab(validThreeSlab, 0)?.id).toBe('t1');
    expect(resolveSlab(validThreeSlab, 99)?.id).toBe('t1');
    expect(resolveSlab(validThreeSlab, 100)?.id).toBe('t2');
    expect(resolveSlab(validThreeSlab, 5000)?.id).toBe('t3');
  });

  test('returns null below the first slab', () => {
    const slabs = [tier({ id: 'a', fromValue: 10, toValue: 20 })];
    expect(resolveSlab(slabs, 5)).toBeNull();
  });
});

describe('computeCommission', () => {
  test('percentage payout', () => {
    // value 5000 -> t3 (1%), base 5000 -> 50
    expect(computeCommission(validThreeSlab, 5000, 5000)).toBeCloseTo(50);
  });

  test('flat payout per unit', () => {
    const flat = [tier({ id: 'f', fromValue: 0, toValue: null, commissionType: 'Flat', commissionValue: 500 })];
    // 3 bookings * 500 = 1500
    expect(computeCommission(flat, 3, 3)).toBe(1500);
  });

  test('non-negative for non-negative inputs', () => {
    expect(computeCommission(validThreeSlab, 0, 0)).toBeGreaterThanOrEqual(0);
  });
});
