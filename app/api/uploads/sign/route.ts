import { getStorageBucket, createSupabaseStorageClient, getSupabaseUrl } from "@/lib/supabase-storage";
import { slugify } from "@/app/data/catalog";
import { requireAdminUser } from "@/lib/admin";
import {
  ALLOWED_FILE_TYPES,
  ALLOWED_PDF_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_PDF_SIZE_BYTES,
  getFileExtension,
} from "@/lib/uploads";

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const supabase = createSupabaseStorageClient();
    const supabaseUrl = getSupabaseUrl();

    if (!supabase || !supabaseUrl) {
      return Response.json(
        {
          error:
            "Falta configurar NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para usar Storage.",
        },
        { status: 500 },
      );
    }

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!anonKey) {
      return Response.json(
        { error: "Falta configurar NEXT_PUBLIC_SUPABASE_ANON_KEY para usar Storage." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      fileName?: string;
      productName?: string;
      contentType?: string;
      fileSize?: number;
    };

    const fileName = String(body.fileName || "archivo");
    const productName = String(body.productName || "producto");
    const contentType = String(body.contentType || "");
    const fileSize = Number(body.fileSize || 0);

    const isPdf = ALLOWED_PDF_TYPES.includes(contentType);

    if (!isPdf && !ALLOWED_FILE_TYPES.includes(contentType)) {
      return Response.json(
        { error: "El archivo debe estar en formato JPG, PNG, WEBP o PDF." },
        { status: 400 },
      );
    }

    const maxSize = isPdf ? MAX_PDF_SIZE_BYTES : MAX_FILE_SIZE_BYTES;
    if (fileSize > maxSize) {
      return Response.json(
        { error: isPdf ? "El PDF supera el límite de 10 MB." : "La imagen supera el límite de 4 MB." },
        { status: 400 },
      );
    }

    const bucket = getStorageBucket();
    const extension = getFileExtension(fileName);
    const folder = isPdf ? "fichas-tecnicas" : "products";
    const filePath = `${folder}/${Date.now()}-${slugify(productName)}.${extension}`;

    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(filePath);

    if (error || !data) {
      return Response.json(
        { error: `No fue posible preparar la subida: ${error?.message || "error desconocido"}` },
        { status: 500 },
      );
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
  } catch (error) {
    const message =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? "No autorizado."
        : error instanceof Error ? error.message : "No fue posible preparar la subida.";

    const status =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? 401
        : 500;

    return Response.json({ error: message }, { status });
  }
}
