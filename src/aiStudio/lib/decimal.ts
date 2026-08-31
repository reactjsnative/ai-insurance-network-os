import Decimal from 'decimal.js';

// Configure Decimal precision and rounding
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export function toDecimal(val: number | string | Decimal | undefined | null): Decimal {
  if (val === undefined || val === null || val === '') return new Decimal(0);
  try {
    return new Decimal(val);
  } catch {
    return new Decimal(0);
  }
}

export function round2(val: number | Decimal): number {
  const d = val instanceof Decimal ? val : new Decimal(val || 0);
  return d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

export function formatBaht(val: number | Decimal | undefined | null, includeDecimal: boolean = true): string {
  if (val === undefined || val === null) return '0 ฿';
  const num = val instanceof Decimal ? val.toNumber() : Number(val);
  if (isNaN(num)) return '0 ฿';
  
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: includeDecimal ? 2 : 0,
    maximumFractionDigits: includeDecimal ? 2 : 0,
  }).format(num);
}

export function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null) return '0';
  return new Intl.NumberFormat('th-TH', {
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatPercent(val: number | undefined | null): string {
  if (val === undefined || val === null) return '0%';
  return `${val}%`;
}
