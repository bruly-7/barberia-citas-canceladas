// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan las credenciales de Supabase en .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente con permisos totales (solo para servidor)
export const supabaseAdmin = () => {
  if (typeof window !== "undefined") {
    throw new Error("supabaseAdmin solo se puede usar en el servidor");
  }
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
};
