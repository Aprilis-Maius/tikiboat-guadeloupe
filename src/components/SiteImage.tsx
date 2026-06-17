import Image from "next/image";

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

export default function SiteImage({ src, alt, fill, width, height, className, priority, sizes }: Props) {
  if (fill) {
    return (
      <Image
        src={src} alt={alt} fill
        className={className}
        priority={priority}
        sizes={sizes ?? DEFAULT_SIZES}
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
      quality={85}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
