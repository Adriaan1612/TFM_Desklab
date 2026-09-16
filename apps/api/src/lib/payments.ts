// Pasarela de pago simulada. No hay red ni persistencia: decide de forma
// determinista para que el flujo de compra sea completo y testeable.
// Nunca recibe ni guarda PAN, CVC ni caducidad: solo los últimos 4 dígitos.

export const DECLINED_LAST4 = "0002";

export interface ChargeInput {
  last4: string;
  totalCents: number;
}

export type ChargeResult =
  | { ok: true }
  | { ok: false; code: "invalid_card" | "card_declined" };

export function chargeSimulated(input: ChargeInput): ChargeResult {
  if (!/^\d{4}$/.test(input.last4)) {
    return { ok: false, code: "invalid_card" };
  }
  if (input.last4 === DECLINED_LAST4) {
    return { ok: false, code: "card_declined" };
  }
  return { ok: true };
}
