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

const DEFAULT_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw";

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

  if (fill) {
    return (
      <Image
        src={src} alt={alt} fill
        className={className}
        priority={priority}
        sizes={sizes ?? DEFAULT_SIZES}
        onError={() => setError(true)}
        quality={85}
      />
    );
  }

  return (
    <Image
      src={src} alt={alt}
      width={width ?? 800} height={height ?? 600}
      className={className}
      priority={priority}
      sizes={sizes ?? DEFAULT_SIZES}
      onError={() => setError(true)}
      quality={85}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
