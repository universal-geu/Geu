"use client";

import { useState, type CSSProperties } from "react";

// Carril con Gus en miniatura (los mismos cuadros del widget de GEU
// Structure) sobre la línea de seguimiento de un pedido: respira de pie
// mientras el pago está pendiente, corre del paso anterior al actual y luego
// se queda respirando, y celebra cuando el pedido fue recibido. Las
// animaciones viven en globals.css (.gus-tracker*). Ocupa 56px de alto (h-14).
export default function GusOrderRunner({
  activeStep,
  stepCount,
  cancelled = false,
}: {
  activeStep: number;
  stepCount: number;
  cancelled?: boolean;
}) {
  const [arrived, setArrived] = useState(false);

  if (cancelled) return <div className="h-14" aria-hidden="true" />;

  // Centro horizontal de cada paso (columnas de igual ancho).
  const stepPosition = (index: number) => `${((index + 0.5) / stepCount) * 100}%`;
  const isDelivered = activeStep === stepCount - 1;
  const isRunning = activeStep >= 0 && !isDelivered && !arrived;

  const pose = isDelivered ? "gus-tracker-celebrate" : isRunning ? "gus-tracker-run" : "gus-tracker-idle";

  return (
    <div className="relative h-14" aria-hidden="true">
      <div
        className={`gus-tracker ${isRunning ? "gus-tracker-running" : ""}`}
        style={
          {
            "--gus-from": activeStep <= 0 ? "0%" : stepPosition(activeStep - 1),
            "--gus-to": stepPosition(Math.max(activeStep, 0)),
          } as CSSProperties
        }
        onAnimationEnd={(event) => {
          if (event.animationName === "gus-run-in") setArrived(true);
        }}
      >
        <div className={pose} />
      </div>
    </div>
  );
}
