export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_PDF_TYPES = ["application/pdf"];

export function getFileExtension(fileName: string) {
  const cleanName = fileName.toLowerCase();
  const parts = cleanName.split(".");
  return parts.length > 1 ? parts.at(-1) || "jpg" : "jpg";
}
