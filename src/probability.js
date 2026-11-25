// Exact constant-probability model; input p is a fraction, not a percentage.
export function cumulative(p, n) {
  if (!Number.isFinite(p) || p < 0 || p > 1 || !Number.isInteger(n) || n < 0) return NaN;
  if (n === 0 || p === 0) return 0;
  if (p === 1) return 1;
  return -Math.expm1(n * Math.log1p(-p));
}
export function threshold(p, confidence) {
  if (!Number.isFinite(p) || p < 0 || p > 1 || !(confidence > 0 && confidence < 1)) return NaN;
  if (p === 0) return Infinity;
  if (p === 1) return 1;
  return Math.ceil(Math.log1p(-confidence) / Math.log1p(-p));
}
