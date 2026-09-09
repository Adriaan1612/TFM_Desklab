import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <article
      className={`rounded-2xl border border-line bg-white p-6 ${className}`}
    >
      {children}
    </article>
  );
}
