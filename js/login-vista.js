import { registrarUsuario, iniciarSesion } from "./login.js";

const formularioLogin = document.querySelector("#form-login");
const formularioRegistro = document.querySelector("#form-registro");
const pestanaLogin = document.querySelector("#pestana-login");
const pestanaRegistro = document.querySelector("#pestana-registro");
const mensaje = document.querySelector("#cuenta-mensaje");

function mostrarMensaje(texto, tipo = "info") {
  mensaje.textContent = texto;
  mensaje.style.color = tipo === "error" ? "#a61b1b" : "#245b36";
  mensaje.style.backgroundColor = tipo === "error" ? "#fdeaea" : "#e9f7ed";
}

function cambiarFormulario(modo) {
  const mostrarLogin = modo === "login";

  formularioLogin.hidden = !mostrarLogin;
  formularioRegistro.hidden = mostrarLogin;

  pestanaLogin.setAttribute("aria-selected", String(mostrarLogin));
  pestanaRegistro.setAttribute("aria-selected", String(!mostrarLogin));

  mensaje.textContent = "";
}

pestanaLogin.addEventListener("click", () => {
  cambiarFormulario("login");
});

pestanaRegistro.addEventListener("click", () => {
  cambiarFormulario("registro");
});

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

    let texto =
      "No se pudo crear la cuenta. Revisá los datos e intentá nuevamente.";

    if (error.message?.toLowerCase().includes("already registered")) {
      texto = "Ese correo ya está registrado. Probá iniciar sesión.";
    } else if (error.message?.toLowerCase().includes("password")) {
      texto = "La contraseña no cumple con los requisitos configurados.";
    }

    mostrarMensaje(texto, "error");
  } finally {
    boton.disabled = false;
    boton.textContent = "Crear cuenta";
  }
});
