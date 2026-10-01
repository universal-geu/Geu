"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

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

type Attachment = { name: string; url: string };
type AttachmentField = "adjuntaPlano" | "adjuntaMuestra" | "realizaDibujo";

// Files the customer can attach (plano, fotos de la muestra, dibujo). The
// quote's `details` keep the old SI/NO answers (SI = something attached) and
// the URLs under `detailKey`, one per line.
const ATTACHMENT_FIELDS: Array<{ field: AttachmentField; label: string; detailKey: string }> = [
  { field: "adjuntaPlano", label: "Adjunta plano del producto", detailKey: "Plano del producto · archivos" },
  { field: "adjuntaMuestra", label: "Adjunta muestra física (fotos)", detailKey: "Fotos de la muestra · archivos" },
  { field: "realizaDibujo", label: "Adjunta dibujo del producto", detailKey: "Dibujo del producto · archivos" },
];

const EMPTY_ATTACHMENTS: Record<AttachmentField, Attachment[]> = {
  adjuntaPlano: [],
  adjuntaMuestra: [],
  realizaDibujo: [],
};

async function uploadQuoteAttachment(file: File): Promise<Attachment> {
  const signResponse = await fetch("/api/quotes/attachments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, fileSize: file.size }),
  });
  const sign = (await signResponse.json()) as {
    error?: string;
    path?: string;
    token?: string;
    bucket?: string;
    supabaseUrl?: string;
    anonKey?: string;
    publicUrl?: string;
  };
  if (!signResponse.ok || !sign.token || !sign.publicUrl) {
    throw new Error(sign.error || "No fue posible subir el archivo.");
  }

  const supabase = createSupabaseBrowserClient(sign.supabaseUrl!, sign.anonKey!);
  const { error } = await supabase.storage
    .from(sign.bucket!)
    .uploadToSignedUrl(sign.path!, sign.token, file, { contentType: file.type });
  if (error) throw new Error("No fue posible subir el archivo.");

  return { name: file.name, url: sign.publicUrl };
}

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
      <span className="min-w-0 text-[11px] font-black uppercase tracking-[0.06em] text-slate-600">{label}</span>
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
  const [attachments, setAttachments] = useState(EMPTY_ATTACHMENTS);
  const [uploadingField, setUploadingField] = useState<AttachmentField | null>(null);
  const [attachmentError, setAttachmentError] = useState("");

  const addAttachments = async (field: AttachmentField, files: FileList | null) => {
    if (!files?.length) return;
    setUploadingField(field);
    setAttachmentError("");
    try {
      for (const file of Array.from(files)) {
        const attachment = await uploadQuoteAttachment(file);
        setAttachments((current) => ({ ...current, [field]: [...current[field], attachment] }));
      }
    } catch (error) {
      setAttachmentError(error instanceof Error ? error.message : "No fue posible subir el archivo.");
    } finally {
      setUploadingField(null);
    }
  };

  const removeAttachment = (field: AttachmentField, url: string) =>
    setAttachments((current) => ({ ...current, [field]: current[field].filter((item) => item.url !== url) }));

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
      setAttachments(EMPTY_ATTACHMENTS);
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
      "Adjunta plano del producto": attachments.adjuntaPlano.length ? "SI" : "NO",
      "Adjunta muestra física": attachments.adjuntaMuestra.length ? "SI" : "NO",
      "Realiza dibujo del producto": attachments.realizaDibujo.length ? "SI" : "NO",
      "Cliente suministra material": form.clienteSuministraMaterial,
      "Cliente suministra material · cuál": form.clienteSuministraCual,
      ...Object.fromEntries(
        ATTACHMENT_FIELDS.filter(({ field }) => attachments[field].length > 0).map(({ field, detailKey }) => [
          detailKey,
          attachments[field].map((item) => item.url).join("\n"),
        ]),
      ),
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
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 px-3 py-3 sm:px-4 sm:py-6 md:items-center"
          style={{ "--brand-accent": "#075ed8", "--brand-accent-hover": "#054eb3" } as React.CSSProperties}
        >
          <div className="flex h-[min(680px,92dvh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(2,6,23,0.35)]">
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
                <div className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-5">
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
                    <div className="mt-3 sm:max-w-xs">
                      <TextField label="Otro · ¿cuál?" value={form.procesoOtroCual} onChange={(v) => update("procesoOtroCual", v)} />
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                    <div>
                      <SectionTitle>Información del producto</SectionTitle>
                      <div className="mt-4 space-y-3">
                        <TextField label="Color del producto" value={form.colorProducto} onChange={(v) => update("colorProducto", v)} />
                        {ATTACHMENT_FIELDS.map(({ field, label }) => (
                          <div key={field} className="border-b border-slate-100 pb-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <span className="min-w-0 text-[11px] font-black uppercase tracking-[0.06em] text-slate-600">{label}</span>
                              <label
                                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--brand-accent)] px-3 py-1 text-xs font-black text-[var(--brand-accent)] transition hover:bg-[var(--brand-accent)] hover:text-white ${
                                  uploadingField ? "pointer-events-none opacity-60" : ""
                                }`}
                              >
                                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m21 11-8.6 8.6a5 5 0 0 1-7-7l8.6-8.6a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l8-8" />
                                </svg>
                                {uploadingField === field ? "Subiendo…" : "Adjuntar"}
                                <input
                                  type="file"
                                  multiple
                                  accept="application/pdf,image/jpeg,image/png,image/webp"
                                  className="sr-only"
                                  onChange={(event) => {
                                    void addAttachments(field, event.target.files);
                                    event.target.value = "";
                                  }}
                                />
                              </label>
                            </div>
                            {attachments[field].length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {attachments[field].map((item) => (
                                  <li key={item.url} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                                    <a href={item.url} target="_blank" rel="noreferrer" className="truncate hover:underline">
                                      {item.name}
                                    </a>
                                    <button
                                      type="button"
                                      aria-label={`Quitar ${item.name}`}
                                      onClick={() => removeAttachment(field, item.url)}
                                      className="shrink-0 text-slate-400 hover:text-red-600"
                                    >
                                      ✕
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                        <p className="text-[11px] font-semibold text-slate-400">PDF o imagen, hasta 10 MB por archivo.</p>
                        {attachmentError && <p className="text-xs font-semibold text-red-600">{attachmentError}</p>}
                        <YesNoField
                          label="Cliente suministra material"
                          value={form.clienteSuministraMaterial}
                          onChange={(v) => update("clienteSuministraMaterial", v)}
                        />
                        <TextField label="¿Cuál?" value={form.clienteSuministraCual} onChange={(v) => update("clienteSuministraCual", v)} />
                        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                          <TextField label="Material sugerido" value={form.materialSugerido} onChange={(v) => update("materialSugerido", v)} placeholder="Ej: EPDM" />
                          <TextField label="Dureza" value={form.dureza} onChange={(v) => update("dureza", v)} placeholder="Ej: 75 Shore-A" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <SectionTitle>Condiciones de trabajo</SectionTitle>
                      <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2 sm:gap-y-2">
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
                    <div className="mt-4 sm:max-w-xs">
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
                    disabled={submitState === "sending" || uploadingField !== null}
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
