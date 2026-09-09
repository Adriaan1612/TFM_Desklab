import type { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }): JSX.Element {
  return <div className="mx-auto w-full max-w-6xl px-6">{children}</div>;
}
