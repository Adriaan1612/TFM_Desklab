import { useState } from "react";
import { productImageUrl, setupImageUrl } from "../images";

function Fallback({ name }: { name: string }): JSX.Element {
  return (
    <div
      aria-hidden
      className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-moss-soft"
    >
      <span className="font-display text-5xl font-bold text-moss-dark">
        {name.charAt(0)}
      </span>
    </div>
  );
}

export function ProductImage({
  slug,
  name,
  imageUrl,
}: {
  slug: string;
  name: string;
  imageUrl: string | null;
}): JSX.Element {
  const [failed, setFailed] = useState(false);
  const src = productImageUrl(imageUrl, slug);
  if (!src || failed) {
    return <Fallback name={name} />;
  }
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-[4/3] w-full rounded-xl object-cover"
    />
  );
}

export function SetupImage({
  slug,
  name,
}: {
  slug: string;
  name: string;
}): JSX.Element {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <Fallback name={name} />;
  }
  return (
    <img
      src={setupImageUrl(slug)}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-[16/9] w-full rounded-xl object-cover"
    />
  );
}
