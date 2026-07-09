"use client";

import { useEffect, useRef, useState } from "react";

type StepType = "text" | "textarea" | "choice" | "multichoice";

type Step = {
  key: string;
  bot: string;
  type: StepType;
  options?: string[];
  placeholder?: string;
};

type Message = {
  from: "bot" | "user";
  text: string;
};

const STEPS: Step[] = [
  {
    key: "contacto",
    bot: "Hola, soy el asistente de Universal de Cauchos. Vamos a armar tu evaluacion tecnica. Para empezar, cual es tu nombre y el de tu empresa?",
    type: "text",
    placeholder: "Ej: Karen Dayanis - Ceramica San Lorenzo",
  },
  {
    key: "nitTelefono",
    bot: "Perfecto. Compartime el NIT y un telefono de contacto.",
    type: "text",
    placeholder: "Ej: 860513970-1 - 300 000 0000",
  },
  {
    key: "tipoProducto",
    bot: "Es un producto nuevo o una modificacion de uno existente?",
    type: "choice",
    options: ["Producto nuevo", "Modificacion"],
  },
  {
    key: "producto",
    bot: "Cuentame del producto: medidas, color y para que se usa.",
    type: "textarea",
    placeholder: "Ej: Manguera diam. int. 33mm x 37mm d. ext, color negro, uso industrial",
  },
  {
    key: "proceso",
    bot: "Que proceso de fabricacion necesita? Puedes elegir varios.",
    type: "multichoice",
    options: [
      "Vulcanizado",
      "Inyeccion plastico",
      "Inyeccion caucho",
      "Mecanizado",
      "Mezcla",
      "Poliuretano",
      "Extrusion",
      "Ensamble",
      "Otro",
    ],
  },
  {
    key: "condiciones",
    bot: "Bajo que condiciones de trabajo va a operar? Puedes elegir varias.",
    type: "multichoice",
    options: [
      "Hidrocarburos",
      "Abrasion",
      "Impacto",
      "Uso externo",
      "Presion de trabajo",
      "Temperatura de trabajo",
      "Grado alimenticio",
      "Requisito legal",
    ],
  },
  {
    key: "comercial",
    bot: "Para cerrar: que cantidad necesitas y para cuando?",
    type: "text",
    placeholder: "Ej: 100 mts - Entrega 5 de marzo",
  },
];

const STEP_LABELS: Record<string, string> = {
  contacto: "Cliente / contacto",
  nitTelefono: "NIT / telefono",
  tipoProducto: "Tipo de solicitud",
  producto: "Producto",
  proceso: "Proceso solicitado",
  condiciones: "Condiciones de trabajo",
  comercial: "Cantidad / entrega",
};

