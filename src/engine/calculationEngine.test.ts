import { describe, it, expect } from 'vitest';
import {
  calculateUnitCommission,
  calculateCenterType1,
  calculateRegionType1,
  calculateRegionBonus,
} from './calculationEngine';
import { validateMemberRelationships } from './validation';
import { Member } from '../types';
import { runAllCalculationTests } from './calculationTests';

export { runAllCalculationTests };

describe('Compensation Engine Unit Tests (Section 51 Specifications)', () => {
  it('COM 5,000 × 25% = 1,250 (Unit Management Tier 1)', () => {
    const result = calculateUnitCommission(5000);
    expect(result.amount).toBe(1250);
  });

  it('COM 10,000 × 30% = 3,000 (Unit Management Tier 2)', () => {
    const result = calculateUnitCommission(10000);
    expect(result.amount).toBe(3000);
  });

  it('COM 20,000 × 35% = 7,000 (Unit Management Tier 3)', () => {
    const result = calculateUnitCommission(20000);
    expect(result.amount).toBe(7000);
  });

  it('COM 35,000 × 40% = 14,000 (Unit Management Tier 4)', () => {
    const result = calculateUnitCommission(35000);
    expect(result.amount).toBe(14000);
  });

  it('Center COM 60,000 × 25% = 15,000 (Center Management Type 1 Tier 3)', () => {
    const result = calculateCenterType1(60000);
    expect(result.amount).toBe(15000);
  });

  it('Region FYC 300,000 × 18% = 54,000 (Region Management Type 1 Tier 5)', () => {
    const result = calculateRegionType1(300000);
    expect(result.amount).toBe(54000);
  });

  it('Annual FYC 2,000,000 × 2.5% = 50,000 (Region Annual Bonus Tier 3)', () => {
    const result = calculateRegionBonus(2000000);
    expect(result.amount).toBe(50000);
  });
});

describe('Infinite Organization & Cycle Prevention', () => {
  it('prevents self-sponsorship circular relation', () => {
    const members: Member[] = [
      {
        id: 'mem_1',
        memberCode: 'RM-001',
        name: 'Leader A',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        positionId: 'region_manager',
        role: 'regional_manager',
        parentMemberId: 'mem_1', // self
        sponsorId: 'mem_1',
        unitId: 'u1',
        centerId: 'c1',
        regionId: 'r1',
        joinDate: '2024-01-01',
        status: 'active',
        personalFYC: 100000,
        personalCOM: 35000,
        firstYearPremium: 300000,
        renewalPremium: 100000,
        location: { province: 'Bangkok', region: 'Bangkok & Metro', lat: 13.75, lng: 100.5 },
      }
    ];

    const validation = validateMemberRelationships(members);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('ตนเอง'))).toBe(true);
  });

  it('detects circular loop A -> B -> C -> A', () => {
    const members: Member[] = [
      {
        id: 'mem_a',
        memberCode: 'AG-1',
        name: 'A',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        positionId: 'agent',
        role: 'agent',
        parentMemberId: 'mem_c', // loop back to C
        sponsorId: 'mem_c',
        unitId: 'u1',
        centerId: 'c1',
        regionId: 'r1',
        joinDate: '2024-01-01',
        status: 'active',
        personalFYC: 10000,
        personalCOM: 3500,
        firstYearPremium: 30000,
        renewalPremium: 0,
        location: { province: 'Bangkok', region: 'Bangkok & Metro', lat: 13.75, lng: 100.5 },
      },
      {
        id: 'mem_b',
        memberCode: 'AG-2',
        name: 'B',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        positionId: 'agent',
        role: 'agent',
        parentMemberId: 'mem_a',
        sponsorId: 'mem_a',
        unitId: 'u1',
        centerId: 'c1',
        regionId: 'r1',
        joinDate: '2024-01-01',
        status: 'active',
        personalFYC: 10000,
        personalCOM: 3500,
        firstYearPremium: 30000,
        renewalPremium: 0,
        location: { province: 'Bangkok', region: 'Bangkok & Metro', lat: 13.75, lng: 100.5 },
      },
      {
        id: 'mem_c',
        memberCode: 'AG-3',
        name: 'C',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        positionId: 'agent',
        role: 'agent',
        parentMemberId: 'mem_b',
        sponsorId: 'mem_b',
        unitId: 'u1',
        centerId: 'c1',
        regionId: 'r1',
        joinDate: '2024-01-01',
        status: 'active',
        personalFYC: 10000,
        personalCOM: 3500,
        firstYearPremium: 30000,
        renewalPremium: 0,
        location: { province: 'Bangkok', region: 'Bangkok & Metro', lat: 13.75, lng: 100.5 },
      }
    ];

    const validation = validateMemberRelationships(members);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('Circular Hierarchy') || e.includes('วนลูป'))).toBe(true);
  });
});
