"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

type ChatSuggestion = {
  label: string;
  href: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  suggestions?: ChatSuggestion[];
};

const gusAvatarImage = "/geu-energy-gus-avatar.png";
const gusButtonImage = "/geu-energy-gus-boton.png";

const quickPrompts = [
  "Quiero cotizar una granja solar",
  "¿Qué incluye el estudio de viento?",
  "Somos un EPC, ¿qué necesitan de nosotros?",
  "¿Hacen instalación eléctrica completa?",
];

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hola, soy Gus, el asesor técnico de GEU Energy. Cuéntame de tu proyecto: ¿eres desarrollador, EPC, inversionista, o buscas cotizar estructuras para una granja solar?",
};

export default function GusChat({ whatsappHref }: { whatsappHref: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [requestError, setRequestError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async (content: string) => {
    const text = content.trim();

    if (!text || isSending) return;

    const nextUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, nextUserMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setRequestError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          division: "Energy",
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        mode?: "openai" | "local";
        suggestions?: ChatSuggestion[];
      };

      if (!response.ok || !payload.message) {
        setRequestError(payload.error || "No fue posible responder.");
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: payload.message!,
          suggestions: payload.suggestions,
        },
      ]);
    } catch {
      setRequestError("No fue posible responder.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[min(92vw,380px)] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0b0b0b] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
          <div className="border-b border-[#f5a623]/25 bg-[#0b0b0b] px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#f5a623]/40">
                  <Image
                    src={gusAvatarImage}
                    alt="Gus"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    Asistente GEU Energy
                  </p>
                  <h3 className="mt-1 text-[1.4rem] font-semibold leading-[0.95] tracking-[-0.03em] text-white">
                    Habla con Gus
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-[#0b0b0b]"
              >
                Cerrar
              </button>
            </div>
            <div className="mt-4 h-[4px] w-full rounded-full bg-white/10">
              <div className="h-full w-20 rounded-full bg-[#f5a623]" />
            </div>
          </div>

          <div className="bg-[#050505] px-4 py-4">
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" ? (
                    <div className="flex max-w-[92%] items-start gap-3">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#f5a623]/30">
                        <Image
                          src={gusAvatarImage}
                          alt="Gus"
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/90">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f5a623]">
                          Gus
                        </p>
                        <p className="whitespace-pre-line">{message.content}</p>
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion) => (
                              <Link
                                key={`${message.id}-${suggestion.href}`}
                                href={suggestion.href}
                                className="whitespace-nowrap rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1.5 text-xs font-semibold text-[#f5a623] transition-colors duration-200 hover:bg-[#f5a623] hover:text-[#0b0b0b]"
                              >
                                {suggestion.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[88%] rounded-[1.25rem] bg-[#f5a623] px-4 py-3 text-sm leading-6 text-[#1a1200] shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
                      <p className="whitespace-pre-line">{message.content}</p>
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60">
                    Gus está escribiendo...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="mt-4 flex flex-col items-start gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition-colors duration-200 hover:border-[#f5a623] hover:text-[#f5a623]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {requestError && (
              <p className="mt-4 rounded-2xl border border-[#f5a623]/25 bg-[#f5a623]/10 px-4 py-3 text-sm text-[#f5a623]">
                {requestError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={2}
                placeholder="Escribe tu pregunta sobre tu proyecto solar..."
                className="min-h-[54px] flex-1 resize-none rounded-[1.2rem] border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors duration-200 placeholder:text-white/40 focus:border-[#f5a623]"
              />
              <button
                type="submit"
                disabled={isSending || input.trim().length === 0}
                className="rounded-[1.1rem] bg-[#f5a623] px-4 py-3 text-sm font-semibold text-[#1a1200] transition-colors duration-200 hover:bg-[#ffb945] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Enviar
              </button>
            </form>

            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center text-xs font-semibold text-white/40 underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-white/70"
              >
                Prefiero continuar por WhatsApp
              </a>
            )}
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="w-28 overflow-hidden rounded-full shadow-lg shadow-black/50 md:w-32">
          <Image
            src={gusAvatarImage}
            alt="Gus, el asistente virtual de GEU Energy"
            width={300}
            height={300}
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Cerrar chat con Gus" : "Hablar con Gus"}
        className="w-56 transition-transform duration-200 hover:scale-[1.03] md:w-64"
      >
        {isOpen ? (
          <span className="block rounded-full border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white">
            Cerrar chat
          </span>
        ) : (
          <Image
            src={gusButtonImage}
            alt="Hablar con Gus"
            width={1522}
            height={368}
            className="h-auto w-full object-contain"
          />
        )}
      </button>
    </div>
  );
}
