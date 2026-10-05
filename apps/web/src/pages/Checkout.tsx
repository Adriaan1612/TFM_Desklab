import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { OrderDTO } from "@desklab/shared";
import {
  cvcValid,
  detectBrand,
  expiryValid,
  last4Of,
  luhnValid,
} from "@desklab/shared";
import { ApiError, fetchProducts, placeOrder } from "../api/client";
import { useCart } from "../cart/CartContext";
import { Button, Breadcrumbs, Container, Price } from "../design-system";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink";

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

interface AddressForm {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}

type AddressField = keyof AddressForm;

const ADDRESS_MAX: Record<AddressField, number> = {
  name: 120,
  email: 160,
  address: 200,
  city: 120,
  postalCode: 5,
};

const POSTAL_CODE_RE = /^\d{5}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ADDRESS_INVALID: Record<AddressField, string> = {
  name: "El nombre admite 120 caracteres como máximo.",
  email: "Escribe un email válido.",
  address: "La dirección admite 200 caracteres como máximo.",
  city: "La ciudad admite 120 caracteres como máximo.",
  postalCode: "El código postal debe tener 5 dígitos (p. ej. 28004).",
};

const ADDRESS_REQUIRED: Record<AddressField, string> = {
  name: "Escribe tu nombre.",
  email: "Escribe tu email.",
  address: "Escribe tu dirección.",
  city: "Escribe tu ciudad.",
  postalCode: "Escribe tu código postal.",
};

/** Espejo de CheckoutSchema (backend): trim, longitudes y postal ES de 5 dígitos. */
function validateAddress(form: AddressForm): {
  errors: Partial<Record<AddressField, string>>;
  normalized: AddressForm;
} {
  const normalized: AddressForm = {
    name: form.name.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    postalCode: form.postalCode.trim(),
  };
  const errors: Partial<Record<AddressField, string>> = {};
  (Object.keys(normalized) as AddressField[]).forEach((field) => {
    const value = normalized[field];
    if (!value) {
      errors[field] = ADDRESS_REQUIRED[field];
      return;
    }
    if (field === "postalCode") {
      if (!POSTAL_CODE_RE.test(value)) errors[field] = ADDRESS_INVALID[field];
      return;
    }
    if (field === "email") {
      if (value.length > ADDRESS_MAX.email || !EMAIL_RE.test(value)) {
        errors[field] = ADDRESS_INVALID[field];
      }
      return;
    }
    if (value.length > ADDRESS_MAX[field]) errors[field] = ADDRESS_INVALID[field];
  });
  return { errors, normalized };
}

/** Traduce el detalle "campo: motivo; …" de un 400 a errores por campo en español. */
function mapBackendDetail(detail: string): Partial<Record<AddressField, string>> {
  const errors: Partial<Record<AddressField, string>> = {};
  for (const segment of detail.split(";")) {
    const field = segment.split(":")[0]?.trim() as AddressField;
    if (
      field === "name" ||
      field === "email" ||
      field === "address" ||
      field === "city" ||
      field === "postalCode"
    ) {
      errors[field] ??= ADDRESS_INVALID[field];
    }
  }
  return errors;
}

/**
 * Typos frecuentes de dominio → dominio probable. Solo ayuda UX no bloqueante:
 * el backend acepta el dominio original porque puede ser legítimo (p. ej. .co).
 */
const EMAIL_DOMAIN_TYPOS: Record<string, string> = {
  "gmail.co": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.con": "gmail.com",
  "googlemail.co": "googlemail.com",
  "hotmail.co": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "hotmail.cm": "hotmail.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "yahoo.co": "yahoo.com",
  "yaho.com": "yahoo.com",
  "live.co": "live.com",
  "icloud.co": "icloud.com",
};

export function suggestEmail(email: string): string | null {
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) return null;
  const fixed = EMAIL_DOMAIN_TYPOS[trimmed.slice(at + 1).toLowerCase()];
  if (!fixed) return null;
  const corrected = `${trimmed.slice(0, at)}@${fixed}`;
  return corrected.toLowerCase() === trimmed.toLowerCase() ? null : corrected;
}

