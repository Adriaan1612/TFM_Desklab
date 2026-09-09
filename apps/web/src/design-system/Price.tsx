const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export function Price({ cents }: { cents: number }): JSX.Element {
  return <span>{eur.format(cents / 100)}</span>;
}
