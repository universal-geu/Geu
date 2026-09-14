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
// that direction instead of a mirrored front-on walk. Each frame was
// generated as its own separate image (not sliced from a shared sheet), so
// there's no risk of neighboring poses bleeding into each other.
const RUN_FRAMES = Array.from({ length: 9 }, (_, i) => `/gus/run-${i + 1}.png`);
const CELEBRATE_FRAME = "/gus/celebrate.png";

const HOVER_GREETING = "¡Hola! Me llamo Gus, ¿en qué puedo ayudarte?";
const GREETINGS = [
  "¡Hola! Me llamo Gus, el hijo de Yulo de GEU Structure 👋",
  "¿Listo para tu próximo proyecto solar?",
  "Ingeniería, galvanizado y montaje — todo en un solo lugar.",
  "¿Necesitas hablar con un ingeniero? Ahí arriba tienes el botón.",
  "M24: la estructura que se adapta a tu terreno.",
];

const WIDGET_SIZE = 190;
const STORAGE_KEY = "yulo-widget-position";
const WANDER_IDLE_MS = 15000;
const WANDER_CHECK_MS = 4000;
// Structure's division key in the rest of the codebase is "Innovation", not
// "Structure" — see DIVISION_BRAND in lib/divisions.ts.
const VOICE_DIVISION = "Innovation";
const VOICE_HISTORY_LIMIT = 8;
const VOICE_LANG = "es-CO";
const VOICE_LISTEN_ERROR = "No te escuché bien. Intenta de nuevo cuando quieras.";
const VOICE_REQUEST_ERROR = "Tuve un problema para responder. Intenta de nuevo en un momento.";

type Mode = "idle" | "wave" | "run" | "celebrate";
type Position = { x: number; y: number };
type VoiceStatus = "idle" | "listening" | "thinking" | "speaking" | "error";
type ConversationTurn = { role: "user" | "assistant"; content: string };

// Minimal shape of the (non-standard, vendor-prefixed) Web Speech API
// SpeechRecognition instance — not part of TypeScript's DOM lib.
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