export default function CauchosProjectChat() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([{ from: "bot", text: STEPS[0].bot }]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textValue, setTextValue] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const done = stepIndex >= STEPS.length;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, done]);

  const reset = () => {
    setStepIndex(0);
    setMessages([{ from: "bot", text: STEPS[0].bot }]);
    setAnswers({});
    setTextValue("");
    setSelected([]);
  };

  const advance = (answerText: string, storedValue: string) => {
    const step = STEPS[stepIndex];
    setMessages((prev) => [...prev, { from: "user", text: answerText }]);
    setAnswers((prev) => ({ ...prev, [step.key]: storedValue }));
    setTextValue("");
    setSelected([]);

    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    if (nextIndex < STEPS.length) {
      setMessages((prev) => [...prev, { from: "bot", text: STEPS[nextIndex].bot }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Listo, ya tengo todo. Este es el resumen de tu solicitud:" },
      ]);
    }
  };

  const handleTextSubmit = () => {
    const value = textValue.trim();
    if (!value) return;
    advance(value, value);
  };

  const handleChoice = (option: string) => {
    advance(option, option);
  };

  const toggleMulti = (option: string) => {
    setSelected((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]));
  };

  const handleMultiSubmit = () => {
    if (selected.length === 0) return;
    advance(selected.join(", "), selected.join(", "));
  };

  const mailBody = STEPS.map((step) => `${STEP_LABELS[step.key]}: ${answers[step.key] ?? ""}`).join("%0D%0A");
  const mailHref = `mailto:contacto@grupogeu.com?subject=${encodeURIComponent(
    "Solicitud de evaluacion tecnica de producto"
  )}&body=${mailBody}`;

  const currentStep = !done ? STEPS[stepIndex] : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-white bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#dd1b44] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition hover:bg-[#fdecf0]"
      >
        Hablemos de tu proyecto →
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 px-4 py-6 md:items-center">
          <div className="flex h-[min(640px,90vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(2,6,23,0.35)]">
            <div className="flex items-center justify-between bg-[#dd1b44] px-5 py-4 text-white">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.1em]">Universal de Cauchos</p>
                <p className="text-xs font-semibold text-white/80">Asistente de evaluacion tecnica</p>
              </div>
              <button
                type="button"
                aria-label="Cerrar chat"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-lg font-black hover:bg-white/25"
              >
                ×
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-5 py-5">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-semibold leading-6 ${
                      message.from === "user"
                        ? "rounded-br-sm bg-[#dd1b44] text-white"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {done && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.1em] text-[#dd1b44]">
                    Resumen de la solicitud
                  </p>
                  <dl className="space-y-1.5">
                    {STEPS.map((step) => (
                      <div key={step.key} className="flex flex-col">
                        <dt className="text-[11px] font-black uppercase tracking-[0.04em] text-slate-400">
                          {STEP_LABELS[step.key]}
                        </dt>
                        <dd className="font-semibold text-slate-800">{answers[step.key]}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white p-4">
              {!done && currentStep?.type === "text" && (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={textValue}
                    onChange={(event) => setTextValue(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && handleTextSubmit()}
                    placeholder={currentStep.placeholder}
                    className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#dd1b44]"
                  />
                  <button
                    type="button"
                    onClick={handleTextSubmit}
                    className="rounded-full bg-[#dd1b44] px-5 py-3 text-sm font-black text-white hover:bg-[#b3153a]"
                  >
                    Enviar
                  </button>
                </div>
              )}

              {!done && currentStep?.type === "textarea" && (
                <div className="flex flex-col gap-2">
                  <textarea
                    autoFocus
                    value={textValue}
                    onChange={(event) => setTextValue(event.target.value)}
                    placeholder={currentStep.placeholder}
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#dd1b44]"
                  />
                  <button
                    type="button"
                    onClick={handleTextSubmit}
                    className="self-end rounded-full bg-[#dd1b44] px-5 py-3 text-sm font-black text-white hover:bg-[#b3153a]"
                  >
                    Enviar
                  </button>
                </div>
              )}

              {!done && currentStep?.type === "choice" && (
                <div className="flex flex-wrap gap-2">
                  {currentStep.options?.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleChoice(option)}
                      className="rounded-full border border-[#dd1b44] px-4 py-2 text-sm font-black text-[#dd1b44] transition hover:bg-[#dd1b44] hover:text-white"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {!done && currentStep?.type === "multichoice" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {currentStep.options?.map((option) => {
                      const isSelected = selected.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleMulti(option)}
                          className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                            isSelected
                              ? "border-[#dd1b44] bg-[#dd1b44] text-white"
                              : "border-slate-300 text-slate-600 hover:border-[#dd1b44] hover:text-[#dd1b44]"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={handleMultiSubmit}
                    disabled={selected.length === 0}
                    className="self-end rounded-full bg-[#dd1b44] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b3153a] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {done && (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={mailHref}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-[#dd1b44] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.06em] text-white hover:bg-[#b3153a]"
                  >
                    Enviar solicitud
                  </a>
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-full border border-slate-300 px-5 py-3 text-sm font-black text-slate-600 hover:border-[#dd1b44] hover:text-[#dd1b44]"
                  >
                    Reiniciar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
