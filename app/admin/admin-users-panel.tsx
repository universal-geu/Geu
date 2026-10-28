"use client";

import { useEffect, useState } from "react";
import {
  ADMIN_TOOL_KEYS,
  ADMIN_TOOL_OPTIONS,
  getAdminAccessLevel,
  getAdminUnits,
  grantsAnyAdminTool,
  hasAdminExtra,
  isToolAllowedForDivision,
  type AdminAccessLevel,
  type AdminExtraKey,
  type AdminToolKey,
} from "@/lib/admin-permissions";
import { DIVISION_BRAND, DIVISIONS, isServiceDivision, type DivisionName } from "@/lib/divisions";

type TeamUser = {
  id: string;
  fullName: string;
  email: string;
  company: string | null;
  permissions: string[];
  active: boolean;
  createdAt: string;
};

type ToolLevel = AdminAccessLevel | "none";

type FormState = {
  fullName: string;
  email: string;
  area: string;
  password: string;
  levels: Partial<Record<AdminToolKey, ToolLevel>>;
  hiddenExtras: AdminExtraKey[];
  // Units the user can enter; this one included unless turned off.
  units: DivisionName[];
};

const EMPTY_FORM: FormState = { fullName: "", email: "", area: "", password: "", levels: {}, hiddenExtras: [], units: [] };

// Quick profiles for the form. Each maps a tool to the level it gets; tools
// left out get no access, and levels a tool doesn't offer fall back to the
// closest one it does.
const PRESETS: {
  key: string;
  label: string;
  description: string;
  levels: Partial<Record<AdminToolKey, AdminAccessLevel>>;
}[] = [
  {
    key: "full",
    label: "Acceso completo",
    description: "Todo el panel",
    levels: Object.fromEntries(ADMIN_TOOL_KEYS.map((tool) => [tool, "edit"])),
  },
  {
    key: "readonly",
    label: "Solo lectura",
    description: "Ve todo, no cambia nada",
    levels: Object.fromEntries(
      ADMIN_TOOL_KEYS.filter((tool) => tool !== "create").map((tool) => [tool, "view"]),
    ),
  },
  {
    key: "sales",
    label: "Ventas",
    description: "Pedidos, clientes y cotizaciones",
    levels: { dashboard: "view", orders: "edit", customers: "view", quotes: "edit", reports: "view", edit: "view", inventory: "view" },
  },
  {
    key: "catalog",
    label: "Catálogo",
    description: "Productos, stock y categorías",
    levels: { create: "edit", edit: "edit", inventory: "edit", categories: "edit", images: "edit" },
  },
  {
    key: "content",
    label: "Contenido web",
    description: "Imágenes y textos del sitio",
    levels: { images: "edit", settings: "edit" },
  },
];

const TOOL_GROUPS: { label: string; tools: readonly AdminToolKey[] }[] = [
  { label: "Ventas", tools: ["dashboard", "orders", "customers", "quotes", "reports"] },
  { label: "Catálogo", tools: ["create", "edit", "inventory", "categories"] },
  { label: "Sitio web", tools: ["images", "settings", "store"] },
];

const TOOL_ICON_PATHS: Record<AdminToolKey, React.ReactNode> = {
  dashboard: <path d="M4 4h6v7H4zM14 4h6v4h-6zM14 12h6v8h-6zM4 15h6v5H4z" />,
  create: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" />,
  inventory: <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v18M4 7.5l8 4.5 8-4.5" />,
  orders: <path d="M6 7h12l-1 13H7L6 7Zm3 0V6a3 3 0 0 1 6 0v1" />,
  customers: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M17.5 6a2.4 2.4 0 0 1 0 4.8M18 14.4c2.4.6 4 2.6 4 5.1" />
    </>
  ),
  quotes: <path d="M5 4h14v12H9l-4 4V4Zm4 5h6M9 12h4" />,
  categories: <path d="M3 11.5V5a2 2 0 0 1 2-2h6.5L21 12.5 12.5 21 3 11.5ZM7.5 7.5h.01" />,
  reports: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  images: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5-11 11" />
    </>
  ),
  settings: <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4" />,
  store: <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8 18.4l-3.5 1.1ZM9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a3.5 3.5 0 0 1-1.8-1.8l.8-1-1-2L9 9.5Z" />,
};

