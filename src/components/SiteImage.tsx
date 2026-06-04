"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

interface Props {
  src: string;
  alt: string;
  label?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function SiteImage({ src, alt, label, fill, width, height, className, priority, sizes }: Props) {
  const [error, setError] = useState(false);

  const Placeholder = () => (
    <div className={[
      "flex flex-col items-center justify-center gap-2 bg-tiki-ocean-mid",
      "border border-dashed border-white/15 select-none pointer-events-none",
      fill ? "absolute inset-0" : "w-full h-full",
      className ?? "",
    ].join(" ")}>
      <Camera size={22} className="text-tiki-lagon/50" />
      <div className="text-center px-4">
        <p className="text-white/30 text-xs font-medium">{label ?? alt}</p>
        <p className="text-white/15 text-[10px] mt-0.5 font-mono">{src}</p>
      </div>
    </div>
  );

  if (error) return <Placeholder />;

  // Images locales : <img> natif pour avoir onError fiable
  if (src.startsWith("/")) {
    return (
      <img
        src={src}
        alt={alt}
        className={[fill ? "absolute inset-0 w-full h-full" : "w-full h-full", "object-cover", className ?? ""].join(" ")}
        onError={() => setError(true)}
      />
    );
  }

  // Images externes (Unsplash, YouTube, etc.) : Next.js Image avec optimisation
  if (fill) {
    return (
      <Image
        src={src} alt={alt} fill
        className={className} priority={priority} sizes={sizes}
        onError={() => setError(true)}
      />
    );
  }
  return (
    <Image
      src={src} alt={alt}
      width={width ?? 800} height={height ?? 600}
      className={className} priority={priority} sizes={sizes}
      onError={() => setError(true)}
    />
  );
}
