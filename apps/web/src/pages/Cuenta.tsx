import { useQuery } from "@tanstack/react-query";
import { fetchMyOrders } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, Container, Price } from "../design-system";

export function Cuenta(): JSX.Element {
  const { user, loading, logout } = useAuth();
  const orders = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
    enabled: user !== null,
    retry: false,
  });

  return (
    <Container>
      <section className="py-12">
        <h1 className="font-display text-3xl font-bold">Mi cuenta</h1>
        {loading && <p className="mt-6">Cargando…</p>}
        {!loading && !user && (
          <div className="mt-6">
            <p className="text-ink/70">
              Entra para ver tus pedidos.
            </p>
            <div className="mt-4">
              <Button to="/login">Entrar</Button>
            </div>
          </div>
        )}
        {user && (
          <>
            <div className="mt-4 flex items-center gap-4">
              <p className="text-ink/70">
                {user.name} · {user.email}
              </p>
              <Button variant="secondary" onClick={() => void logout()}>
                Salir
              </Button>
            </div>
            <h2 className="mt-10 font-display text-xl font-semibold">
              Mis pedidos
            </h2>
            {orders.isPending && <p className="mt-4">Cargando pedidos…</p>}
            {orders.isError && (
              <p className="mt-4" role="alert">
                No hemos podido cargar tus pedidos.
              </p>
            )}
            {orders.data && orders.data.data.length === 0 && (
              <p className="mt-4 text-ink/60">Aún no tienes pedidos.</p>
            )}
            {orders.data && orders.data.data.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                {orders.data.data.map((order) => (
                  <Card key={order.id}>
                    <div className="flex flex-wrap justify-between gap-2">
                      <p className="font-display font-semibold">
                        Pedido #{order.orderNumber}
                      </p>
                      <Price cents={order.totalCents} />
                    </div>
                    <ul className="mt-2 text-sm text-ink/70">
                      {order.items.map((item) => (
                        <li key={item.productId}>
                          {item.name} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </Container>
  );
}
