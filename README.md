# Dosmicos Hiring - Marketing Internship Application

Página web para que candidatos a prácticas de marketing completen una prueba creativa.

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve al SQL Editor y ejecuta el contenido de `supabase-schema.sql`
3. Copia tus credenciales desde Settings > API

### 3. Configurar variables de entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Deploy en Vercel

### Opción 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Opción 2: GitHub + Vercel

1. Sube el proyecto a GitHub
2. Importa en [vercel.com/new](https://vercel.com/new)
3. Agrega las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Configurar dominio personalizado

1. En Vercel, ve a Settings > Domains
2. Agrega `hiring.dosmicos.com`
3. Configura el DNS en tu proveedor

## Estructura del proyecto

```
├── src/
│   ├── app/
│   │   ├── globals.css      # Estilos globales + animaciones
│   │   ├── layout.tsx       # Layout principal
│   │   └── page.tsx         # Página principal del formulario
│   ├── components/
│   │   ├── FormStep1.tsx    # Datos del candidato
│   │   ├── FormStep2.tsx    # Diagnóstico rápido
│   │   ├── FormStep3.tsx    # Concepto de campaña
│   │   ├── FormStep4.tsx    # Pregunta abierta
│   │   ├── ProgressBar.tsx  # Barra de progreso
│   │   ├── SuccessScreen.tsx # Pantalla de éxito
│   │   ├── FloatingParticles.tsx # Animación de fondo
│   │   └── StatsDisplay.tsx # Estadísticas de crecimiento
│   └── lib/
│       └── supabase.ts      # Cliente de Supabase
├── public/
│   └── logo_dosmicos.png    # Logo de la marca
├── supabase-schema.sql      # SQL para crear la tabla
└── .env.local.example       # Ejemplo de variables de entorno
```

## Características

- Formulario multi-paso con validación
- Animaciones fluidas con Framer Motion
- Diseño responsive (mobile-first)
- Paleta de colores: coral, mint, crema, amarillo
- Integración con Supabase para guardar respuestas
- Pantalla de éxito con confetti
