"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const IDLE_FRAMES = ["/gus/idle-1.png", "/gus/idle-2.png"];
const WAVE_FRAMES = [
  "/gus/wave-1.png",
  "/gus/wave-2.png",
  "/gus/wave-3.png",
  "/gus/wave-2.png",
  "/gus/wave-1.png",
];
// True side-profile sprint poses (vs. the old front-facing walk poses), so
// flipping them horizontally for left-vs-right actually reads as running in
// that direction instead of a mirrored front-on walk. All 24 source frames
// (vs. the original 2) so the cycle reads as fluid motion instead of a
// choppy toggle.
const RUN_FRAMES = Array.from({ length: 24 }, (_, i) => `/gus/run-${i + 1}.png`);
const CELEBRATE_FRAME = "/gus/celebrate.png";

const HOVER_GREETING = "¡Hola! Soy el hijo de Yulo 👋";
const GREETINGS = [
  "¡Hola! Soy el hijo de Yulo, de GEU Structure 👋",
  "¿Listo para tu próximo proyecto solar?",
  "Ingeniería, galvanizado y montaje — todo en un solo lugar.",
  "¿Necesitas hablar con un ingeniero? Ahí arriba tienes el botón.",
  "M24: la estructura que se adapta a tu terreno.",
];

const WIDGET_SIZE = 190;
const STORAGE_KEY = "yulo-widget-position";
const WANDER_IDLE_MS = 15000;
const WANDER_CHECK_MS = 4000;

type Mode = "idle" | "wave" | "run" | "celebrate";
type Position = { x: number; y: number };