function ToolIcon({ tool }: { tool: AdminToolKey }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {TOOL_ICON_PATHS[tool]}
    </svg>
  );
}

function Check({
  checked,
  indeterminate = false,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
}) {
  const on = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors duration-150 ${
        on
          ? "border-[var(--admin-accent)] bg-[var(--admin-accent)] text-white"
          : "border-[#c9ccd1] bg-white hover:border-[var(--admin-accent)]"
      }`}
    >
      {on && (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {indeterminate ? <path d="M6 12h12" /> : <path d="m5 12.5 4.5 4.5L19 7.5" />}
        </svg>
      )}
    </button>
  );
}

const NOT_APPLICABLE = <span className="text-xs text-[#c9ccd1]" aria-hidden="true">—</span>;

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)] disabled:bg-[#fafaf9] disabled:text-[#8b8d91]";

function fitLevel(tool: AdminToolKey, level: AdminAccessLevel): AdminAccessLevel {
  const { levels } = ADMIN_TOOL_OPTIONS[tool];
  return levels.includes(level) ? level : levels[levels.length - 1];
}

export default function AdminUsersPanel({
  division,
  brandLabel,
  notify,
}: {
  division: DivisionName;
  brandLabel: string;
  notify: (tone: "success" | "error", message: string) => void;
}) {
  // Tools offered for a user: those of the units it can enter.
  const toolsFor = (units: DivisionName[]) =>
    ADMIN_TOOL_KEYS.filter((tool) =>
      units.some(
        (unit) => isToolAllowedForDivision(unit, tool) && !(tool === "inventory" && isServiceDivision(unit)),
      ),
    );
  // This unit first, then the rest.
  const unitOptions = [division, ...DIVISIONS.filter((unit) => unit !== division)];
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // null = form closed, "new" = creating, otherwise the id being edited.
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  async function loadUsers() {
    setIsLoading(true);
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const payload = (await response.json().catch(() => ({}))) as { users?: TeamUser[]; error?: string };
    setIsLoading(false);
    if (!response.ok) {
      notify("error", payload.error || "No fue posible cargar los usuarios.");
      return;
    }
    setUsers(payload.users ?? []);
  }

  useEffect(() => {
    void loadUsers();
    // Reload when the master admin switches to another unit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division]);

  const tools = toolsFor(form.units);
  const levelOf = (tool: AdminToolKey): ToolLevel => form.levels[tool] ?? "none";

  const toPermissions = () => {
    const permissions: string[] = [];
    for (const tool of tools) {
      const level = levelOf(tool);
      if (level === "none") continue;
      permissions.push(level === "edit" ? tool : `${tool}:view`);
      for (const extra of ADMIN_TOOL_OPTIONS[tool].extras ?? []) {
        if (form.hiddenExtras.includes(extra.key)) permissions.push(`no:${extra.key}`);
      }
    }
    return [
      ...permissions,
      ...form.units.filter((unit) => unit !== division).map((unit) => `unit:${unit}`),
      ...(form.units.includes(division) ? [] : ["home:off"]),
    ];
  };

  const openNew = () => {
    setForm({ ...EMPTY_FORM, units: [division] });
    setEditing("new");
  };

  const openEdit = (user: TeamUser) => {
    const units = getAdminUnits(division, user.permissions);
    const userTools = toolsFor(units);
    const levels: FormState["levels"] = {};
    for (const tool of userTools) {
      const level = getAdminAccessLevel(user.permissions, tool);
      if (level) levels[tool] = fitLevel(tool, level);
    }
    setForm({
      fullName: user.fullName,
      email: user.email,
      area: user.company ?? "",
      password: "",
      levels,
      hiddenExtras: userTools.flatMap((tool) =>
        (ADMIN_TOOL_OPTIONS[tool].extras ?? [])
          .filter((extra) => !hasAdminExtra(user.permissions, extra.key))
          .map((extra) => extra.key),
      ),
      units,
    });
    setEditing(user.id);
  };

  const enabledCount = tools.filter((tool) => levelOf(tool) !== "none").length;
  const editCount = tools.filter((tool) => levelOf(tool) === "edit").length;
  const activePresetKey = PRESETS.find((preset) =>
    tools.every((tool) => {
      const level = preset.levels[tool];
      return levelOf(tool) === (level ? fitLevel(tool, level) : "none");
    }),
  )?.key;

  const offers = (tool: AdminToolKey, level: AdminAccessLevel) =>
    ADMIN_TOOL_OPTIONS[tool].levels.includes(level);

  // "Editar" implies "Ver": checking Editar grants both, unchecking Ver
  // removes access entirely.
  const toggleView = (tool: AdminToolKey) =>
    setLevel(tool, levelOf(tool) === "none" ? "view" : "none");

  const toggleEdit = (tool: AdminToolKey) =>
    setLevel(tool, levelOf(tool) === "edit" ? (offers(tool, "view") ? "view" : "none") : "edit");

  const setGroupLevels = (groupTools: AdminToolKey[], pick: (tool: AdminToolKey) => ToolLevel) =>
    setForm((current) => ({
      ...current,
      levels: { ...current.levels, ...Object.fromEntries(groupTools.map((tool) => [tool, pick(tool)])) },
    }));

  const setLevel = (tool: AdminToolKey, level: ToolLevel) =>
    setForm((current) => ({ ...current, levels: { ...current.levels, [tool]: level } }));

  const toggleExtra = (extra: AdminExtraKey) =>
    setForm((current) => ({
      ...current,
      hiddenExtras: current.hiddenExtras.includes(extra)
        ? current.hiddenExtras.filter((item) => item !== extra)
        : [...current.hiddenExtras, extra],
    }));

  const toggleUnit = (unit: DivisionName) =>
    setForm((current) => {
      // At least one unit has to stay checked.
      if (current.units.length === 1 && current.units[0] === unit) return current;
      const units = current.units.includes(unit)
        ? current.units.filter((item) => item !== unit)
        : [...current.units, unit];
      // A preset picked before adding a unit should cover the new unit's tools too.
      const preset = PRESETS.find((item) => item.key === activePresetKey);
      return preset
        ? {
            ...current,
            units,
            levels: Object.fromEntries(
              toolsFor(units).map((tool) => {
                const level = preset.levels[tool];
                return [tool, level ? fitLevel(tool, level) : "none"];
              }),
            ),
          }
        : { ...current, units };
    });

  const applyPreset = (preset: (typeof PRESETS)[number]) =>
    setForm((current) => ({
      ...current,
      levels: Object.fromEntries(
        tools.map((tool) => {
          const level = preset.levels[tool];
          return [tool, level ? fitLevel(tool, level) : "none"];
        }),
      ),
      hiddenExtras: [],
    }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const permissions = toPermissions();
    if (!grantsAnyAdminTool(permissions)) {
      notify("error", "Dale acceso al menos a una herramienta.");
      return;
    }
    setIsSaving(true);
    const isNew = editing === "new";
    const response = await fetch(isNew ? "/api/admin/users" : `/api/admin/users/${editing}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isNew
          ? { fullName: form.fullName, email: form.email, area: form.area, password: form.password, permissions }
          : {
              fullName: form.fullName,
              area: form.area,
              permissions,
              ...(form.password ? { password: form.password } : {}),
            },
      ),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setIsSaving(false);
    if (!response.ok) {
      notify("error", payload.error || "No fue posible guardar el usuario.");
      return;
    }
    notify("success", isNew ? "Usuario creado. Ya puede entrar al panel con su correo." : "Usuario actualizado.");
    setEditing(null);
    void loadUsers();
  }

  async function toggleActive(user: TeamUser) {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      notify("error", payload.error || "No fue posible actualizar el usuario.");
      return;
    }
    notify("success", user.active ? "Usuario desactivado." : "Usuario activado.");
    void loadUsers();
  }

  async function removeUser(user: TeamUser) {
    if (!window.confirm(`¿Eliminar a ${user.fullName}? Esta acción no se puede deshacer.`)) return;
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const payload = (await response.json().catch(() => ({}))) as { deleted?: boolean; error?: string };
    if (!response.ok) {
      notify("error", payload.error || "No fue posible eliminar el usuario.");
      return;
    }
    notify(
      "success",
      payload.deleted ? "Usuario eliminado." : "El usuario tiene pedidos o cotizaciones; se desactivó en lugar de eliminarse.",
    );
    if (editing === user.id) setEditing(null);
    void loadUsers();
  }

  return (
    <div className="admin-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#16384f]">Usuarios</h2>
          <p className="mt-1 text-sm text-[#6e7379]">
            Crea cuentas para tu equipo en {brandLabel} y define qué puede ver o modificar cada una.
          </p>
        </div>
        {editing === null && (
          <button
            type="button"
            onClick={openNew}
            className="rounded-full bg-[var(--admin-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--admin-accent-hover)]"
          >
            + Nuevo usuario
          </button>
        )}
      </div>

      {editing !== null && (
        <form
          onSubmit={submit}
          className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-[0_14px_28px_rgba(15,23,42,0.05)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-black/6 px-6 py-4">
            <h3 className="text-lg font-semibold text-[#16384f]">
              {editing === "new" ? "Nuevo usuario" : "Editar usuario"}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#8b8d91] transition-colors duration-200 hover:bg-[#f1f3f5] hover:text-[#16384f]"
              aria-label="Cerrar"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="grid lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="space-y-6 border-b border-black/6 p-6 lg:border-b-0 lg:border-r">
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8d91]">Cuenta</p>
                <label className="block space-y-1.5 text-sm font-semibold text-[#5d6167]">
                  <span>Nombre</span>
                  <input
                    required
                    value={form.fullName}
                    onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1.5 text-sm font-semibold text-[#5d6167]">
                  <span>Área</span>
                  <input
                    value={form.area}
                    onChange={(event) => setForm({ ...form, area: event.target.value })}
                    placeholder="Ej: Diseño, Ventas, Bodega"
                    className={inputClass}
                  />
                  <span className="block text-xs font-normal text-[#8b8d91]">
                    Su panel se llamará &ldquo;{form.area.trim() ? `Panel de ${form.area.trim()}` : "Panel de equipo"}&rdquo;.
                  </span>
                </label>
                <label className="block space-y-1.5 text-sm font-semibold text-[#5d6167]">
                  <span>Correo</span>
                  <input
                    required
                    type="text"
                    inputMode="email"
                    autoComplete="off"
                    disabled={editing !== "new"}
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1.5 text-sm font-semibold text-[#5d6167]">
                  <span>{editing === "new" ? "Contraseña" : "Nueva contraseña"}</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required={editing === "new"}
                    minLength={8}
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder={editing === "new" ? "Mínimo 8 caracteres" : "Déjala vacía para no cambiarla"}
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8d91]">Unidades</p>
                <p className="text-xs text-[#8b8d91]">
                  Marca las unidades que puede manejar; pasa de una a otra con &ldquo;Cambiar de
                  unidad&rdquo;, con los mismos permisos. Se sigue administrando desde {brandLabel}.
                </p>
                <div className="space-y-1">
                  {unitOptions.map((unit) => (
                    <label
                      key={unit}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-150 hover:bg-[#f6f7f8]"
                    >
                      <Check
                        label={DIVISION_BRAND[unit].label}
                        checked={form.units.includes(unit)}
                        onChange={() => toggleUnit(unit)}
                      />
                      <span className="text-sm font-semibold text-[#16384f]">{DIVISION_BRAND[unit].label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8d91]">Plantilla</p>
                <div className="space-y-1">
                  {PRESETS.map((preset) => {
                    const selected = activePresetKey === preset.key;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-150 ${
                          selected ? "bg-[var(--admin-accent-soft)]" : "hover:bg-[#f6f7f8]"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            selected ? "border-[var(--admin-accent)]" : "border-[#c9ccd1]"
                          }`}
                        >
                          {selected && <span className="h-2 w-2 rounded-full bg-[var(--admin-accent)]" />}
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-sm font-semibold ${selected ? "text-[var(--admin-accent)]" : "text-[#16384f]"}`}>
                            {preset.label}
                          </span>
                          <span className="block truncate text-xs text-[#8b8d91]">{preset.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {!activePresetKey && enabledCount > 0 && (
                  <p className="px-3 text-xs text-[#8b8d91]">Permisos personalizados</p>
                )}
              </div>
            </aside>

            <div className="min-w-0 p-6">
              <div className="overflow-hidden rounded-2xl border border-black/8">
                <div className="grid grid-cols-[minmax(0,1fr)_64px_64px] items-center bg-[#fafaf9] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                  <span>Herramienta</span>
                  <span className="text-center">Ver</span>
                  <span className="text-center">Editar</span>
                </div>

                {TOOL_GROUPS.map((group) => {
                  const groupTools = group.tools.filter((tool) => tools.includes(tool));
                  if (groupTools.length === 0) return null;
                  const viewTools = groupTools.filter((tool) => offers(tool, "view"));
                  const editTools = groupTools.filter((tool) => offers(tool, "edit"));
                  const viewOn = viewTools.filter((tool) => levelOf(tool) !== "none").length;
                  const editOn = editTools.filter((tool) => levelOf(tool) === "edit").length;
                  return (
                    <div key={group.label} className="border-t border-black/8">
                      <div className="grid grid-cols-[minmax(0,1fr)_64px_64px] items-center bg-[#fafaf9]/60 px-4 py-2">
                        <span className="text-xs font-semibold text-[#16384f]">{group.label}</span>
                        <span className="flex justify-center">
                          {viewTools.length > 0 && (
                            <Check
                              label={`Ver todo ${group.label}`}
                              checked={viewOn === viewTools.length}
                              indeterminate={viewOn > 0 && viewOn < viewTools.length}
                              onChange={() =>
                                setGroupLevels(groupTools, (tool) =>
                                  viewOn === viewTools.length
                                    ? "none"
                                    : levelOf(tool) === "none" && offers(tool, "view")
                                      ? "view"
                                      : levelOf(tool),
                                )
                              }
                            />
                          )}
                        </span>
                        <span className="flex justify-center">
                          {editTools.length > 0 && (
                            <Check
                              label={`Editar todo ${group.label}`}
                              checked={editOn === editTools.length}
                              indeterminate={editOn > 0 && editOn < editTools.length}
                              onChange={() =>
                                setGroupLevels(groupTools, (tool) =>
                                  !offers(tool, "edit")
                                    ? levelOf(tool)
                                    : editOn === editTools.length
                                      ? offers(tool, "view") ? "view" : "none"
                                      : "edit",
                                )
                              }
                            />
                          )}
                        </span>
                      </div>

                      {groupTools.map((tool) => {
                        const option = ADMIN_TOOL_OPTIONS[tool];
                        const level = levelOf(tool);
                        const enabled = level !== "none";
                        return (
                          <div key={tool} className="border-t border-black/6">
                            <div className="grid grid-cols-[minmax(0,1fr)_64px_64px] items-center px-4 py-3 transition-colors duration-150 hover:bg-[#fafaf9]">
                              <div className="flex min-w-0 items-center gap-3">
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
                                    enabled
                                      ? "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]"
                                      : "bg-[#f1f3f5] text-[#9a9da2]"
                                  }`}
                                >
                                  <ToolIcon tool={tool} />
                                </span>
                                <span className="min-w-0">
                                  <span className={`block text-sm font-semibold ${enabled ? "text-[#16384f]" : "text-[#5d6167]"}`}>
                                    {option.label}
                                  </span>
                                  <span className="block truncate text-xs text-[#8b8d91]">{option.description}</span>
                                </span>
                              </div>
                              <span className="flex justify-center">
                                {offers(tool, "view") ? (
                                  <Check label={`Ver ${option.label}`} checked={enabled} onChange={() => toggleView(tool)} />
                                ) : (
                                  NOT_APPLICABLE
                                )}
                              </span>
                              <span className="flex justify-center">
                                {offers(tool, "edit") ? (
                                  <Check label={`Editar ${option.label}`} checked={level === "edit"} onChange={() => toggleEdit(tool)} />
                                ) : (
                                  NOT_APPLICABLE
                                )}
                              </span>
                            </div>

                            {enabled &&
                              option.extras?.map((extra) => (
                                <div
                                  key={extra.key}
                                  className="grid grid-cols-[minmax(0,1fr)_64px_64px] items-center py-2 pl-[3.75rem] pr-4"
                                >
                                  <span className="flex items-center gap-2 text-xs text-[#5d6167]">
                                    <span className="h-px w-3 bg-[#d5d8dc]" aria-hidden="true" />
                                    {extra.label}
                                  </span>
                                  <span className="flex justify-center">
                                    <Check
                                      label={extra.label}
                                      checked={!form.hiddenExtras.includes(extra.key)}
                                      onChange={() => toggleExtra(extra.key)}
                                    />
                                  </span>
                                  <span />
                                </div>
                              ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-black/6 bg-[#fafaf9] px-6 py-4">
            <p className="mr-auto text-sm text-[#6e7379]">
              {enabledCount === 0 ? (
                "Sin herramientas asignadas"
              ) : (
                <>
                  <span className="font-semibold text-[#16384f]">{enabledCount}</span>{" "}
                  {enabledCount === 1 ? "herramienta" : "herramientas"}
                  {editCount > 0 && (
                    <>
                      {" · "}
                      <span className="font-semibold text-[#16384f]">{editCount}</span> con edición
                    </>
                  )}
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full border border-black/10 bg-white px-6 py-2.5 text-sm font-semibold text-[#5d6167] hover:bg-[#f6f7f8]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-[var(--admin-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--admin-accent-hover)] disabled:opacity-60"
            >
              {isSaving ? "Guardando..." : editing === "new" ? "Crear usuario" : "Guardar cambios"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
        {isLoading && users.length === 0 ? (
          <p className="px-5 py-6 text-sm text-[#6e7379]">Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <p className="px-5 py-6 text-sm text-[#6e7379]">
            Aún no has creado usuarios para {brandLabel}.
          </p>
        ) : (
          <ul className="divide-y divide-black/6">
            {users.map((user) => (
              <li key={user.id} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-[#16384f]">{user.fullName}</span>
                    {user.company && (
                      <span className="shrink-0 text-xs font-medium text-[#8b8d91]">· {user.company}</span>
                    )}
                    {!user.active && (
                      <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        Desactivado
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-[#8b8d91]">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {getAdminUnits(division, user.permissions).length > 1 ||
                    !getAdminUnits(division, user.permissions).includes(division)
                      ? getAdminUnits(division, user.permissions).map((unit) => (
                          <span
                            key={unit}
                            className="rounded-full bg-[var(--admin-accent-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--admin-accent)]"
                          >
                            {DIVISION_BRAND[unit].label}
                          </span>
                        ))
                      : null}
                    {toolsFor(getAdminUnits(division, user.permissions)).map((tool) => {
                      const level = getAdminAccessLevel(user.permissions, tool);
                      if (!level) return null;
                      const isViewOnly = level === "view" && ADMIN_TOOL_OPTIONS[tool].levels.includes("edit");
                      return (
                        <span
                          key={tool}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isViewOnly ? "bg-[#fff8e8] text-[#7a5300]" : "bg-[#f1f3f5] text-[#5d6167]"
                          }`}
                        >
                          {ADMIN_TOOL_OPTIONS[tool].label}
                          {isViewOnly ? " · solo ver" : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(user)}
                    className="rounded-full border border-black/10 px-4 py-1.5 text-xs font-semibold text-[#5d6167] hover:bg-[#fafaf9]"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleActive(user)}
                    className="rounded-full border border-black/10 px-4 py-1.5 text-xs font-semibold text-[#5d6167] hover:bg-[#fafaf9]"
                  >
                    {user.active ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeUser(user)}
                    className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
