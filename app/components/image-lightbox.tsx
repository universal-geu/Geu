"use client";

import { useEffect } from "react";
import Image from "next/image";

type Props = {
  src: string;
  label: string;
  onClose: () => void;
};

export default function ImageLightbox({ src, label, onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[120] bg-[#0f1a24]/88 backdrop-blur-sm">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Cerrar vista ampliada"
      />

      <div className="relative z-[121] flex h-full w-full items-center justify-center px-4 py-8 md:px-8">
        <div className="relative max-h-full w-full max-w-4xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-14 right-0 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/10 text-xl text-white transition-colors duration-200 hover:bg-white/18"
            aria-label="Cerrar vista ampliada"
          >
            ×
          </button>

          <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/6">
            <Image
              src={src}
              alt={label}
              width={1600}
              height={1200}
              className="h-auto max-h-[75vh] w-full object-contain"
            />
          </div>

          <p className="mt-4 text-center text-sm font-black uppercase tracking-[0.12em] text-white">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