export default function YuloWidget() {
  const [position, setPosition] = useState<Position | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [frameIndex, setFrameIndex] = useState(0);
  const [facingLeft, setFacingLeft] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const sequenceTimeouts = useRef<number[]>([]);
  const runIntervalRef = useRef<number | null>(null);
  const bubbleTimeout = useRef<number | null>(null);
  const idleSinceRef = useRef(Date.now());

  const modeRef = useRef<Mode>("idle");
  const positionRef = useRef<Position | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const lastPointerX = useRef(0);
  const dragRunFrame = useRef(0);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const clearSequenceTimeouts = () => {
    sequenceTimeouts.current.forEach((id) => window.clearTimeout(id));
    sequenceTimeouts.current = [];
  };

  const stopRunInterval = () => {
    if (runIntervalRef.current !== null) {
      window.clearInterval(runIntervalRef.current);
      runIntervalRef.current = null;
    }
  };

  // Start bottom-right by default; restore a remembered spot if the visitor
  // has moved Yulo before, clamped in case the viewport shrank since then.
  useEffect(() => {
    const clamp = (x: number, y: number) => ({
      x: Math.min(Math.max(x, 8), window.innerWidth - WIDGET_SIZE - 8),
      y: Math.min(Math.max(y, 8), window.innerHeight - WIDGET_SIZE - 8),
    });

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Position;
        setPosition(clamp(parsed.x, parsed.y));
        return;
      }
    } catch {
      // ignore malformed storage
    }

    setPosition(
      clamp(window.innerWidth - WIDGET_SIZE - 28, window.innerHeight - WIDGET_SIZE - 28),
    );
  }, []);

  const playSequence = useCallback(
    (frames: string[], frameDuration: number, onDone?: () => void) => {
      clearSequenceTimeouts();
      frames.forEach((_, index) => {
        const id = window.setTimeout(() => setFrameIndex(index), index * frameDuration);
        sequenceTimeouts.current.push(id);
      });
      const doneId = window.setTimeout(() => onDone?.(), frames.length * frameDuration);
      sequenceTimeouts.current.push(doneId);
    },
    [],
  );

  const returnToIdle = useCallback(() => {
    setMode("idle");
    setFrameIndex(0);
    idleSinceRef.current = Date.now();
  }, []);

  const greet = useCallback(() => {
    stopRunInterval();
    clearSequenceTimeouts();
    setMode("wave");
    setFacingLeft(false);
    playSequence(WAVE_FRAMES, 220, returnToIdle);

    setBubble(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    if (bubbleTimeout.current) window.clearTimeout(bubbleTimeout.current);
    bubbleTimeout.current = window.setTimeout(() => setBubble(null), 3200);
  }, [playSequence, returnToIdle]);

  // Idle breathing crossfade between the two resting poses.
  useEffect(() => {
    if (mode !== "idle") return;
    const id = window.setInterval(() => {
      setFrameIndex((current) => (current === 0 ? 1 : 0));
    }, 2400);
    return () => window.clearInterval(id);
  }, [mode]);

  const startWander = useCallback(() => {
    const currentPosition = positionRef.current;
    if (!currentPosition) return;

    const distance = 90 + Math.random() * 70;
    const goLeft = Math.random() > 0.5;
    const maxX = window.innerWidth - WIDGET_SIZE - 8;
    const startX = currentPosition.x;
    const targetX = goLeft ? Math.max(8, startX - distance) : Math.min(maxX, startX + distance);
    if (Math.abs(targetX - startX) < 20) return;

    setFacingLeft(targetX < startX);
    setMode("run");
    setFrameIndex(0);

    const steps = 24;
    const stepDuration = 60;
    let step = 0;
    stopRunInterval();
    runIntervalRef.current = window.setInterval(() => {
      step += 1;
      const progress = step / steps;
      setPosition({ x: startX + (targetX - startX) * progress, y: currentPosition.y });
      setFrameIndex(step % RUN_FRAMES.length);
      if (step >= steps) {
        stopRunInterval();
        returnToIdle();
      }
    }, stepDuration);
  }, [returnToIdle]);

  // Stable scheduler (set up once) that occasionally sends Yulo on a short
  // run if nobody has interacted with him in a while.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (modeRef.current !== "idle" || isDraggingRef.current) return;
      if (Date.now() - idleSinceRef.current < WANDER_IDLE_MS) return;
      startWander();
    }, WANDER_CHECK_MS);
    return () => window.clearInterval(id);
  }, [startWander]);

  useEffect(
    () => () => {
      clearSequenceTimeouts();
      stopRunInterval();
      if (bubbleTimeout.current) window.clearTimeout(bubbleTimeout.current);
    },
    [],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!position) return;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    didDrag.current = false;
    isDraggingRef.current = true;
    lastPointerX.current = event.clientX;
    stopRunInterval();
    clearSequenceTimeouts();
    dragOffset.current = { x: event.clientX - position.x, y: event.clientY - position.y };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    if (!didDrag.current) {
      // First move of this drag: switch to the running pose and start
      // cycling through the run frames for as long as the drag lasts.
      didDrag.current = true;
      setMode("run");
      dragRunFrame.current = 0;
      setFrameIndex(0);
      runIntervalRef.current = window.setInterval(() => {
        dragRunFrame.current = (dragRunFrame.current + 1) % RUN_FRAMES.length;
        setFrameIndex(dragRunFrame.current);
      }, 130);
    }

    const deltaX = event.clientX - lastPointerX.current;
    if (Math.abs(deltaX) > 2) {
      setFacingLeft(deltaX < 0);
      lastPointerX.current = event.clientX;
    }

    const nextX = Math.min(
      Math.max(event.clientX - dragOffset.current.x, 8),
      window.innerWidth - WIDGET_SIZE - 8,
    );
    const nextY = Math.min(
      Math.max(event.clientY - dragOffset.current.y, 8),
      window.innerHeight - WIDGET_SIZE - 8,
    );
    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    idleSinceRef.current = Date.now();
    stopRunInterval();
    if (positionRef.current) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(positionRef.current));
      } catch {
        // ignore storage failures (private mode, quota, etc.)
      }
    }
    if (!didDrag.current) {
      if (modeRef.current === "idle") {
        greet();
      } else if (modeRef.current === "wave") {
        clearSequenceTimeouts();
        setMode("celebrate");
        setFrameIndex(0);
        const id = window.setTimeout(returnToIdle, 900);
        sequenceTimeouts.current.push(id);
      }
    } else {
      setFacingLeft(false);
      returnToIdle();
    }
  };

  if (!position) return null;

  const frames =
    mode === "wave"
      ? WAVE_FRAMES
      : mode === "run"
        ? RUN_FRAMES
        : mode === "celebrate"
          ? [CELEBRATE_FRAME]
          : IDLE_FRAMES;
  const src = frames[frameIndex % frames.length] ?? IDLE_FRAMES[0];
  const bubbleText = bubble ?? (isHovering && mode === "idle" ? HOVER_GREETING : null);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="El hijo de Yulo, asistente de GEU Structure"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") greet();
      }}
      className="fixed z-[70] cursor-grab touch-none select-none active:cursor-grabbing"
      style={{ left: position.x, top: position.y, width: WIDGET_SIZE, height: WIDGET_SIZE }}
    >
      {bubbleText && (
        <div className="pointer-events-none absolute -top-3 left-1/2 w-52 -translate-x-1/2 -translate-y-full rounded-2xl rounded-br-none bg-white px-3.5 py-2.5 text-center text-[11px] font-bold leading-snug text-slate-900 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
          {bubbleText}
        </div>
      )}
      <Image
        src={src}
        alt="El hijo de Yulo, mascota de GEU Structure"
        width={WIDGET_SIZE}
        height={WIDGET_SIZE}
        draggable={false}
        priority
        className="h-full w-full object-contain object-bottom drop-shadow-[0_10px_14px_rgba(0,0,0,0.35)]"
        style={{ transform: facingLeft ? "scaleX(-1)" : undefined }}
      />
    </div>
  );
}
