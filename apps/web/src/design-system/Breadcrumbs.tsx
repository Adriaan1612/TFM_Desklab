import { Fragment } from "react";
import { Link } from "react-router-dom";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ trail }: { trail: Crumb[] }): JSX.Element {
  return (
    <nav aria-label="Migas de pan">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
        {trail.map((crumb, i) => (
          <Fragment key={crumb.label}>
            {i > 0 && <li aria-hidden>·</li>}
            <li>
              {crumb.to ? (
                <Link to={crumb.to} className="hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink">
                  {crumb.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