export function Checkout(): JSX.Element {
  const { lines, totalCents, clear } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [last4Used, setLast4Used] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<AddressField, string>>
  >({});
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [card, setCard] = useState({ number: "", month: "", year: "", cvc: "" });

  // Las líneas guardan el precio del momento de añadirlas; se revalida contra
  // la API porque el backend cobra siempre con los precios actuales de la DB.
  const prices = useQuery({
    queryKey: ["checkout-prices"],
    queryFn: () => fetchProducts("pageSize=50"),
    enabled: lines.length > 0,
    retry: false,
    staleTime: 30_000,
  });

  const priceChanged = useMemo(() => {
    if (!prices.data || !Array.isArray(prices.data.data)) return false;
    const current = new Map(
      prices.data.data.map((p) => [p.id, p.priceCents]),
    );
    return lines.some((l) => {
      const price = current.get(l.product.id);
      return price === undefined || price !== l.product.priceCents;
    });
  }, [prices.data, lines]);

  const digits = card.number.replace(/\D/g, "");
  const brand = detectBrand(digits);
  const cardOk =
    luhnValid(digits) &&
    expiryValid(card.month, card.year) &&
    cvcValid(card.cvc, brand);

  if (order) {
    return (
      <Container>
        <section className="py-12">
          <Breadcrumbs
            trail={[
              { label: "Inicio", to: "/" },
              { label: "Checkout" },
              { label: `Pedido #${order.orderNumber}` },
            ]}
          />
          <p className="mt-4 text-sm font-medium uppercase tracking-widest text-moss-dark">
            Pedido confirmado
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold">
            Pedido #{order.orderNumber}
          </h1>
          <p className="mt-4 text-ink/70">
            Gracias, {order.name}. Te hemos enviado la confirmación a{" "}
            {order.email}.
          </p>
          <div className="mt-8 max-w-2xl rounded-2xl border border-line bg-white p-6">
            <h2 className="font-display text-xl font-semibold">Resumen</h2>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {order.items.map((item) => (
                <li
                  key={`${item.productId}-${item.setupSlug ?? "solo"}`}
                  className="flex justify-between gap-4"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <Price cents={item.priceCents * item.quantity} />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink/70">
              Envío a: {order.name} · {order.email}
            </p>
            {last4Used && (
              <p className="mt-1 text-sm text-ink/70">
                Tarjeta: •••• {last4Used} (simulación, sin cargos reales)
              </p>
            )}
            <p className="mt-4 flex justify-between border-t border-line pt-4 font-semibold">
              <span>Total</span>
              <Price cents={order.totalCents} />
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/cuenta">Ver mis pedidos</Button>
            <Button to="/" variant="secondary">
              Volver al inicio
            </Button>
          </div>
        </section>
      </Container>
    );
  }

  async function pay(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!cardOk) return;
    setError(null);
    setSending(true);
    try {
      const created = await placeOrder({
        ...form,
        payment: { last4: last4Of(digits) },
        items: lines.map((l) => ({
          productId: l.product.id,
          quantity: l.quantity,
          ...(l.setupSlug ? { setupSlug: l.setupSlug } : {}),
        })),
      });
      setLast4Used(last4Of(digits));
      clear();
      setOrder(created);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.detail) {
        const mapped = mapBackendDetail(err.detail);
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped);
          setStep(1);
          return;
        }
      }
      setError(
        err instanceof ApiError && err.status === 402
          ? "Tarjeta rechazada (simulación). Prueba con otra tarjeta."
          : err instanceof ApiError && err.status === 400
            ? "Revisa los datos del formulario."
            : "No hemos podido tramitar el pedido. Inténtalo de nuevo.",
      );
    } finally {
      setSending(false);
    }
  }

  function set(field: AddressField) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (field === "email") setEmailSuggestion(null);
      setFieldErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    };
  }

  function submitStep1(e: FormEvent): void {
    e.preventDefault();
    const { errors, normalized } = validateAddress(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setEmailSuggestion(null);
      return;
    }
    setForm(normalized);
    setFieldErrors({});
    const suggestion = suggestEmail(normalized.email);
    if (suggestion) {
      // No bloquea: el usuario decide si la aplica o continúa igual.
      setEmailSuggestion(suggestion);
      return;
    }
    setEmailSuggestion(null);
    setStep(2);
  }

  function applyEmailSuggestion(): void {
    if (!emailSuggestion) return;
    setForm((prev) => ({ ...prev, email: emailSuggestion }));
    setEmailSuggestion(null);
    setStep(2);
  }

  function dismissEmailSuggestion(): void {
    setEmailSuggestion(null);
    setStep(2);
  }

  function setCardField(field: keyof typeof card) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "number" ? formatCardNumber(e.target.value) : e.target.value;
      setCard((prev) => ({ ...prev, [field]: value }));
    };
  }

  return (
    <Container>
      <section className="py-12">
        <h1 className="font-display text-3xl font-bold">Checkout</h1>
        {lines.length > 0 && priceChanged && (
          <p
            role="alert"
            className="mt-6 max-w-2xl rounded-xl border border-line bg-white px-4 py-3 text-sm"
          >
            Los precios han cambiado desde que añadiste estos productos (o
            alguno ya no está disponible). El importe final se calcula con
            los precios actuales al pagar.
          </p>
        )}
        {lines.length === 0 ? (
          <p className="mt-6">
            Tu carrito está vacío.{" "}
            <Link to="/catalogo" className="hover:underline">
              Explorar el catálogo
            </Link>
          </p>
        ) : step === 1 ? (
          <div className="mt-8 grid max-w-2xl gap-4">
            <p className="text-sm text-ink/60">Paso 1 de 2: tus datos</p>
            <form onSubmit={submitStep1} noValidate className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm">
                Nombre
                <input
                  aria-label="Nombre"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name ? "name-error" : undefined
                  }
                  className={inputCls}
                  value={form.name}
                  onChange={set("name")}
                  maxLength={ADDRESS_MAX.name}
                  required
                />
                {fieldErrors.name && (
                  <p id="name-error" role="alert" className="text-sm text-red-700">
                    {fieldErrors.name}
                  </p>
                )}
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Email
                <input
                  aria-label="Email"
                  type="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "email-error" : undefined
                  }
                  className={inputCls}
                  value={form.email}
                  onChange={set("email")}
                  maxLength={ADDRESS_MAX.email}
                  required
                />
                {fieldErrors.email && (
                  <p id="email-error" role="alert" className="text-sm text-red-700">
                    {fieldErrors.email}
                  </p>
                )}
              </label>
              {emailSuggestion && (
                <div
                  aria-live="polite"
                  className="rounded-xl border border-line bg-white px-4 py-3 text-sm"
                >
                  <p>
                    ¿Quisiste decir{" "}
                    <strong>{emailSuggestion}</strong>?
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={applyEmailSuggestion}>
                      Usar esta dirección
                    </Button>
                    <button
                      type="button"
                      onClick={dismissEmailSuggestion}
                      className="text-sm text-ink/70 hover:underline"
                    >
                      Continuar igualmente
                    </button>
                  </div>
                </div>
              )}
              <label className="flex flex-col gap-1 text-sm">
                Dirección
                <input
                  aria-label="Dirección"
                  aria-invalid={Boolean(fieldErrors.address)}
                  aria-describedby={
                    fieldErrors.address ? "address-error" : undefined
                  }
                  className={inputCls}
                  value={form.address}
                  onChange={set("address")}
                  maxLength={ADDRESS_MAX.address}
                  required
                />
                {fieldErrors.address && (
                  <p id="address-error" role="alert" className="text-sm text-red-700">
                    {fieldErrors.address}
                  </p>
                )}
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  Ciudad
                  <input
                    aria-label="Ciudad"
                    aria-invalid={Boolean(fieldErrors.city)}
                    aria-describedby={
                      fieldErrors.city ? "city-error" : undefined
                    }
                    className={inputCls}
                    value={form.city}
                    onChange={set("city")}
                    maxLength={ADDRESS_MAX.city}
                    required
                  />
                  {fieldErrors.city && (
                    <p id="city-error" role="alert" className="text-sm text-red-700">
                      {fieldErrors.city}
                    </p>
                  )}
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Código postal
                  <input
                    aria-label="Código postal"
                    inputMode="numeric"
                    pattern="[0-9]{5}"
                    title="5 dígitos, p. ej. 28004"
                    aria-invalid={Boolean(fieldErrors.postalCode)}
                    aria-describedby={
                      fieldErrors.postalCode ? "postalCode-error" : undefined
                    }
                    className={inputCls}
                    value={form.postalCode}
                    onChange={set("postalCode")}
                    maxLength={ADDRESS_MAX.postalCode}
                    required
                  />
                  {fieldErrors.postalCode && (
                    <p id="postalCode-error" role="alert" className="text-sm text-red-700">
                      {fieldErrors.postalCode}
                    </p>
                  )}
                </label>
              </div>
              <div>
                <Button type="submit">Continuar al pago</Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm text-ink/60">Paso 2 de 2: pago simulado</p>
              <form onSubmit={pay} className="mt-4 flex flex-col gap-4">
                <label className="flex flex-col gap-1 text-sm">
                  Número de tarjeta
                  <input
                    aria-label="Número de tarjeta"
                    inputMode="numeric"
                    className={inputCls}
                    value={card.number}
                    onChange={setCardField("number")}
                    placeholder="4242 4242 4242 4242"
                    required
                  />
                </label>
                {brand !== "unknown" && (
                  <p className="text-xs text-ink/60">Marca: {brand}</p>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className="flex flex-col gap-1 text-sm">
                    Mes (MM)
                    <input
                      aria-label="Mes de caducidad"
                      inputMode="numeric"
                      maxLength={2}
                      className={inputCls}
                      value={card.month}
                      onChange={setCardField("month")}
                      placeholder="12"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    Año (AA)
                    <input
                      aria-label="Año de caducidad"
                      inputMode="numeric"
                      maxLength={2}
                      className={inputCls}
                      value={card.year}
                      onChange={setCardField("year")}
                      placeholder="30"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    CVC
                    <input
                      aria-label="CVC"
                      inputMode="numeric"
                      maxLength={4}
                      className={inputCls}
                      value={card.cvc}
                      onChange={setCardField("cvc")}
                      placeholder="123"
                      required
                    />
                  </label>
                </div>
                {!cardOk && (digits.length > 0 || card.cvc.length > 0) && (
                  <p className="text-sm text-red-700">
                    Revisa el número, la caducidad o el CVC.
                  </p>
                )}
                {error && <p role="alert">{error}</p>}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setStep(1)}
                  >
                    Volver
                  </Button>
                  <Button type="submit" disabled={sending || !cardOk}>
                    {sending ? "Procesando…" : "Pagar ahora"}
                  </Button>
                </div>
                <p className="text-xs text-ink/60">
                  Simulación: usa 4242 4242 4242 4242 para aprobar o una
                  terminada en 0002 para ver el rechazo. Sin cargos reales y
                  sin guardar tu tarjeta.
                </p>
              </form>
            </div>
            <aside>
              <h2 className="font-display text-xl font-semibold">Resumen</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {lines.map((line) => (
                  <li
                    key={`${line.product.id}-${line.setupSlug ?? "solo"}`}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span>
                      {line.product.name} × {line.quantity}
                    </span>
                    <Price
                      cents={line.product.priceCents * line.quantity}
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex justify-between border-t border-line pt-4 font-semibold">
                <span>Total</span>
                <Price cents={totalCents} />
              </p>
            </aside>
          </div>
        )}
      </section>
    </Container>
  );
}
