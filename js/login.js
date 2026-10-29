import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase mediante variables de entorno de Vite.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("[Supabase] URL cargada:", Boolean(SUPABASE_URL));
console.log("[Supabase] Clave pública cargada:", Boolean(SUPABASE_KEY));

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Falta configurar VITE_SUPABASE_URL o la clave pública de Supabase en .env",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// Registrar una nueva cuenta.
export async function registrarUsuario(email, password, nombre) {
  const correo = email?.trim().toLowerCase();
  const nombreUsuario = nombre?.trim();

  if (!correo || !password || !nombreUsuario) {
    return {
      data: null,
      error: new Error("Completá el nombre, el correo y la contraseña."),
    };
  }

  if (password.length < 6) {
    return {
      data: null,
      error: new Error("La contraseña debe tener al menos 6 caracteres."),
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password,
    options: {
      data: {
        nombre: nombreUsuario,
      },
    },
  });

  return { data, error };
}

// Iniciar sesión con una cuenta existente.
export async function iniciarSesion(email, password) {
  const correo = email?.trim().toLowerCase();

  if (!correo || !password) {
    return {
      data: null,
      error: new Error("Ingresá tu correo y contraseña."),
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password,
  });

  return { data, error };
}

// Cerrar la sesión actual.
export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();

  return { error };
}

// Consultar si hay una sesión activa.
export async function obtenerSesion() {
  const { data, error } = await supabase.auth.getSession();

  return {
    sesion: data?.session ?? null,
    error,
  };
}

// Escuchar cambios de sesión.
export function escucharCambiosSesion(callback) {
  const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
    callback(sesion);
  });

  return data.subscription;
}
