"use client";

import { createElement, useEffect, useRef, useState } from "react";

type ModelViewerElement = HTMLElement & {
  autoRotate: boolean;
  cameraOrbit: string;
  jumpCameraToGoal?: () => void;
};

export default function EngineeringModelViewer() {
  const modelRef = useRef<ModelViewerElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    void import("@google/model-viewer");

    const model = modelRef.current;
    if (!model) return;

    const handleLoad = () => setIsReady(true);
    model.addEventListener("load", handleLoad);
    return () => model.removeEventListener("load", handleLoad);
  }, []);

  const resetCamera = () => {
    const model = modelRef.current;
    if (!model) return;
    model.cameraOrbit = "35deg 72deg auto";
    model.jumpCameraToGoal?.();
  };

  const toggleRotation = () => {
    const model = modelRef.current;
    if (!model) return;
    const nextValue = !autoRotate;
    model.autoRotate = nextValue;
    setAutoRotate(nextValue);
  };

  const toggleFullscreen = async () => {
    if (!stageRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await stageRef.current.requestFullscreen();
  };

  return (
    <div
      ref={stageRef}
      className="group relative h-full min-h-[480px] w-full overflow-hidden bg-black md:min-h-[680px] xl:min-h-[760px]"
    >
      {createElement("model-viewer", {
        ref: modelRef,
        src: "/geu-energy-engineering-3d.glb",
        poster: "/geu-energy-engineering.jpg",
        alt: "Modelo 3D interactivo de una estructura de montaje GEU Energy",
        loading: "eager",
        reveal: "auto",
        "camera-controls": true,
        "auto-rotate": true,
        "auto-rotate-delay": "0",
        "rotation-per-second": "10deg",
        "camera-orbit": "35deg 72deg auto",
        "min-camera-orbit": "auto 35deg 45%",
        "max-camera-orbit": "auto 115deg 250%",
        "interaction-prompt": "auto",
        "interaction-prompt-style": "wiggle",
        "shadow-intensity": "1.25",
        "shadow-softness": "0.75",
        exposure: "1.1",
        "environment-image": "neutral",
        "touch-action": "pan-y",
        style: { width: "100%", height: "100%", background: "#000" },
      })}

      <div
        className={`pointer-events-none absolute inset-0 grid place-items-center bg-black transition-opacity duration-500 ${
          isReady ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={isReady}
      >
        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/65">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#f5a623] shadow-[0_0_18px_rgba(245,166,35,0.8)]" />
          Cargando modelo 3D
        </div>
      </div>

      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={toggleRotation}
          aria-pressed={autoRotate}
          className="rounded-full border border-white/15 bg-black/70 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white backdrop-blur-md transition hover:border-[#f5a623] hover:text-[#f5a623]"
        >
          {autoRotate ? "Pausar giro" : "Activar giro"}
        </button>
        <button
          type="button"
          onClick={resetCamera}
          className="rounded-full border border-white/15 bg-black/70 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white backdrop-blur-md transition hover:border-[#f5a623] hover:text-[#f5a623]"
        >
          Restablecer vista
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-full border border-white/15 bg-black/70 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white backdrop-blur-md transition hover:border-[#f5a623] hover:text-[#f5a623]"
        >
          Pantalla completa
        </button>
      </div>

      <p className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/70 backdrop-blur-md">
        Arrastra para rotar · Desliza para acercar
      </p>
    </div>
  );
}