export default function YuloWidget() {
  const [position, setPosition] = useState<Position | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [frameIndex, setFrameIndex] = useState(0);
  const [facingLeft, setFacingLeft] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [voiceBubble, setVoiceBubble] = useState<string | null>(null);

  const sequenceTimeouts = useRef<number[]>([]);
  const runIntervalRef = useRef<number | null>(null);
  const bubbleTimeout = useRef<number | null>(null);
  const idleSinceRef = useRef(0);
  const conversationRef = useRef<ConversationTurn[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const modeRef = useRef<Mode>("idle");
  const positionRef = useRef<Position | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const lastPointerX = useRef(0);
  const dragRunFrame = useRef(0);

  useEffect(() => {
    idleSinceRef.current = Date.now();
  }, []);
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

  // Feature-detect once on mount: speech recognition needs a secure context
  // (HTTPS) and is Chrome/Edge-only today, so the mic button only shows up
  // when both recognition and speech synthesis are actually available. Must
  // run in an effect (not a lazy useState initializer) since it reads
  // `window`: this component renders null until `position` is set (also via
  // an effect, below), so nothing is ever painted before this has run.
  useEffect(() => {
    const w = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const hasRecognition = Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoiceSupported(hasRecognition && "speechSynthesis" in window);
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = VOICE_LANG;
    utterance.onstart = () => setVoiceStatus("speaking");
    utterance.onend = () => setVoiceStatus((current) => (current === "speaking" ? "idle" : current));
    utterance.onerror = () => setVoiceStatus((current) => (current === "speaking" ? "idle" : current));
    window.speechSynthesis.speak(utterance);
  }, []);

  const askYulo = useCallback(
    async (question: string) => {
      setVoiceBubble(question);
      setVoiceStatus("thinking");
      const userTurn: ConversationTurn = { role: "user", content: question };
      conversationRef.current = [...conversationRef.current, userTurn].slice(-VOICE_HISTORY_LIMIT);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: conversationRef.current, division: VOICE_DIVISION }),
        });
        const payload = (await response.json()) as { message?: string; error?: string };
        const answer = response.ok && payload.message ? payload.message : VOICE_REQUEST_ERROR;

        const assistantTurn: ConversationTurn = { role: "assistant", content: answer };
        conversationRef.current = [...conversationRef.current, assistantTurn].slice(-VOICE_HISTORY_LIMIT);
        setVoiceBubble(answer);
        speak(answer);
      } catch {
        setVoiceBubble(VOICE_REQUEST_ERROR);
        setVoiceStatus("error");
        speak(VOICE_REQUEST_ERROR);
      }
    },
    [speak],
  );

  const toggleListening = useCallback(
    (event: React.PointerEvent | React.MouseEvent) => {
      event.stopPropagation();
      if (!voiceSupported) return;

      if (voiceStatus === "listening") {
        recognitionRef.current?.stop();
        return;
      }

      window.speechSynthesis?.cancel();
      clearSequenceTimeouts();
      const w = window as typeof window & {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
      };
      const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!Recognition) return;

      const recognition = new Recognition();
      recognition.lang = VOICE_LANG;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (resultEvent) => {
        const transcript = resultEvent.results[0]?.[0]?.transcript;
        if (transcript) void askYulo(transcript);
      };
      recognition.onerror = () => {
        setVoiceStatus("error");
        setVoiceBubble(VOICE_LISTEN_ERROR);
      };
      recognition.onend = () => {
        setVoiceStatus((current) => (current === "listening" ? "idle" : current));
      };

      recognitionRef.current = recognition;
      setBubble(null);
      setVoiceBubble(null);
      setVoiceStatus("listening");
      recognition.start();
    },
    [voiceSupported, voiceStatus, askYulo],
  );

  // Start bottom-right by default; restore a remembered spot if the visitor
  // has moved Yulo before, clamped in case the viewport shrank since then.
  // Must run in an effect (not a lazy useState initializer) since it reads
  // `window`/localStorage: this component renders null on the server and on
  // the client's first pass (see the `if (!position) return null` below), so
  // hydration always matches before this effect fires the one-time update.
  useEffect(() => {
    const clamp = (x: number, y: number) => ({
      x: Math.min(Math.max(x, 8), window.innerWidth - WIDGET_SIZE - 8),
      y: Math.min(Math.max(y, 8), window.innerHeight - WIDGET_SIZE - 8),
    });

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Position;
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
    setFacingLeft(false);
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

    // The run sprites face left natively, so `facingLeft` (which flips via
    // scaleX when true) actually needs to flip when moving right, not left.
    setFacingLeft(targetX > startX);
    setMode("run");
    setFrameIndex(0);

    const baseY = currentPosition.y;
    // Ease in/out of the sprint (accelerate off the mark, decelerate into the
    // stop) instead of a constant-speed slide, which is what reads as
    // "gliding" rather than actually running.
    const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
    // A gait bounces twice per full cycle through the frame set (once per
    // footfall) — this is what sells "running" even when the frames
    // themselves are similar poses, since the body visibly rises and falls
    // with each stride instead of sliding across at a flat height.
    const BOB_HEIGHT = 7;

    const steps = 36;
    const stepDuration = 55;
    // Advance the pose slower than the position updates so each frame is
    // actually on screen long enough to read, instead of strobing through
    // all 10 poses several times over a single short dash.
    const framesPerPoseStep = 3;
    let step = 0;
    stopRunInterval();
    runIntervalRef.current = window.setInterval(() => {
      step += 1;
      const eased = easeInOutQuad(step / steps);
      const bob = Math.sin((step / 12) * Math.PI) ** 2 * BOB_HEIGHT;
      setPosition({ x: startX + (targetX - startX) * eased, y: baseY - bob });
      setFrameIndex(Math.floor(step / framesPerPoseStep) % RUN_FRAMES.length);
      if (step >= steps) {
        stopRunInterval();
        setPosition({ x: startX + (targetX - startX), y: baseY });
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
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
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
      // Same left-facing-native flip rule as startWander.
      setFacingLeft(deltaX > 0);
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
  const voiceStatusText =
    voiceStatus === "listening" ? "🎙️ Te escucho..." : voiceStatus === "thinking" ? "Pensando..." : null;
  const bubbleText =
    voiceStatusText ?? voiceBubble ?? bubble ?? (isHovering && mode === "idle" ? HOVER_GREETING : null);

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
        style={{ transform: mode === "run" && facingLeft ? "scaleX(-1)" : undefined }}
      />
      {voiceSupported && (
        <button
          type="button"
          aria-label={voiceStatus === "listening" ? "Dejar de escuchar" : "Hablar con el hijo de Yulo"}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={toggleListening}
          className={`absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-white shadow-[0_6px_14px_rgba(0,0,0,0.35)] transition-colors duration-150 ${
            voiceStatus === "listening"
              ? "animate-pulse bg-[#e4002b]"
              : voiceStatus === "thinking" || voiceStatus === "speaking"
                ? "bg-slate-500"
                : "bg-[#0498b4] hover:bg-[#037c93]"
          }`}
        >
          <MicIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
