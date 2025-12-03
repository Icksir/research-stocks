export function formatNumber(num?: number | null): string {
  if (num == null) return 'N/A';
  return num.toLocaleString('en-US');
}

export function formatLargeNumber(num?: number | null): string {
  if (num == null) return 'N/A';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toLocaleString('en-US')}`;
}

export function formatPercent(num?: number | null, alreadyPercent = false): string {
  if (num == null) return 'N/A';
  if (alreadyPercent) {
    return `${num.toFixed(2)}%`;
  }
  // Si el número es menor a 1, asumimos que es un decimal (0.25 = 25%)
  if (Math.abs(num) < 1) {
    return `${(num * 100).toFixed(2)}%`;
  }
  // Si es mayor a 1, ya es un porcentaje
  return `${num.toFixed(2)}%`;
}

export function formatPrice(num?: number | null): string {
  if (num == null) return 'N/A';
  return `$${num.toFixed(2)}`;
}

export function formatDecimal(num?: number | null, decimals = 2): string {
  if (num == null) return 'N/A';
  return num.toFixed(decimals);
}

export function getRSIStatus(rsi?: number | null): { text: string; color: string } {
  if (rsi == null) return { text: 'N/A', color: 'text-gray-500' };
  if (rsi > 70) return { text: 'Sobrecomprado', color: 'text-red-600' };
  if (rsi > 60) return { text: 'Alto', color: 'text-orange-500' };
  if (rsi < 30) return { text: 'Sobrevendido', color: 'text-green-600' };
  if (rsi < 40) return { text: 'Bajo', color: 'text-green-500' };
  return { text: 'Neutral', color: 'text-yellow-600' };
}

export function getRecommendationStyle(rec?: string): { bg: string; text: string; label: string } {
  if (!rec) return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'N/A' };
  const r = rec.toUpperCase();
  if (r.includes('STRONG_BUY') || r === 'STRONG BUY') 
    return { bg: 'bg-green-500', text: 'text-white', label: 'COMPRA FUERTE' };
  if (r.includes('BUY') || r === 'COMPRAR') 
    return { bg: 'bg-green-100', text: 'text-green-700', label: 'COMPRA' };
  if (r.includes('STRONG_SELL') || r === 'STRONG SELL') 
    return { bg: 'bg-red-500', text: 'text-white', label: 'VENTA FUERTE' };
  if (r.includes('SELL') || r === 'VENDER') 
    return { bg: 'bg-red-100', text: 'text-red-700', label: 'VENTA' };
  if (r.includes('NEUTRAL') || r === 'HOLD') 
    return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'NEUTRAL' };
  return { bg: 'bg-gray-100', text: 'text-gray-600', label: rec };
}

export function getChangeColor(current?: number, previous?: number): string {
  if (current == null || previous == null) return 'text-gray-600';
  if (current > previous) return 'text-green-600';
  if (current < previous) return 'text-red-600';
  return 'text-gray-600';
}

export function getValueStatus(value?: number | null, thresholds?: { good?: number; bad?: number; inverse?: boolean }): string {
  if (value == null || !thresholds) return 'text-gray-600';
  const { good, bad, inverse } = thresholds;
  
  if (inverse) {
    if (bad != null && value >= bad) return 'text-red-600';
    if (good != null && value <= good) return 'text-green-600';
  } else {
    if (good != null && value >= good) return 'text-green-600';
    if (bad != null && value <= bad) return 'text-red-600';
  }
  return 'text-yellow-600';
}