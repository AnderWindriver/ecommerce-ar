import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js'

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

  // 1. Validación de formato básico de correo
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(correo)) {
    return {
      data: null,
      error: new Error("Ingresá un correo electrónico válido."),
    };
  }

  // 2. LISTA BLANCA: Permitir únicamente dominios populares y confiables
  const dominiosPermitidos = [
    "gmail.com",
    "hotmail.com",
    "outlook.com",
    "yahoo.com",
    "icloud.com",
    "live.com",
    "hotmail.es",
    "yahoo.es"
  ];

  const partesCorreo = correo.split("@");
  const dominio = partesCorreo[1];

  if (!dominiosPermitidos.includes(dominio)) {
    return {
      data: null,
      error: new Error("Por favor, utilizá un correo de un proveedor común (ej: Gmail, Outlook, Hotmail)."),
    };
  }

  // 3. Validación de contraseña mínima de 8 caracteres
  if (password.length < 8) {
    return {
      data: null,
      error: new Error("La contraseña debe tener al menos 8 caracteres."),
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

  //Interceptamos y traemos un mensaje más amigable al usuario según el error recibido.
  if (error) {
    let mensajeAmigable = "No se pudo iniciar sesión. Intentá nuevamente.";

    if (error.message.includes("Invalid login credentials")) {
      mensajeAmigable = "Correo o contraseña incorrectos.";
    } else if (error.message.includes("Email not confirmed")) {
      mensajeAmigable = "Por favor, verificá tu bandeja de entrada y confirmá tu correo antes de iniciar sesión.";
    }

    return { data: null, error: new Error(mensajeAmigable) };
  }

  // Si el inicio de sesión fue exitoso, aseguramos que su perfil exista en 'public.usuarios'
  if (data?.user) {
    const usuario = data.user;
    const { error: perfilError } = await supabase
      .from('usuarios')
      .upsert({
        id_usuario: usuario.id,
        email: usuario.email,
        nombre: usuario.user_metadata?.nombre || 'Usuario'
      }, { onConflict: 'id_usuario' });

    if (perfilError) {
      console.error('❌ Error al sincronizar el perfil del usuario:', perfilError.message);
    }
  }

  return { data, error };
}
// Cerrar la sesión actual.
export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Solicitar enlace de recuperación de contraseña vía email
export async function solicitarRecuperacion(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:3000/restablecer-password', // URL de tu frontend a la que llegará el usuario
  });

  return { data, error };
}

// Actualizar la clave (se llama estando en la sesión de restablecimiento)
export async function actualizarPassword(nuevaPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: nuevaPassword,
  });

  return { data, error };
}

//Recuperar contraseña mediante correo electrónico.
export async function recuperarContrasena(email) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/html/login.html`,
  });
}
