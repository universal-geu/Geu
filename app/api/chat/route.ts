import OpenAI from "openai";
import { buildStructureLocalReply, STRUCTURE_SYSTEM_PROMPT } from "@/lib/structure-assistant";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

const MAX_MESSAGE_LENGTH = 2000;

function sanitizeMessages(messages: unknown): IncomingMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter(
      (message): message is IncomingMessage =>
        Boolean(
          message &&
            typeof message === "object" &&
            "role" in message &&
            "content" in message &&
            (message as IncomingMessage).role &&
            typeof (message as IncomingMessage).content === "string",
        ),
    )
    .map((message): IncomingMessage => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-8);
}

// Assistant behind Gus, the GEU Structure mascot (app/structure/gus-widget.tsx).
export async function POST(request: Request) {
  // Public endpoint that can call OpenAI — cap it per IP so it can't be
  // looped into a large bill.
  const rateLimit = checkRateLimit(`chat:${getClientIp(request)}`, { limit: 40, windowMs: 10 * 60 * 1000 });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Enviaste muchos mensajes seguidos. Intenta de nuevo en unos minutos." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  try {
    const body = (await request.json()) as {
      messages?: IncomingMessage[];
    };

    const messages = sanitizeMessages(body.messages);
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");

    if (!latestUserMessage) {
      return Response.json(
        { error: "Envía una pregunta para que el asistente pueda ayudarte." },
        { status: 400 },
      );
    }

    const fallback = buildStructureLocalReply(latestUserMessage.content);

    if (!openai) {
      return Response.json({
        message: fallback.message,
        suggestions: fallback.suggestions,
        mode: "local",
      });
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      instructions: STRUCTURE_SYSTEM_PROMPT,
      input: messages.map((message) => ({
        role: message.role,
        content: [
          {
            type: "input_text",
            text: message.content,
          },
        ],
      })),
    });

    const message = response.output_text?.trim() || fallback.message;

    return Response.json({
      message,
      suggestions: fallback.suggestions,
      mode: "openai",
    });
  } catch {
    return Response.json(
      {
        error: "No fue posible responder en este momento.",
      },
      { status: 500 },
    );
  }
}
