import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string;
  variant?: Variant;
  children: ReactNode;
}

const styles: Record<Variant, string> = {
  primary: "bg-ink text-canvas hover:opacity-90",
  secondary: "border border-line bg-transparent text-ink hover:border-ink",
};

export function Button({
  to,
  variant = "primary",
  children,
  className = "",
  ...rest
}: ButtonProps): JSX.Element {
  const cls = `inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition ${styles[variant]} ${className}`;
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
