-- Agregar nuevas columnas a la tabla applications
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS impressive_achievement TEXT;

-- Crear bucket para hojas de vida (ejecutar en Storage de Supabase)
-- Ve a Storage > New Bucket y crea uno llamado "resumes" con acceso público
