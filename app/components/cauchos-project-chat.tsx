"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DIVISION_BRAND, type DivisionName } from "@/lib/divisions";

type StepType = "text" | "textarea" | "choice" | "multichoice";

type Step = {
  key: string;
  label: string;
  bot: string;
  type: StepType;
  options?: string[];
  placeholder?: string;
};

type Message = {
  from: "bot" | "user";
  text: string;
};

function buildSteps(brandLabel: string, division: DivisionName): Step[] {
  const isImport = division === "Import";
  const isPlastic = division === "Plastic";

  const stepsByKey: Record<string, Step> = {
    contacto: {
      key: "contacto",
      label: "Cliente / contacto",
      bot: isImport
        ? "Perfecto. Ahora cuéntame quién solicita la importación: tu nombre y el de tu empresa."
        : `Hola, soy el asistente de ${brandLabel}. Vamos a armar tu evaluacion tecnica. Para empezar, cual es tu nombre y el de tu empresa?`,
      type: "text",
      placeholder: "Ej: Karen Dayanis - Ceramica San Lorenzo",
    },
    nitTelefono: {
      key: "nitTelefono",
      label: "NIT / telefono",
      bot: "Perfecto. Compartime el NIT y un telefono de contacto.",
      type: "text",
      placeholder: "Ej: 860513970-1 - 300 000 0000",
    },
    tipoProducto: {
      key: "tipoProducto",
      label: "Tipo de solicitud",
      bot: isImport
        ? "Es una importacion nueva o una reposicion de una referencia que ya nos compras?"
        : "Es un producto nuevo o una modificacion de uno existente?",
      type: "choice",
      options: isImport ? ["Importacion nueva", "Reposicion"] : ["Producto nuevo", "Modificacion"],
    },
    producto: {
      key: "producto",
      label: isImport ? "Referencia a importar" : "Producto",
      bot: isImport
        ? `Hola, soy el asistente de ${brandLabel}. Vamos a armar tu solicitud de importacion. Para empezar, ¿qué quieres importar? Cuéntame la referencia, especificaciones y para qué se usa.`
        : isPlastic
          ? "Cuentame de la pieza o perfil plastico: medidas, material y para que se usa."
          : "Cuentame del producto: medidas, color y para que se usa.",
      type: "textarea",
      placeholder: isImport
        ? "Ej: Repuestos electronicos automotrices, 500 unidades, uso en linea de ensamble"
        : isPlastic
          ? "Ej: Perfil de PVC 40mm x 20mm, transparente, uso en vitrina"
          : "Ej: Manguera diam. int. 33mm x 37mm d. ext, color negro, uso industrial",
    },
    proceso: {
      key: "proceso",
      label: isImport ? "Modalidad de importacion" : "Proceso solicitado",
      bot: isImport
        ? "Que necesitas gestionar en esta importacion? Puedes elegir varias."
        : "Que proceso de fabricacion necesita? Puedes elegir varios.",
      type: "multichoice",
      options: isImport
        ? [
            "Compra a fabrica en origen",
            "Consolidacion de carga",
            "Nacionalizacion y aduana",
            "Transporte internacional",
            "Distribucion en Colombia",
            "Otro",
          ]
        : isPlastic
          ? [
              "Extrusion",
              "Inyeccion plastico",
              "Mecanizado",
              "Corte y acabado",
              "Desarrollo de molde",
              "Ensamble",
              "Otro",
            ]
          : [
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
    condiciones: {
      key: "condiciones",
      label: isImport ? "Requisitos de la importacion" : "Condiciones de trabajo",
      bot: isImport
        ? "Que mas necesitas para esta importacion? Puedes elegir varias."
        : "Bajo que condiciones de trabajo va a operar? Puedes elegir varias.",
      type: "multichoice",
      options: isImport
        ? [
            "Certificados de origen",
            "Bodegaje",
            "Entrega puerta a puerta",
            "Seguro de carga",
            "Registro sanitario o tecnico",
            "Requisito legal",
          ]
        : isPlastic
          ? [
              "Uso exterior (rayos UV)",
              "Resistencia quimica",
              "Grado alimenticio",
              "Transparencia optica",
              "Temperatura de trabajo",
              "Requisito legal",
            ]
          : [
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
    comercial: {
      key: "comercial",
      label: "Cantidad / entrega",
      bot: "Para cerrar: que cantidad necesitas y para cuando?",
      type: "text",
      placeholder: "Ej: 100 mts - Entrega 5 de marzo",
    },
  };

  const order = isImport
    ? ["producto", "tipoProducto", "proceso", "condiciones", "contacto", "nitTelefono", "comercial"]
    : ["contacto", "nitTelefono", "tipoProducto", "producto", "proceso", "condiciones", "comercial"];

  return order.map((key) => stepsByKey[key]);
}

type Props = {
  division?: DivisionName;
  triggerLabel?: ReactNode;
  triggerClassName?: string;
};

export default function CauchosProjectChat({
  division = "Cauchos",
  triggerLabel = "Hablemos de tu proyecto →",
  triggerClassName,
}: Props) {
  const brandLabel = DIVISION_BRAND[division].label;
  const accent = division === "Cauchos" ? "#dd1b44" : DIVISION_BRAND[division].accent;
  const STEPS = useMemo(() => buildSteps(brandLabel, division), [brandLabel, division]);
  const resolvedTriggerClassName =
    triggerClassName ||
    `inline-flex items-center justify-center rounded-full border border-white bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.08em] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition hover:opacity-90`;
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([{ from: "bot", text: STEPS[0].bot }]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({});
  const [textValue, setTextValue] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const done = stepIndex >= STEPS.length;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, done]);

  const reset = () => {
    setStepIndex(0);
    setMessages([{ from: "bot", text: STEPS[0].bot }]);
    setAnswers({});
    setMultiAnswers({});
    setTextValue("");
    setSelected([]);
    setSubmitState("idle");
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
    const step = STEPS[stepIndex];
    setMultiAnswers((prev) => ({ ...prev, [step.key]: selected }));
    advance(selected.join(", "), selected.join(", "));
  };

  const splitPair = (value: string | undefined): [string, string] => {
    const raw = (value ?? "").split(" - ");
    if (raw.length >= 2) {
      return [raw[0].trim(), raw.slice(1).join(" - ").trim()];
    }
    return [(value ?? "").trim(), ""];
  };

  const handleSendQuote = async () => {
    setSubmitState("sending");
    const [fullName, company] = splitPair(answers.contacto);
    const [nit, phone] = splitPair(answers.nitTelefono);

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          company,
          nit,
          phone,
          division,
          requestType: answers.tipoProducto ?? "",
          productDetails: answers.producto ?? "",
          process: multiAnswers.proceso ?? [],
          conditions: multiAnswers.condiciones ?? [],
          quantityAndDeadline: answers.comercial ?? "",
        }),
      });

      if (!response.ok) throw new Error("REQUEST_FAILED");
      setSubmitState("sent");
    } catch {
      setSubmitState("error");
    }
  };

  const mailBody = STEPS.map((step) => `${step.label}: ${answers[step.key] ?? ""}`).join("%0D%0A");
  const mailHref = `mailto:contacto@grupogeu.com?subject=${encodeURIComponent(
    division === "Import" ? "Solicitud de importacion" : "Solicitud de evaluacion tecnica de producto"
  )}&body=${mailBody}`;

  const currentStep = !done ? STEPS[stepIndex] : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={resolvedTriggerClassName}
        style={triggerClassName ? undefined : { color: accent }}
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 px-4 py-6 md:items-center"
          style={
            {
              "--brand-accent": accent,
              "--brand-accent-hover": division === "Cauchos" ? "#b3153a" : DIVISION_BRAND[division].accentHover,
            } as React.CSSProperties
          }
        >
          <div className="flex h-[min(640px,90vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(2,6,23,0.35)]">
            <div className="flex items-center justify-between bg-[var(--brand-accent)] px-5 py-4 text-white">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.1em]">{brandLabel}</p>
                <p className="text-xs font-semibold text-white/80">
                  {division === "Import" ? "Asistente de solicitud de importacion" : "Asistente de evaluacion tecnica"}
                </p>
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

            <div className="h-1 w-full bg-slate-100">
              <div
                className="h-full bg-[var(--brand-accent)] transition-all duration-300 ease-out"
                style={{ width: `${(Math.min(stepIndex, STEPS.length) / STEPS.length) * 100}%` }}
              />
            </div>

            <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto bg-white px-5 py-5">
              {STEPS.slice(0, stepIndex).map((step) => (
                <div key={step.key} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.06em] text-slate-400">
                    {step.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{answers[step.key]}</p>
                </div>
              ))}

              {!done && currentStep && (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--brand-accent)]">
                    Paso {stepIndex + 1} de {STEPS.length} · {currentStep.label}
                  </p>
                  <p className="mt-2 text-base font-bold leading-6 text-slate-900">{currentStep.bot}</p>
                </div>
              )}

              {done && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.1em] text-[var(--brand-accent)]">
                    Resumen de la solicitud
                  </p>
                  <dl className="space-y-1.5">
                    {STEPS.map((step) => (
                      <div key={step.key} className="flex flex-col">
                        <dt className="text-[11px] font-black uppercase tracking-[0.04em] text-slate-400">
                          {step.label}
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
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
                    Tu respuesta
                  </label>
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={textValue}
                      onChange={(event) => setTextValue(event.target.value)}
                      onKeyDown={(event) => event.key === "Enter" && handleTextSubmit()}
                      placeholder={currentStep.placeholder}
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-[var(--brand-accent)]"
                    />
                    <button
                      type="button"
                      onClick={handleTextSubmit}
                      className="rounded-xl bg-[var(--brand-accent)] px-5 py-3 text-sm font-black text-white hover:bg-[var(--brand-accent-hover)]"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {!done && currentStep?.type === "textarea" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
                    Tu respuesta
                  </label>
                  <textarea
                    autoFocus
                    value={textValue}
                    onChange={(event) => setTextValue(event.target.value)}
                    placeholder={currentStep.placeholder}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-[var(--brand-accent)]"
                  />
                  <button
                    type="button"
                    onClick={handleTextSubmit}
                    className="w-full rounded-xl bg-[var(--brand-accent)] px-5 py-3 text-sm font-black text-white hover:bg-[var(--brand-accent-hover)]"
                  >
                    Siguiente
                  </button>
                </div>
              )}

              {!done && currentStep?.type === "choice" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
                    Elige una opción
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentStep.options?.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleChoice(option)}
                        className="rounded-xl border border-[var(--brand-accent)] px-4 py-2 text-sm font-black text-[var(--brand-accent)] transition hover:bg-[var(--brand-accent)] hover:text-white"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!done && currentStep?.type === "multichoice" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
                    Elige una o varias opciones
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentStep.options?.map((option) => {
                      const isSelected = selected.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleMulti(option)}
                          className={`rounded-xl border px-4 py-2 text-sm font-black transition ${
                            isSelected
                              ? "border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white"
                              : "border-slate-300 text-slate-600 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
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
                    className="w-full rounded-xl bg-[var(--brand-accent)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-accent-hover)] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Siguiente
                  </button>
                </div>
              )}

              {done && (
                <div className="space-y-2">
                  {submitState === "sent" ? (
                    <p className="rounded-2xl bg-[#effaf2] px-4 py-3 text-center text-sm font-black text-[#1f6b39]">
                      ¡Solicitud enviada! Nuestro equipo se pondrá en contacto pronto.
                    </p>
                  ) : (
                    <>
                      {submitState === "error" && (
                        <p className="text-center text-xs font-bold text-[var(--brand-accent)]">
                          No pudimos enviar la solicitud. Intenta de nuevo o usa el correo de respaldo.
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleSendQuote}
                          disabled={submitState === "sending"}
                          className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--brand-accent)] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.06em] text-white hover:bg-[var(--brand-accent-hover)] disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {submitState === "sending" ? "Enviando..." : "Enviar solicitud"}
                        </button>
                        <button
                          type="button"
                          onClick={reset}
                          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-black text-slate-600 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                        >
                          Reiniciar
                        </button>
                      </div>
                      <a
                        href={mailHref}
                        className="block text-center text-xs font-bold text-slate-500 underline underline-offset-2 hover:text-[var(--brand-accent)]"
                      >
                        O envíala por correo desde tu cliente de email
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
