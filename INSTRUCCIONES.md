# Sistema de Citas Canceladas — Prototipo Barbería

## 🚀 Instalación rápida (5 minutos)

### 1️⃣ Crear carpeta y proyecto en VS Code

```bash
mkdir barberia-citas-canceladas
cd barberia-citas-canceladas
npx create-next-app@latest . --typescript false --tailwind --no-src-dir
```

Responde con valores por defecto (Enter a todo).

### 2️⃣ Copiar los archivos que te he pasado

En tu proyecto (`barberia-citas-canceladas`), copia:

| Archivo | Destino |
|---------|---------|
| `01_package.json` | Reemplaza el `package.json` actual |
| `02_env.example` | Renómbralo a `.env.local` |
| `03_schema.sql` | Guárdalo (lo usarás en Supabase) |
| `04_lib_supabase.js` | Copia a `lib/supabase.js` |
| `05_app_page.jsx` | Copia a `app/page.jsx` |
| `06_api_cancel_route.js` | Copia a `app/api/cancel/route.js` |
| `07_seed.sql` | Guárdalo (lo usarás en Supabase) |

### 3️⃣ Instalar dependencias

```bash
npm install
```

### 4️⃣ Configurar Supabase

**A. Crear proyecto en Supabase:**
- Ve a https://app.supabase.com
- Haz clic en "New Project"
- Elige un nombre (ej: `barberia-demo`)
- Copia las credenciales:
  - `NEXT_PUBLIC_SUPABASE_URL` (debajo de "API URL")
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (debajo de "anon public")
  - `SUPABASE_SERVICE_ROLE_KEY` (en Settings > API)

**B. Crear tablas:**
- Ve a SQL Editor > New Query
- Copia todo el contenido de `03_schema.sql` y pégalo
- Ejecuta (botón Play)

**C. Cargar datos de prueba:**
- Ve a SQL Editor > New Query
- Copia todo el contenido de `07_seed.sql` y pégalo
- Ejecuta

**D. Pegar credenciales en `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 5️⃣ Probar localmente

```bash
npm run dev
```

Abre http://localhost:3000 — deberías ver la agenda con 10 citas de prueba.

**Prueba:**
- Haz clic en la ✕ de cualquier cita confirmada
- Observa cómo:
  1. Se marca como "cancelada"
  2. Busca en la lista de espera
  3. Manda el WhatsApp simulado
  4. Refilla el hueco
  5. Sube el contador de €€ recuperados

---

## 📤 Desplegar en Vercel (2 minutos)

### 1️⃣ Subir a GitHub

```bash
git init
git add .
git commit -m "First commit: barberia app"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/barberia-citas-canceladas.git
git push -u origin main
```

(Reemplaza TU_USUARIO con tu usuario de GitHub)

### 2️⃣ Desplegar en Vercel

- Ve a https://vercel.com
- Haz clic en "Import Project"
- Selecciona el repositorio `barberia-citas-canceladas`
- Vercel auto-detecta Next.js
- **Antes de deployar**, añade las variables de entorno:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Haz clic en "Deploy"

**Listo:** Tu app estará en `https://barberia-citas-canceladas.vercel.app` (o similar)

---

## 📹 Para tu primera publicación en damii_builds

**Guión de video (2-3 minutos):**

1. **Intro (20s):** "Esto es lo que pasa cuando un cliente cancela una cita a última hora en una barbería que todavía gestiona citas por teléfono"
2. **Problema (40s):** Enseña la agenda con una cita cancelada → explica que es dinero que se pierde
3. **Solución (60s):** Cancela una cita en la app → muestra cómo automáticamente:
   - Busca en la lista de espera
   - Avisa por WhatsApp
   - Refilla el hueco
   - Actualiza las estadísticas
4. **Cierre (20s):** "Este es el tipo de automatización que construyo para negocios locales. ¿Problemas similares en tu barbería? Escríbeme."

---

## 🛠️ Stack técnico

- **Frontend:** Next.js 14 + React 18
- **BD:** Supabase (PostgreSQL)
- **Auth:** Public (RLS habilitado, pero permitido para demo)
- **Deploy:** Vercel
- **Notificaciones:** WhatsApp (simulado con enlace)

---

## ⚠️ Notas importantes

- **No es production-ready:** Es un prototipo para demostración y validación
- **El WhatsApp es un enlace:** No es API real (eso requiere Business Account)
- **RLS está permitido:** Es demo pública, pero en producción usarías auth real
- **Emails (Resend):** Opcional — si lo quieres, crea cuenta en https://resend.com

---

## 📧 Siguiente paso

Una vez desplegado en Vercel, tienes el enlace público para:
1. Grabar videos (el prototipo funcionando)
2. Compartir con barberías locales
3. Incluir en tu bio de `damii_builds`

¿Preguntas? Escribe. 🚀
