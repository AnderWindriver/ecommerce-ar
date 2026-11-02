import { registrarUsuario, iniciarSesion, recuperarContrasena, supabase } from "./login.js";

const formularioLogin = document.querySelector("#form-login");
const formularioRegistro = document.querySelector("#form-registro");
const formularioNuevaPassword = document.querySelector("#form-nueva-password");
const pestanaLogin = document.querySelector("#pestana-login");
const pestanaRegistro = document.querySelector("#pestana-registro");
const mensaje = document.querySelector("#cuenta-mensaje");
const contenedorPestanas = document.querySelector(".cuenta-pestanas");
const subtituloCuenta = document.querySelector(".cuenta-subtitulo");
const enlaceOlvidePass = document.querySelector("#enlace-olvide-pass");

function mostrarMensaje(texto, tipo = "info") {
  if (!mensaje) return;
  mensaje.textContent = texto;
  mensaje.style.color = tipo === "error" ? "#a61b1b" : "#245b36";
  mensaje.style.backgroundColor = tipo === "error" ? "#fdeaea" : "#e9f7ed";
}

function cambiarFormulario(modo) {
  const mostrarLogin = modo === "login";

  if (formularioLogin) formularioLogin.hidden = !mostrarLogin;
  if (formularioRegistro) formularioRegistro.hidden = mostrarLogin;

  if (pestanaLogin) pestanaLogin.setAttribute("aria-selected", String(mostrarLogin));
  if (pestanaRegistro) pestanaRegistro.setAttribute("aria-selected", String(!mostrarLogin));

  if (mensaje) mensaje.textContent = "";
}

if (pestanaLogin) {
  pestanaLogin.addEventListener("click", () => {
    cambiarFormulario("login");
  });
}

if (pestanaRegistro) {
  pestanaRegistro.addEventListener("click", () => {
    cambiarFormulario("registro");
  });
}

