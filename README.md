# QueuePulse (Realtime Queue Manager)

Demo full-stack con React + Vite + TypeScript + Tailwind + Supabase.  
Incluye Google Auth, QR generator, QR scanner web y dashboard realtime (postgres_changes).

## 1) Crear proyecto en Supabase
1. Crea un proyecto en Supabase.
2. Ve a **SQL Editor** y ejecuta el archivo `supabase/queuepulse.sql`.
3. En **Database → Replication**, habilita Realtime para `queue_tickets`.
4. En **Authentication → Providers**, habilita **Google**.
5. Agrega tus dominios de redirect:
   - Local: `http://localhost:5173`
   - Producción: tu URL de Vercel/Netlify
6. En **Table Editor → operator_allowlist**, inserta los emails de operadores.

## 2) Variables de entorno
1. Copia `.env.example` a `.env`.
2. Completa:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 3) Correr local
```bash
npm install
npm run dev
```

## 4) Deploy (Vercel/Netlify)
1. Publica el repo.
2. Configura variables de entorno con las mismas keys.
3. Asegura el redirect de Google Auth con la URL final.

## 5) Cómo probar realtime
1. Abre `/dashboard` en una laptop.
2. En el móvil, inicia sesión y crea un ticket en `/client`.
3. En otra pestaña, abre `/operator` y escanea el QR del móvil.
4. Observa el dashboard actualizarse en tiempo real.

## Seguridad / RLS (Opción A)
Este demo usa RLS simple:
- Usuarios autenticados pueden **leer** e **insertar** tickets.
- Solo operadores (email en `operator_allowlist`) pueden **actualizar** tickets.

Para producción, se recomienda reforzar políticas y separar roles.

## Límite de tickets (anti-spam)
El RPC `create_queue_ticket` tiene un límite diario simple por usuario:
- Máximo **3 tickets por día** por `user_id`.
- Si se supera, el RPC devuelve error.

Puedes ajustar el valor en `supabase/queuepulse.sql` (variable `daily_limit`).

## Notas técnicas
- QR generator: `qrcode`
- QR scanner web: `@zxing/browser`
- Realtime: `supabase.channel().on('postgres_changes', ...)`
