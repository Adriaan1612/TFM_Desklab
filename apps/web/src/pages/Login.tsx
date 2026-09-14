import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button, Container } from "../design-system";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink";

export function Login(): JSX.Element {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await login(email, password);
      navigate("/cuenta");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Email o contraseña incorrectos."
          : "No hemos podido iniciar sesión. Inténtalo de nuevo.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Container>
      <section className="mx-auto max-w-md py-12">
        <h1 className="font-display text-3xl font-bold">Entrar</h1>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
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
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <Button type="submit" disabled={sending}>
            {sending ? "Entrando…" : "Entrar"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-ink/60">
          ¿Sin cuenta?{" "}
          <Link to="/registro" className="hover:underline">
            Regístrate
          </Link>
        </p>
      </section>
    </Container>
  );
}
