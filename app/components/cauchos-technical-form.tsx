"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type YesNo = "" | "SI" | "NO";

type FormState = {
  cliente: string;
  tel: string;
  contacto: string;
  tipoSolicitud: "" | "Producto nuevo" | "Modificación";
  producto: string;
  descripcion: string;
  proceso: string[];
  procesoOtroCual: string;
  colorProducto: string;
  adjuntaPlano: YesNo;
  adjuntaMuestra: YesNo;
  realizaDibujo: YesNo;
  clienteSuministraMaterial: YesNo;
  clienteSuministraCual: string;
  hidrocarburos: YesNo;
  impacto: YesNo;
  abrasion: YesNo;
  usoExterno: YesNo;
  presionTrabajo: YesNo;
  presionCual: string;
  temperaturaTrabajo: YesNo;
  temperaturaCual: string;
  requisitoLegal: YesNo;
  requisitoCual: string;
  gradoAlimenticio: YesNo;
  otroCondicion: boolean;
  otroCondicionCual: string;
  materialSugerido: string;
  dureza: string;
  cantidad: string;
};

const INITIAL_STATE: FormState = {
  cliente: "",
  tel: "",
  contacto: "",
  tipoSolicitud: "",
  producto: "",
  descripcion: "",
  proceso: [],
  procesoOtroCual: "",
  colorProducto: "",
  adjuntaPlano: "",
  adjuntaMuestra: "",
  realizaDibujo: "",
  clienteSuministraMaterial: "",
  clienteSuministraCual: "",
  hidrocarburos: "",
  impacto: "",
  abrasion: "",
  usoExterno: "",
  presionTrabajo: "",
  presionCual: "",
  temperaturaTrabajo: "",
  temperaturaCual: "",
  requisitoLegal: "",
  requisitoCual: "",
  gradoAlimenticio: "",
  otroCondicion: false,
  otroCondicionCual: "",
  materialSugerido: "",
  dureza: "",
  cantidad: "",
};

const PROCESO_OPTIONS = [
  "Vulcanizado",
  "Inyección plástico",
  "Inyección caucho",
  "Mecanizado",
  "Mezcla",
  "Poliuretano",
  "Extrusión",
  "Ensamble",
];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="border-b border-slate-200 pb-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[var(--brand-accent)]"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[var(--brand-accent)]"
      />
    </label>
  );
}

