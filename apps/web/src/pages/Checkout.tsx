import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { OrderDTO } from "@desklab/shared";
import { ApiError, placeOrder } from "../api/client";
import { useCart } from "../cart/CartContext";
import { Button, Container, Price } from "../design-system";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink";

export function Checkout(): JSX.Element {
  const { lines, totalCents, clear } = useCart();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });

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
          <p className="mt-2 font-semibold">
            Total pagado (simulado): <Price cents={order.totalCents} />
          </p>
          <div className="mt-8">
            <Button to="/">Volver al inicio</Button>
          </div>
        </section>
      </Container>
    );
  }

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const created = await placeOrder({
        ...form,
        items: lines.map((l) => ({
          productId: l.product.id,
          quantity: l.quantity,
          ...(l.setupSlug ? { setupSlug: l.setupSlug } : {}),
        })),
      });
      clear();
      setOrder(created);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
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
        ) : (
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <form onSubmit={submit} className="flex flex-col gap-4">
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
              {error && <p role="alert">{error}</p>}
              <Button type="submit" disabled={sending}>
                {sending ? "Tramitando…" : `Confirmar pedido · ${lines.length} líneas`}
              </Button>
              <p className="text-xs text-ink/60">
                Pago simulado: no se realiza ningún cargo.
              </p>
            </form>
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
