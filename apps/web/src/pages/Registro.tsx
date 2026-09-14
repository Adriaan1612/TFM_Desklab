import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button, Container } from "../design-system";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink";

// Mismas reglas que RegisterSchema en el backend (sin símbolo especial).
const PASSWORD_RULES = [
  { id: "length", label: "Mínimo 8 caracteres", ok: (v: string) => v.length >= 8 },
  { id: "lower", label: "Al menos una minúscula", ok: (v: string) => /[a-z]/.test(v) },
  { id: "upper", label: "Al menos una mayúscula", ok: (v: string) => /[A-Z]/.test(v) },
  { id: "digit", label: "Al menos un número", ok: (v: string) => /\d/.test(v) },
];

export function Registro(): JSX.Element {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await register(name, email, password);
      navigate("/cuenta");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? "Ese email ya tiene cuenta. Entra en su lugar."
          : "No hemos podido crear la cuenta. Revisa los datos.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Container>
      <section className="mx-auto max-w-md py-12">
        <h1 className="font-display text-3xl font-bold">Crear cuenta</h1>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Nombre
            <input
              aria-label="Nombre"
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              aria-label="Email"
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Contraseña
            <input
              aria-label="Contraseña"
              type="password"
              minLength={8}
              maxLength={200}
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <ul aria-label="Requisitos de contraseña" className="flex flex-col gap-1 text-sm">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.ok(password);
              return (
                <li
                  key={rule.id}
                  className={met ? "text-moss-dark" : "text-red-700"}
                >
                  {met ? "✓" : "×"} {rule.label}
                </li>
              );
            })}
          </ul>
          {error && <p role="alert">{error}</p>}
          <Button type="submit" disabled={sending}>
            {sending ? "Creando…" : "Crear cuenta"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-ink/60">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="hover:underline">
            Entra
          </Link>
        </p>
      </section>
    </Container>
  );
}
