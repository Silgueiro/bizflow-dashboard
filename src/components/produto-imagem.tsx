import { useState } from "react";
import { ImageIcon } from "lucide-react";

export function ProdutoImagem({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [erro, setErro] = useState(false);

  if (!src || erro) {
    return (
      <div className={`grid place-items-center bg-muted text-muted-foreground ${className ?? ""}`}>
        <ImageIcon className="size-6" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErro(true)}
      className={`object-cover ${className ?? ""}`}
    />
  );
}
