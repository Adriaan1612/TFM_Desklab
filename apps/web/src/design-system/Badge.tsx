export function Badge({ label }: { label: string }): JSX.Element {
  return (
    <span className="inline-flex items-center rounded-full bg-moss-soft px-2.5 py-0.5 text-xs font-medium text-moss-dark">
      {label}
    </span>
  );
}
