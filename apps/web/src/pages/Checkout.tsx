import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { OrderDTO } from "@desklab/shared";
import {
  cvcValid,
  detectBrand,
  expiryValid,
  last4Of,
  luhnValid,
} from "@desklab/shared";
import { ApiError, placeOrder } from "../api/client";
import { useCart } from "../cart/CartContext";
import { Button, Container, Price } from "../design-system";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink";

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function Checkout(): JSX.Element {
  const { lines, totalCents, clear } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [last4Used, setLast4Used] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [card, setCard] = useState({ number: "", month: "", year: "", cvc: "" });

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
          <p className="text-sm font-medium uppercase tracking-widest text-moss-dark">
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
          <div className="mt-8 flex gap-3">
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

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              className="flex flex-col gap-4"
            >
              <label className="flex flex-col gap-1 text-sm">
                Nombre
                <input
                  aria-label="Nombre"
                  className={inputCls}
                  value={form.name}
                  onChange={set("name")}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Email
                <input
                  aria-label="Email"
                  type="email"
                  className={inputCls}
                  value={form.email}
                  onChange={set("email")}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Dirección
                <input
                  aria-label="Dirección"
                  className={inputCls}
                  value={form.address}
                  onChange={set("address")}
                  required
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm">
                  Ciudad
                  <input
                    aria-label="Ciudad"
                    className={inputCls}
                    value={form.city}
                    onChange={set("city")}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Código postal
                  <input
                    aria-label="Código postal"
                    className={inputCls}
                    value={form.postalCode}
                    onChange={set("postalCode")}
                    required
                  />
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
                <div className="grid grid-cols-3 gap-4">
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
                <div className="flex gap-3">
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
