"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { findLiveTextKeys, stripLiveTextMarkers } from "@/lib/live-text-markers";

type EditableText = {
  key: string;
  label: string;
  group: string;
  multiline: boolean;
  value: string;
};

type Status = "idle" | "saving" | "confirm" | "saved" | "error";

const STORAGE_KEY = "geu-live-text-changes";
const MARKER_EDGE = "⁣";

function normalize(text: string) {
  return stripLiveTextMarkers(text).replace(/\s+/g, " ").trim();
}

function readStoredChanges(): Record<string, string> {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeStoredChanges(changes: Record<string, string>) {
  try {
    if (Object.keys(changes).length) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode): changes just won't survive a reload.
  }
}

// On-page editor for "Editar textos en tiempo real". The server tags every
// editable text with an invisible marker (lib/live-text-markers.ts); this
// finds them, makes them editable in place (or through a small popover when
// the text is split across several elements), and saves everything as drafts
// + publishes from the floating bar at the top.
export default function LiveTextEditor({
  division,
  texts,
}: {
  division: string;
  texts: EditableText[];
}) {
  const pathname = usePathname();
  const textsByKey = useMemo(() => new Map(texts.map((text) => [text.key, text])), [texts]);
  const [changes, setChanges] = useState<Record<string, string>>({});
  const changesRef = useRef(changes);
  const [popover, setPopover] = useState<{ key: string; top: number; left: number; draft: string } | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [otherDraftsCount, setOtherDraftsCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const isAdminPage = pathname?.startsWith("/admin") ?? false;

  const updateChanges = useCallback((next: Record<string, string>) => {
    changesRef.current = next;
    setChanges(next);
    writeStoredChanges(next);
  }, []);

  const setChange = useCallback(
    (key: string, value: string) => {
      const original = textsByKey.get(key)?.value ?? "";
      const next = { ...changesRef.current };
      if (value.trim() === original.trim()) delete next[key];
      else next[key] = value;
      updateChanges(next);
    },
    [textsByKey, updateChanges],
  );

  // Pending edits survive full page reloads within the tab.
  useEffect(() => {
    const stored = readStoredChanges();
    if (Object.keys(stored).length) updateChanges(stored);
  }, [updateChanges]);

  // Find marked texts and make their elements editable.
  useEffect(() => {
    if (isAdminPage) return;

    const scan = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) =>
          (node as Text).data.includes(MARKER_EDGE) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
      });
      const nodes: Text[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Text);

      for (const node of nodes) {
        const element = node.parentElement;
        const key = findLiveTextKeys(node.data)[0];
        const entry = key ? textsByKey.get(key) : undefined;
        if (!element || !entry || element.closest("[data-live-text-ui], script, style, noscript, template, textarea, title")) {
          continue;
        }
        if (element.dataset.liveKey === key) continue;

        element.dataset.liveKey = key;
        const isWholeText =
          element.childElementCount === 0 &&
          !entry.value.includes("\n") &&
          normalize(element.textContent ?? "") === normalize(entry.value);

        if (isWholeText) {
          element.dataset.liveMode = "inline";
          element.contentEditable = "plaintext-only";
          element.spellcheck = false;
          const pending = changesRef.current[key];
          if (pending !== undefined) element.textContent = pending;
        } else {
          element.dataset.liveMode = "popover";
        }
      }

      for (const element of document.querySelectorAll<HTMLElement>("[data-live-key]")) {
        if (changesRef.current[element.dataset.liveKey ?? ""] !== undefined) {
          element.dataset.liveChanged = "true";
        } else {
          delete element.dataset.liveChanged;
        }
      }
    };

    let frame = 0;
    const scheduleScan = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    };

    scan();
    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [isAdminPage, pathname, textsByKey, changes]);

  // Typing, Enter and clicks on editable texts.
  useEffect(() => {
    if (isAdminPage) return;

    const editableFrom = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLElement>("[data-live-key]") : null;

    const handleInput = (event: Event) => {
      const element = editableFrom(event.target);
      if (!element || element.dataset.liveMode !== "inline") return;
      setChange(element.dataset.liveKey!, stripLiveTextMarkers(element.textContent ?? "").trim());
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const element = editableFrom(event.target);
      if (element?.dataset.liveMode === "inline" && (event.key === "Enter" || event.key === "Escape")) {
        event.preventDefault();
        element.blur();
      }
    };

    // Capture phase so links/buttons around a text don't navigate while editing it.
    const handleClick = (event: MouseEvent) => {
      const element = editableFrom(event.target);
      if (!element) {
        if (!(event.target instanceof Element && event.target.closest("[data-live-text-ui]"))) setPopover(null);
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      if (element.dataset.liveMode === "popover") {
        const key = element.dataset.liveKey!;
        const rect = element.getBoundingClientRect();
        const width = Math.min(420, window.innerWidth - 32);
        setPopover({
          key,
          top: Math.min(rect.bottom + 8, window.innerHeight - 260),
          left: Math.max(16, Math.min(rect.left, window.innerWidth - width - 16)),
          draft: changesRef.current[key] ?? textsByKey.get(key)?.value ?? "",
        });
      }
    };

    document.addEventListener("input", handleInput, true);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("input", handleInput, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isAdminPage, setChange, textsByKey]);

  const changeCount = Object.keys(changes).length;

  async function saveAndPublish(confirmed: boolean) {
    setStatus("saving");
    setErrorMessage("");

    try {
      if (!confirmed) {
        for (const [key, value] of Object.entries(changesRef.current)) {
          const response = await fetch("/api/admin/content-drafts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, kind: "text", value }),
          });
          if (!response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { error?: string };
            throw new Error(payload.error || "No fue posible guardar un texto.");
          }
        }

        // Publishing is all-or-nothing per unit: warn before it also pushes
        // drafts someone left pending in the admin (images, colors, texts).
        const draftsResponse = await fetch("/api/admin/content-drafts");
        const draftsPayload = (await draftsResponse.json()) as {
          drafts?: Array<{ key: string; division: string }>;
        };
        const others = (draftsPayload.drafts ?? []).filter(
          (draft) =>
            (draft.division === division || draft.division === "Global") &&
            changesRef.current[draft.key] === undefined,
        );
        if (others.length > 0) {
          setOtherDraftsCount(others.length);
          setStatus("confirm");
          return;
        }
      }

      const publishResponse = await fetch("/api/admin/content-drafts/publish", { method: "POST" });
      if (!publishResponse.ok) {
        const payload = (await publishResponse.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "No fue posible publicar los cambios.");
      }

      updateChanges({});
      setStatus("saved");
      window.setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "No fue posible guardar.");
    }
  }

  function discardChanges() {
    updateChanges({});
    window.location.reload();
  }

  async function exitEditMode() {
    updateChanges({});
    await fetch("/api/admin/live-text-edit", { method: "DELETE" }).catch(() => {});
    window.location.reload();
  }

  if (isAdminPage) return null;

  const popoverEntry = popover ? textsByKey.get(popover.key) : undefined;

  return (
    <>
      <style>{`
        [data-live-key] {
          outline: 1.5px dashed rgba(37, 99, 235, 0.55);
          outline-offset: 3px;
          border-radius: 3px;
          cursor: text;
          transition: background-color 120ms ease, outline-color 120ms ease;
        }
        [data-live-key][data-live-mode="popover"] { cursor: pointer; }
        [data-live-key]:hover, [data-live-key]:focus {
          outline: 2px solid rgb(37, 99, 235);
          background-color: rgba(37, 99, 235, 0.08);
        }
        [data-live-key][data-live-changed] {
          outline: 2px solid rgb(245, 158, 11);
          background-color: rgba(245, 158, 11, 0.1);
        }
      `}</style>

      <div
        data-live-text-ui
        className="fixed left-1/2 top-3 z-[2147483000] w-[min(760px,calc(100vw-24px))] -translate-x-1/2 rounded-2xl border border-black/10 bg-white/95 px-4 py-3 text-[#1f2328] shadow-[0_18px_45px_rgba(15,23,42,0.22)] backdrop-blur"
        style={{ fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}
      >
        {status === "confirm" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              Además hay <strong>{otherDraftsCount}</strong>{" "}
              {otherDraftsCount === 1 ? "cambio pendiente" : "cambios pendientes"} del administrador (imágenes, colores
              o textos) que también se publicarán.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#5d6167] hover:bg-[#f5f5f4]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void saveAndPublish(true)}
                className="rounded-full bg-[#16384f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f2a3b]"
              >
                Publicar todo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#2563eb]" />
                Editando textos en tiempo real
              </p>
              <p className="mt-0.5 text-xs text-[#6e7379]">
                {status === "saved"
                  ? "¡Cambios publicados! Recargando…"
                  : status === "error"
                    ? errorMessage
                    : changeCount > 0
                      ? `${changeCount} ${changeCount === 1 ? "cambio sin guardar" : "cambios sin guardar"} · puedes seguir navegando`
                      : "Haz clic en un texto resaltado para cambiarlo. Puedes navegar por el sitio."}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {changeCount > 0 && (
                <>
                  <button
                    type="button"
                    onClick={discardChanges}
                    disabled={status === "saving"}
                    className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#5d6167] hover:bg-[#f5f5f4] disabled:opacity-50"
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveAndPublish(false)}
                    disabled={status === "saving"}
                    className="rounded-full bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#15803d] disabled:opacity-60"
                  >
                    {status === "saving" ? "Guardando…" : "Guardar y publicar"}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => void exitEditMode()}
                disabled={status === "saving"}
                title={changeCount > 0 ? "Sale del modo edición y descarta los cambios sin guardar" : undefined}
                className="rounded-full px-3 py-2 text-sm font-semibold text-[#8b8d91] hover:text-[#1f2328] disabled:opacity-50"
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </div>

      {popover && popoverEntry && (
        <div
          data-live-text-ui
          className="fixed z-[2147483001] w-[min(420px,calc(100vw-32px))] rounded-2xl border border-black/10 bg-white p-4 text-[#1f2328] shadow-[0_18px_45px_rgba(15,23,42,0.25)]"
          style={{ top: popover.top, left: popover.left, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}
        >
          <p className="text-xs font-semibold text-[#6e7379]">
            {popoverEntry.group} · {popoverEntry.label}
          </p>
          <textarea
            autoFocus
            rows={popoverEntry.multiline || popover.draft.length > 60 ? 4 : 2}
            value={popover.draft}
            onChange={(event) => setPopover({ ...popover, draft: event.target.value })}
            className="mt-2 w-full resize-y rounded-xl border border-black/15 bg-[#fafaf9] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
          />
          <p className="mt-1 text-[11px] text-[#8b8d91]">Este texto se verá actualizado en la página al publicar.</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPopover(null)}
              className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-semibold text-[#5d6167] hover:bg-[#f5f5f4]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                setChange(popover.key, popover.draft.trim());
                setPopover(null);
              }}
              className="rounded-full bg-[#2563eb] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