// --- LÓGICA DE MOSTRAR / OCULTAR CONTRASEÑA ---
function configurarTogglePassword(inputId, btnId) {
  const input = document.querySelector(inputId);
  const btn = document.querySelector(btnId);
  
  if (!input || !btn) return;

  btn.addEventListener("click", () => {
    const esPassword = input.type === "password";
    input.type = esPassword ? "text" : "password";

    const svgIcon = btn.querySelector(".icono-ojo");
    if (svgIcon) {
      if (esPassword) {
        // Ojo abierto
        svgIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        `;
        btn.setAttribute("aria-label", "Ocultar contraseña");
      } else {
        // Ojo cerrado con barra
        svgIcon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
        btn.setAttribute("aria-label", "Mostrar contraseña");
      }
    }
  });
}

// Inicializamos los toggles para cada campo de contraseña
configurarTogglePassword("#login-password", "#btn-toggle-login-password");
configurarTogglePassword("#registro-password", "#btn-toggle-registro-password");
configurarTogglePassword("#nueva-password", "#btn-toggle-nueva-password");

// --- INTERCEPTAR EL EVENTO DE RECUPERACIÓN (CUANDO VUELVE DEL CORREO) ---
if (supabase) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      if (contenedorPestanas) contenedorPestanas.hidden = true;
      if (formularioLogin) formularioLogin.hidden = true;
      if (formularioRegistro) formularioRegistro.hidden = true;
      if (formularioNuevaPassword) formularioNuevaPassword.hidden = false;
      if (subtituloCuenta) subtituloCuenta.textContent = "Establecé tu nueva clave de acceso.";

      mostrarMensaje("Por favor, ingresá tu nueva contraseña.", "info");
    }
  });
}

// --- SOLICITAR CORREO DE RECUPERACIÓN ---
if (enlaceOlvidePass) {
  enlaceOlvidePass.addEventListener("click", async (e) => {
    e.preventDefault();
    const emailInput = document.querySelector("#login-email");
    const email = emailInput?.value.trim();

    if (!email) {
      mostrarMensaje("Por favor, ingresá tu correo electrónico en el campo de arriba para recuperar la contraseña.", "error");
      emailInput?.focus();
      return;
    }

    mostrarMensaje("Enviando enlace de recuperación...", "info");

    const { error } = await recuperarContrasena(email.toLowerCase());

    if (error) {
      mostrarMensaje("No se pudo enviar el correo de recuperación. Verificá que sea correcto.", "error");
    } else {
      mostrarMensaje("¡Listo! Revisá tu bandeja de entrada para restablecer tu contraseña.", "success");
    }
  });
}

// --- SUBMIT NUEVA CONTRASEÑA ---
if (formularioNuevaPassword) {
  formularioNuevaPassword.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!formularioNuevaPassword.reportValidity()) return;

    const boton = formularioNuevaPassword.querySelector('button[type="submit"]');
    const nuevaPassword = formularioNuevaPassword.elements.password.value;

    if (nuevaPassword.length < 8) {
      mostrarMensaje("La contraseña debe tener al menos 8 caracteres.", "error");
      return;
    }

    boton.disabled = true;
    boton.textContent = "Actualizando...";

    try {
      const { error } = await supabase.auth.updateUser({
        password: nuevaPassword
      });

      if (error) throw error;

      mostrarMensaje("¡Contraseña actualizada con éxito! Redirigiendo a la tienda...", "info");
      
      setTimeout(() => {
        window.location.assign("/");
      }, 2000);

    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      mostrarMensaje("No se pudo actualizar la contraseña. Intentá nuevamente.", "error");
      boton.disabled = false;
      boton.textContent = "Actualizar contraseña";
    }
  });
}

// --- SUBMIT LOGIN ---
if (formularioLogin) {
  formularioLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!formularioLogin.reportValidity()) return;

    const boton = formularioLogin.querySelector('button[type="submit"]');
    const email = formularioLogin.elements.email.value;
    const password = formularioLogin.elements.password.value;

    boton.disabled = true;
    boton.textContent = "Ingresando...";

    try {
      const { data, error } = await iniciarSesion(email, password);

      if (error) throw error;

      if (!data.session) {
        throw new Error("No se pudo iniciar la sesión. Intentá nuevamente.");
      }

      mostrarMensaje("¡Bienvenido! Redirigiendo a la tienda...");
      window.location.assign("/");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      mostrarMensaje(
        "No se pudo iniciar sesión. Revisá el correo y la contraseña.",
        "error",
      );
    } finally {
      boton.disabled = false;
      boton.textContent = "Iniciar sesión";
    }
  });
}

// --- SUBMIT REGISTRO ---
if (formularioRegistro) {
  formularioRegistro.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!formularioRegistro.reportValidity()) return;

    const boton = formularioRegistro.querySelector('button[type="submit"]');
    const nombre = formularioRegistro.elements.nombre.value.trim();
    const email = formularioRegistro.elements.email.value;
    const password = formularioRegistro.elements.password.value;

    boton.disabled = true;
    boton.textContent = "Creando cuenta...";

    try {
      const { data, error } = await registrarUsuario(email, password, nombre);

      if (error) throw error;

      if (data.session) {
        mostrarMensaje("¡Cuenta creada! Redirigiendo a la tienda...");
        window.location.assign("/");
      } else {
        mostrarMensaje(
          "Cuenta registrada. Revisá tu correo para confirmar la dirección antes de iniciar sesión.",
        );
      }

      formularioRegistro.reset();
    } catch (error) {
      console.error("Error al registrar usuario:", error);

      let texto = error.message || "No se pudo crear la cuenta. Revisá los datos e intentá nuevamente.";

      if (error.message?.toLowerCase().includes("already registered")) {
        texto = "Ese correo ya está registrado. Probá iniciar sesión.";
      }

      mostrarMensaje(texto, "error");
    } finally {
      boton.disabled = false;
      boton.textContent = "Crear cuenta";
    }
  });
}
