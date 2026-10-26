# GEU

Plataforma web del Grupo Empresarial Universal (Next.js 16 + Prisma + Postgres). Un solo proyecto atiende a todas las unidades:

| Unidad | Dominio | Ruta en el proyecto |
|---|---|---|
| Grupo GEU y Universal de Cauchos | geu-universal.com | `/`, `/cauchos` |
| GEU Import | geuimport.com | `/import` |
| GEU Plastic | geuplastic.com | `/plastic` |
| GEU Energy | geuenergy.com | `/energy` |
| GEU Structure | geustructure.com | `/structure` |

En cada dominio de unidad, `/` muestra su página y las rutas de las demás unidades redirigen a su dominio. La configuración está en `next.config.ts` (`DIVISION_DOMAINS`). En local y en los Preview de Vercel todo se navega por rutas (`/import`, `/structure`, …).

## Puesta en marcha

### 1. Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores. Mínimo para arrancar:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/geu"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/geu"
APP_SESSION_SECRET="un-secreto-largo-y-aleatorio"
```

Opcionales según la función:

- **Imágenes y archivos:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`
- **Correos** (pedidos, cotizaciones, restablecer contraseña): `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- **Pagos con Wompi:** `WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`. La URL de eventos en el panel de Wompi es `https://geu-universal.com/api/wompi/events` y sirve para todos los dominios.
- **Asistente de chat:** `OPENAI_API_KEY`, `OPENAI_CHAT_MODEL`
- **Enlaces en correos:** `APP_BASE_URL` (si no se define, se usa el dominio de producción de Vercel)

Nunca subas `.env.local` ni pegues claves en este README.

### 2. Base de datos

```bash
npm install
npm run db:generate
npm run db:push
```

### 3. Datos iniciales

```bash
ADMIN_SEED_PASSWORD="una-clave-de-12-o-mas-caracteres" npm run db:seed
```

El seed crea las cuentas de administrador de cada unidad con esa clave. Si ya existen, no cambia su contraseña.

Solo la cuenta maestra (`MASTER_ADMIN_EMAIL` en `lib/divisions.ts`) inicia sesión en `/admin`. Desde ella se pasa a las demás unidades con "Cambiar de unidad".

Para cambiar contraseñas de administradores:

```bash
npx tsx scripts/set-admin-password.ts            # todas, claves aleatorias
npx tsx scripts/set-admin-password.ts <correo>   # solo una cuenta
```

El script muestra las claves nuevas una sola vez. Entrégalas por un canal privado.

## Desarrollo

```bash
npm run dev -- --port 3002
```

Abre http://localhost:3002. Si `.env.local` apunta a la base de producción, los cambios que hagas en local (pedidos, productos, contenido del admin) son reales.

Pagos en local: sin las variables de Wompi el checkout usa el pago simulado (código `SIMULATED_PAYMENT_CODE`, por defecto `1234`). En producción el pago simulado está desactivado.

## Despliegue

El repositorio está conectado a Vercel (proyecto `geu`). Cada push crea un deploy de Preview. Para publicar, promueve ese Preview a producción desde el panel de Vercel ("Promote to Production") o ejecuta:

```bash
npx vercel@latest deploy --prod --yes
```

## Nota

GEU y Unipars usan bases de datos separadas para no mezclar usuarios, productos, pedidos, inventario ni configuración comercial.