function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: YesNo;
  onChange: (value: YesNo) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-[11px] font-black uppercase tracking-[0.06em] text-slate-600">{label}</span>
      <div className="flex shrink-0 gap-1.5">
        {(["SI", "NO"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(value === option ? "" : option)}
            className={`rounded-full border px-3 py-1 text-xs font-black transition ${
              value === option
                ? "border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white"
                : "border-slate-300 text-slate-500 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

type Props = {
  triggerLabel?: ReactNode;
  triggerClassName?: string;
};

export default function CauchosTechnicalForm({ triggerLabel = "Diseña tu pieza →", triggerClassName }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [authState, setAuthState] = useState<"loading" | "guest" | "user">("loading");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/account")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { user?: { fullName?: string; company?: string; phone?: string } } | null) => {
        if (cancelled) return;

        if (payload?.user) {
          setAuthState("user");
          setForm((current) => ({
            ...current,
            contacto: current.contacto || payload.user?.fullName || "",
            cliente: current.cliente || payload.user?.company || "",
            tel: current.tel || payload.user?.phone || "",
          }));
        } else {
          setAuthState("guest");
        }
      })
      .catch(() => {
        if (!cancelled) setAuthState("guest");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedTriggerClassName =
    triggerClassName ||
    "inline-flex items-center justify-center rounded-full border border-white bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#075ed8] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition hover:opacity-90";

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const toggleProceso = (option: string) =>
    setForm((current) => ({
      ...current,
      proceso: current.proceso.includes(option)
        ? current.proceso.filter((item) => item !== option)
        : [...current.proceso, option],
    }));

  const close = () => {
    setOpen(false);
    if (submitState === "sent") {
      setForm(INITIAL_STATE);
      setSubmitState("idle");
    }
  };

  const handleSubmit = async () => {
    setSubmitState("sending");

    const proceso = [...form.proceso, ...(form.procesoOtroCual.trim() ? [`Otro: ${form.procesoOtroCual.trim()}`] : [])];
    const condiciones = [
      ...(form.hidrocarburos === "SI" ? ["Hidrocarburos"] : []),
      ...(form.impacto === "SI" ? ["Impacto"] : []),
      ...(form.abrasion === "SI" ? ["Abrasión"] : []),
      ...(form.usoExterno === "SI" ? ["Uso externo"] : []),
      ...(form.presionTrabajo === "SI" ? [`Presión de trabajo${form.presionCual ? `: ${form.presionCual}` : ""}`] : []),
      ...(form.temperaturaTrabajo === "SI"
        ? [`Temperatura de trabajo${form.temperaturaCual ? `: ${form.temperaturaCual}` : ""}`]
        : []),
      ...(form.requisitoLegal === "SI" ? [`Requisito legal${form.requisitoCual ? `: ${form.requisitoCual}` : ""}`] : []),
      ...(form.gradoAlimenticio === "SI" ? ["Grado alimenticio"] : []),
      ...(form.otroCondicion && form.otroCondicionCual.trim() ? [`Otro: ${form.otroCondicionCual.trim()}`] : []),
    ];

    const now = new Date();
    const details: Record<string, string> = {
      Fecha: now.toLocaleDateString("es-CO"),
      Hora: now.toLocaleTimeString("es-CO"),
      Cliente: form.cliente,
      Tel: form.tel,
      Contacto: form.contacto,
      "Tipo de solicitud": form.tipoSolicitud,
      Producto: form.producto,
      "Descripción de la solicitud": form.descripcion,
      "Proceso solicitado": proceso.join(", "),
      "Color del producto": form.colorProducto,
      "Adjunta plano del producto": form.adjuntaPlano,
      "Adjunta muestra física": form.adjuntaMuestra,
      "Realiza dibujo del producto": form.realizaDibujo,
      "Cliente suministra material": form.clienteSuministraMaterial,
      "Cliente suministra material · cuál": form.clienteSuministraCual,
      Hidrocarburos: form.hidrocarburos,
      Impacto: form.impacto,
      Abrasión: form.abrasion,
      "Uso externo": form.usoExterno,
      "Presión de trabajo": form.presionTrabajo,
      "Presión de trabajo · cuál": form.presionCual,
      "Temperatura de trabajo": form.temperaturaTrabajo,
      "Temperatura de trabajo · cuál": form.temperaturaCual,
      "Requisito legal": form.requisitoLegal,
      "Requisito legal · cuál": form.requisitoCual,
      "Grado alimenticio": form.gradoAlimenticio,
      Otro: form.otroCondicion ? form.otroCondicionCual : "",
      "Material sugerido": form.materialSugerido,
      Dureza: form.dureza,
      Cantidad: form.cantidad,
    };

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.contacto,
          company: form.cliente.trim() || form.contacto,
          nit: "",
          phone: form.tel,
          division: "Cauchos",
          requestType: form.tipoSolicitud,
          productDetails: [form.producto, form.descripcion].filter((value) => value.trim()).join(" — "),
          process: proceso,
          conditions: condiciones,
          quantityAndDeadline: form.cantidad,
          details,
        }),
      });

      if (!response.ok) throw new Error("REQUEST_FAILED");
      setSubmitState("sent");
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (authState === "guest") {
            router.push(`/login?next=${encodeURIComponent(pathname || "/cauchos")}`);
            return;
          }
          setOpen(true);
        }}
        className={resolvedTriggerClassName}
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 px-4 py-6 md:items-center"
          style={{ "--brand-accent": "#075ed8", "--brand-accent-hover": "#054eb3" } as React.CSSProperties}
        >
          <div className="flex h-[min(680px,92vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(2,6,23,0.35)]">
            <div className="flex items-center justify-between bg-[var(--brand-accent)] px-5 py-4 text-white">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.1em]">Universal de Cauchos</p>
                <p className="text-xs font-semibold text-white/80">Evaluación técnica de producto</p>
              </div>
              <button
                type="button"
                aria-label="Cerrar formulario"
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-lg font-black hover:bg-white/25"
              >
                ×
              </button>
            </div>

            {submitState === "sent" ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                <p className="text-lg font-black text-slate-900">¡Solicitud enviada!</p>
                <p className="text-sm font-semibold text-slate-500">
                  Nuestro equipo técnico va a revisar tu evaluación y se va a poner en contacto contigo pronto.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-2 rounded-full bg-[var(--brand-accent)] px-6 py-3 text-sm font-black text-white hover:bg-[var(--brand-accent-hover)]"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                  <div>
                    <SectionTitle>Datos de la solicitud</SectionTitle>
                    <p className="mt-3 text-xs font-semibold text-slate-500">
                      Usamos los datos de tu cuenta ({form.contacto}{form.cliente ? ` · ${form.cliente}` : ""}) para
                      esta solicitud.
                    </p>
                    <div className="mt-4">
                      <TextField label="Producto" value={form.producto} onChange={(v) => update("producto", v)} placeholder="Ej: Manguera diam. int. 33mm x 37mm d. ext" />
                    </div>

                    <div className="mt-4">
                      <TextAreaField
                        label="Descripción de la solicitud"
                        value={form.descripcion}
                        onChange={(v) => update("descripcion", v)}
                        placeholder="Cuéntanos qué necesitas: para qué se usa, medidas, color y cualquier detalle importante."
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(["Producto nuevo", "Modificación"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => update("tipoSolicitud", form.tipoSolicitud === option ? "" : option)}
                          className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.04em] transition ${
                            form.tipoSolicitud === option
                              ? "border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white"
                              : "border-slate-300 text-slate-600 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <SectionTitle>Proceso solicitado</SectionTitle>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {PROCESO_OPTIONS.map((option) => {
                        const isSelected = form.proceso.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleProceso(option)}
                            className={`rounded-full border px-4 py-2 text-xs font-black transition ${
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
                    <div className="mt-3 max-w-xs">
                      <TextField label="Otro · ¿cuál?" value={form.procesoOtroCual} onChange={(v) => update("procesoOtroCual", v)} />
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                    <div>
                      <SectionTitle>Información del producto</SectionTitle>
                      <div className="mt-4 space-y-3">
                        <TextField label="Color del producto" value={form.colorProducto} onChange={(v) => update("colorProducto", v)} />
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <YesNoField label="Adjunta plano del producto" value={form.adjuntaPlano} onChange={(v) => update("adjuntaPlano", v)} />
                          <YesNoField label="Adjunta muestra física" value={form.adjuntaMuestra} onChange={(v) => update("adjuntaMuestra", v)} />
                          <YesNoField label="Realiza dibujo del producto" value={form.realizaDibujo} onChange={(v) => update("realizaDibujo", v)} />
                          <YesNoField
                            label="Cliente suministra material"
                            value={form.clienteSuministraMaterial}
                            onChange={(v) => update("clienteSuministraMaterial", v)}
                          />
                        </div>
                        <TextField label="¿Cuál?" value={form.clienteSuministraCual} onChange={(v) => update("clienteSuministraCual", v)} />
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <TextField label="Material sugerido" value={form.materialSugerido} onChange={(v) => update("materialSugerido", v)} placeholder="Ej: EPDM" />
                          <TextField label="Dureza" value={form.dureza} onChange={(v) => update("dureza", v)} placeholder="Ej: 75 Shore-A" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <SectionTitle>Condiciones de trabajo</SectionTitle>
                      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2">
                        <YesNoField label="Hidrocarburos" value={form.hidrocarburos} onChange={(v) => update("hidrocarburos", v)} />
                        <YesNoField label="Impacto" value={form.impacto} onChange={(v) => update("impacto", v)} />
                        <YesNoField label="Abrasión" value={form.abrasion} onChange={(v) => update("abrasion", v)} />
                        <YesNoField label="Uso externo" value={form.usoExterno} onChange={(v) => update("usoExterno", v)} />
                        <YesNoField label="Presión de trabajo" value={form.presionTrabajo} onChange={(v) => update("presionTrabajo", v)} />
                        <YesNoField
                          label="Temper. de trabajo"
                          value={form.temperaturaTrabajo}
                          onChange={(v) => update("temperaturaTrabajo", v)}
                        />
                        {form.presionTrabajo === "SI" && (
                          <TextField label="Presión · ¿cuál?" value={form.presionCual} onChange={(v) => update("presionCual", v)} placeholder="Ej: 50 PSI" />
                        )}
                        {form.temperaturaTrabajo === "SI" && (
                          <TextField label="Temperatura · ¿cuál?" value={form.temperaturaCual} onChange={(v) => update("temperaturaCual", v)} placeholder="Ej: 150 C°" />
                        )}
                        <YesNoField label="Requisito legal" value={form.requisitoLegal} onChange={(v) => update("requisitoLegal", v)} />
                        <YesNoField label="Grado alimenticio" value={form.gradoAlimenticio} onChange={(v) => update("gradoAlimenticio", v)} />
                        {form.requisitoLegal === "SI" && (
                          <TextField label="Requisito legal · ¿cuál?" value={form.requisitoCual} onChange={(v) => update("requisitoCual", v)} />
                        )}
                        <label className="flex items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            checked={form.otroCondicion}
                            onChange={(event) => update("otroCondicion", event.target.checked)}
                            className="h-4 w-4 accent-[var(--brand-accent)]"
                          />
                          <span className="text-[11px] font-black uppercase tracking-[0.06em] text-slate-600">Otro</span>
                        </label>
                        {form.otroCondicion && (
                          <TextField label="Otro · ¿cuál?" value={form.otroCondicionCual} onChange={(v) => update("otroCondicionCual", v)} />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <SectionTitle>Información comercial</SectionTitle>
                    <div className="mt-4 max-w-xs">
                      <TextField label="Cantidad" value={form.cantidad} onChange={(v) => update("cantidad", v)} placeholder="Ej: 100 mts" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-white p-4">
                  {submitState === "error" && (
                    <p className="mb-2 text-center text-xs font-bold text-[var(--brand-accent)]">
                      No pudimos enviar la solicitud. Intenta de nuevo.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitState === "sending"}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-accent)] px-5 py-3.5 text-sm font-black uppercase tracking-[0.06em] text-white transition hover:bg-[var(--brand-accent-hover)] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {submitState === "sending" ? "Enviando..." : "Enviar solicitud"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
