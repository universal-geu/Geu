# GEU

Proyecto `Next.js 16` para la plataforma de GEU, separado de `Unipars` pero reutilizando una base funcional similar.

## Base de datos propia para GEU

Este proyecto ya quedó preparado para usar una base de datos independiente.

### 1. Crear archivo de entorno

Copia `.env.example` a `.env.local` y completa al menos:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/geu"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/geu"
APP_SESSION_SECRET="un-secreto-largo-y-seguro"
ADMIN_EXTRA_PIN="1234"
```

Si usarás Supabase Storage o OpenAI, completa también las demás variables.

### 2. Crear la nueva base

Crea una base exclusiva para GEU, por ejemplo:

- nombre sugerido: `geu`

### 3. Generar y aplicar esquema

```bash
npm install
npm run db:generate
npm run db:push
```

### 4. Sembrar datos iniciales

```bash
npm run db:seed
```

El seed crea:

- usuario admin: `admin@geu.com.co`
- clave inicial: `123456789`

## Desarrollo

```bash
npm run dev -- --port 3001
```

Abrir:

- [http://localhost:3001](http://localhost:3001)

## Nota

`GEU` y `Unipars` deben usar bases separadas para no mezclar:

- usuarios
- productos
- pedidos
- inventario
- configuración comercial
