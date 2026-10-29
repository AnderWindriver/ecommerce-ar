import { createClient } from '@supabase/supabase-js'

// Variables de entorno de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// --- SCRUM-15: REGISTRO DE USUARIO ---
export async function registrarUsuario(email, password, nombre) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre } // Esto dispara el Trigger de PostgreSQL en Supabase
    }
  })
  return { data, error }
}

// --- SCRUM-17: INICIO DE SESIÓN ---
export async function iniciarSesion(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// --- SCRUM-17: CIERRE DE SESIÓN ---
export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut()
  return { error }
}