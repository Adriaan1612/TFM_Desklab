import { Link } from "react-router-dom";
import { MAX_LINE_QTY } from "@desklab/shared";
import { Price } from "../design-system";
import { useCart } from "./CartContext";

export function CartDrawer(): JSX.Element {
  const { lines, totalCents, isOpen, closeCart, remove, setQuantity } =
    useCart();

  if (!isOpen) return <></>;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/30"
      onClick={closeCart}
      role="dialog"
      aria-label="Carrito"
    >
      <aside
        className="flex h-full w-full max-w-md flex-col bg-canvas p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Carrito</h2>
          <button
            type="button"
            onClick={closeCart}
            className="text-sm hover:underline"
            aria-label="Cerrar carrito"
          >
            Cerrar
          </button>
        </div>

        {lines.length === 0 ? (
          <p className="mt-6 text-ink/60">Tu carrito está vacío.</p>
        ) : (
          <>
            <ul className="mt-6 flex flex-1 flex-col gap-4 overflow-y-auto">
              {lines.map((line) => (
                <li
                  key={`${line.product.id}-${line.setupSlug ?? "solo"}`}
                  className="rounded-2xl border border-line bg-white p-4"
                >
                  <p className="font-medium">{line.product.name}</p>
                  {line.setupSlug && (
                    <p className="text-xs text-ink/60">
                      Del setup {line.setupSlug}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Quitar uno de ${line.product.name}`}
                        className="rounded-full border border-line px-2"
                        onClick={() =>
                          setQuantity(
                            line.product.id,
                            line.quantity - 1,
                            line.setupSlug,
                          )
                        }
                      >
                        −
                      </button>
                      <span aria-label="Cantidad">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Añadir uno de ${line.product.name}`}
                        title={
                          line.quantity >= MAX_LINE_QTY
                            ? `Máximo ${MAX_LINE_QTY} unidades por línea`
                            : undefined
                        }
                        disabled={line.quantity >= MAX_LINE_QTY}
                        className="rounded-full border border-line px-2 disabled:opacity-40"
                        onClick={() =>
                          setQuantity(
                            line.product.id,
                            line.quantity + 1,
                            line.setupSlug,
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <span className="flex items-center gap-3">
                      <Price
                        cents={line.product.priceCents * line.quantity}
                      />
                      <button
                        type="button"
                        className="text-sm text-ink/60 hover:underline"
                        onClick={() =>
                          remove(line.product.id, line.setupSlug)
                        }
                      >
                        Quitar
                      </button>
                    </span>
                  </div>
                  {line.quantity >= MAX_LINE_QTY && (
                    <p className="mt-2 text-xs text-ink/60">
                      Máximo {MAX_LINE_QTY} unidades por línea.
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-line pt-4">
              <p className="flex justify-between font-semibold">
                <span>Total</span>
                <Price cents={totalCents} />
              </p>
              <Link
                to="/checkout"
                onClick={closeCart}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas"
              >
                Tramitar pedido
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
