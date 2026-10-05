import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ApiError,
  recommendSetup,
  type RecommendResult,
} from "../api/client";
import { useCart } from "../cart/CartContext";
import { Badge, Button, Card, Container, Price } from "../design-system";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink";

const USES = ["Work", "Gaming", "Study", "Streaming", "Mixed"];
const STYLES = ["Minimal", "Natural", "Dark", "RGB"];
const SPACES = [
  { value: "S", label: "Pequeño (hasta ~100 cm)" },
  { value: "M", label: "Mediano (~100–140 cm)" },
  { value: "L", label: "Amplio (más de 140 cm)" },
];

export function CrearMiSetup(): JSX.Element {
  const { add } = useCart();
  const [use, setUse] = useState("Work");
  const [style, setStyle] = useState("Minimal");
  const [space, setSpace] = useState("M");
  const [budget, setBudget] = useState("800");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (addedTimer.current !== null) {
        window.clearTimeout(addedTimer.current);
      }
    },
    [],
  );

  async function generate(): Promise<void> {
    setError(null);
    setResult(null);
    setAdded(false);
    const euros = Number(budget);
    if (!Number.isFinite(euros) || euros < 50 || euros > 100000) {
      setError("Escribe un presupuesto válido (mínimo 50 €).");
      return;
    }
    setSending(true);
    try {
      const created = await recommendSetup({
        use,
        style,
        space: space as "S" | "M" | "L",
        budgetCents: Math.round(euros * 100),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setResult(created);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 503
          ? "La IA no está disponible ahora mismo. Inténtalo más tarde."
          : err instanceof ApiError && err.status === 502
            ? "No hemos podido generar un setup válido. Prueba con otro presupuesto."
            : "Revisa los datos del cuestionario.",
      );
    } finally {
      setSending(false);
    }
  }

  function submit(e: FormEvent): Promise<void> {
    e.preventDefault();
    return generate();
  }

  function addResult(): void {
    if (!result || added) return;
    for (const item of result.setup.items) {
      add(item.product, result.setupSlug);
    }
    setAdded(true);
    if (addedTimer.current !== null) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Container>
      <section className="py-12">
        <h1 className="font-display text-3xl font-bold">Crear mi setup</h1>
        <p className="mt-2 max-w-xl text-ink/60">
          Responde 5 preguntas y la IA montará un setup con productos reales
          del catálogo. Sin chat: un flujo guiado.
        </p>

        <form
          onSubmit={submit}
          noValidate
          className="mt-8 grid max-w-2xl gap-4 md:grid-cols-2"
        >
          <label className="flex flex-col gap-1 text-sm">
            Uso principal
            <select
              aria-label="Uso principal"
              className={inputCls}
              value={use}
              onChange={(e) => setUse(e.target.value)}
            >
              {USES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Estilo
            <select
              aria-label="Estilo"
              className={inputCls}
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Espacio disponible
            <select
              aria-label="Espacio disponible"
              className={inputCls}
              value={space}
              onChange={(e) => setSpace(e.target.value)}
            >
              {SPACES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Presupuesto (€)
            <input
              aria-label="Presupuesto en euros"
              type="number"
              min={50}
              className={inputCls}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            Preferencia libre (opcional)
            <textarea
              aria-label="Preferencia libre"
              className={inputCls}
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <span className="text-xs text-ink/60" aria-live="polite">
              {note.trim().length}/500
            </span>
          </label>
          <div className="md:col-span-2">
            <Button type="submit" disabled={sending}>
              {sending ? "Generando…" : "Generar mi setup"}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-6">
            <p role="alert">{error}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => void generate()}>
                Probar de nuevo
              </Button>
              <Link to="/setups" className="text-sm hover:underline">
                o explora los setups publicados
              </Link>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-12">
            <h2 className="font-display text-2xl font-semibold">
              Tu setup recomendado
            </h2>
            <p className="mt-2 max-w-2xl text-ink/70">{result.explanation}</p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {result.setup.items.map((item) => (
                <Card key={item.slot}>
                  <Badge label={item.slot} />
                  <h3 className="mt-3 font-display text-lg font-semibold">
                    <Link
                      to={`/producto/${item.product.slug}`}
                      className="hover:underline"
                    >
                      {item.product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 font-medium">
                    <Price cents={item.product.priceCents} />
                  </p>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <p className="text-xl font-semibold">
                Total: <Price cents={result.setup.totalCents} />
              </p>
              <Button onClick={addResult} disabled={added}>
                {added ? "Añadido ✓" : "Añadir setup al carrito"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </Container>
  );
}
