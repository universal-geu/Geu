import { getSessionFromCookies } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseStorageClient, getStorageBucket, getSupabaseUrl } from "@/lib/supabase-storage";
import {
  ALLOWED_FILE_TYPES,
  ALLOWED_PDF_TYPES,
  MAX_PDF_SIZE_BYTES,
  getFileExtension,
} from "@/lib/uploads";

// Signed upload URL for a file attached to a technical quote request (plano,
// dibujo or fotos de la muestra). Same flow as the admin product uploads, but
// open to any logged-in customer — the quote form already requires login.
export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return Response.json({ error: "Inicia sesión para adjuntar archivos." }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`quote-attachment:${session.userId}`, { limit: 30, windowMs: 60 * 60 * 1000 });
  if (!rateLimit.allowed) {
    return Response.json({ error: "Subiste demasiados archivos. Intenta más tarde." }, { status: 429 });
  }

  const supabase = createSupabaseStorageClient();
  const supabaseUrl = getSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabase || !supabaseUrl || !anonKey) {
    return Response.json({ error: "La subida de archivos no está configurada." }, { status: 500 });
  }

  const body = (await request.json()) as { fileName?: string; contentType?: string; fileSize?: number };
  const contentType = String(body.contentType || "");
  const fileSize = Number(body.fileSize || 0);

  if (![...ALLOWED_FILE_TYPES, ...ALLOWED_PDF_TYPES].includes(contentType)) {
    return Response.json({ error: "El archivo debe ser PDF, JPG, PNG o WEBP." }, { status: 400 });
  }
  if (fileSize > MAX_PDF_SIZE_BYTES) {
    return Response.json({ error: "El archivo supera el límite de 10 MB." }, { status: 400 });
  }

  const bucket = getStorageBucket();
  const extension = getFileExtension(String(body.fileName || "archivo"));
  const filePath = `cotizaciones/${session.userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(filePath);
  if (error || !data) {
    return Response.json({ error: "No fue posible preparar la subida del archivo." }, { status: 500 });
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return Response.json({
    path: data.path,
    token: data.token,
    bucket,
    supabaseUrl,
    anonKey,
    publicUrl: publicData.publicUrl,
  });
}
