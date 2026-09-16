// Validación de tarjeta en cliente. Solo formato: el PAN/CVC/caducidad
// nunca salen del navegador; al backend solo viajan los últimos 4 dígitos.

export type CardBrand = "visa" | "mastercard" | "amex" | "unknown";

export function detectBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "visa";
  if (/^(51|52|53|54|55|2221|2720)/.test(digits)) return "mastercard";
  if (/^(34|37)/.test(digits)) return "amex";
  return "unknown";
}

export function luhnValid(number: string): boolean {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function expiryValid(month: string, year: string): boolean {
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(m) || !Number.isInteger(y) || m < 1 || m > 12) {
    return false;
  }
  const fullYear = y < 100 ? 2000 + y : y;
  const now = new Date();
  const endOfMonth = new Date(fullYear, m, 0, 23, 59, 59);
  return endOfMonth.getTime() >= now.getTime();
}

export function cvcValid(cvc: string, brand: CardBrand): boolean {
  if (!/^\d+$/.test(cvc)) return false;
  if (brand === "amex") return cvc.length === 4;
  return cvc.length === 3;
}

export function last4Of(number: string): string {
  return number.replace(/\D/g, "").slice(-4);
}
