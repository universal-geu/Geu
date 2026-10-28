const ERRORS: Record<string, [number, string]> = {
  UNAUTHORIZED: [401, "No autorizado."],
  FORBIDDEN: [403, "Los usuarios se gestionan desde el panel de GEU con la cuenta principal."],
  INVALID_INPUT: [400, "Revisa el nombre y el correo."],
  WEAK_PASSWORD: [400, "La contraseña debe tener al menos 8 caracteres."],
  NO_PERMISSIONS: [400, "Elige al menos una herramienta para el usuario."],
  EMAIL_ALREADY_EXISTS: [409, "Ya existe una cuenta con ese correo."],
  NOT_FOUND: [404, "No encontramos ese usuario."],
  DATABASE_NOT_CONFIGURED: [500, "La base de datos no está configurada todavía."],
};

export function adminUsersErrorResponse(error: unknown, fallback: string) {
  const code = error instanceof Error ? error.message : "";
  const [status, message] = ERRORS[code] ?? [500, fallback];
  return Response.json({ error: message }, { status });
}
