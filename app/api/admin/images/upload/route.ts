import { requireAdminUser } from "@/lib/admin";
import { createSupabaseStorageClient, getStorageBucket } from "@/lib/supabase-storage";
import { IMAGE_SLOTS } from "@/lib/image-slots";
import sharp from "sharp";

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 1920;
const WEBP_QUALITY = 80;
const IMAGE_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_FILE_TYPES = [
  ...IMAGE_FILE_TYPES,
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser("images");
    const supabase = createSupabaseStorageClient();
    if (!supabase) return Response.json({ error: "Storage no configurado." }, { status: 500 });

    const formData = await request.formData();
    const file = formData.get("file");
    const key = String(formData.get("key") || "banner");
    const slot = IMAGE_SLOTS.find((item) => item.key === key);

    if (!slot) {
      return Response.json({ error: "key no válida." }, { status: 400 });
    }

    if (slot.division !== admin.division) {
      return Response.json({ error: "No autorizado para esta división." }, { status: 403 });
    }

    if (!(file instanceof File)) return Response.json({ error: "Archivo requerido." }, { status: 400 });
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return Response.json({ error: "Formato no válido. Usa JPG, PNG, WEBP, MP4, WEBM o MOV." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json({ error: "El archivo supera el límite de 4 MB." }, { status: 400 });
    }

    // Images are compressed here because next/image runs unoptimized (see
    // next.config.ts): whatever lands in storage is exactly what visitors
    // download. Videos are stored as-is.
    let body: File | Buffer = file;
    let contentType = file.type;
    let ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    if (IMAGE_FILE_TYPES.includes(file.type)) {
      body = await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate()
        .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      contentType = "image/webp";
      ext = "webp";
    }

    const filePath = `site-images/${key}-${Date.now()}.${ext}`;
    const bucket = getStorageBucket();

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, body, { contentType, upsert: false });

    if (uploadError) return Response.json({ error: `Error al subir: ${uploadError.message}` }, { status: 500 });

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return Response.json({ publicUrl: data.publicUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
