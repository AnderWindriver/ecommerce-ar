import { supabase } from "../js/login.js";
import { obtenerCarrito } from "./carrito.js";
import { procesarCompra } from "./pedidos-storage.js";

const resumenDiv = document.getElementById("resumen-pago");
const totalDiv = document.getElementById("total-pago");
const form = document.getElementById("form-pago");
const mensajeDiv = document.getElementById("mensaje-pago");
const confirmarBtn = document.getElementById("confirmar-pago");

const formatoPrecio = (precio) =>
  `$${Number(precio).toLocaleString("es-AR")}`;

function mostrarMensaje(texto, esError = false) {
  mensajeDiv.textContent = texto;
  mensajeDiv.classList.toggle("error", esError);
}

async function inicializarPago() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`No se pudo validar la sesión: ${error.message}`);

  if (!data.user) {
    window.location.href = "/html/login.html";
    return;
  }

  const carrito = await obtenerCarrito();
  if (carrito.length === 0) {
    resumenDiv.innerHTML =
      '<p class="pedido-vacio">Tu carrito está vacío. Agregá productos antes de continuar.</p>';
    totalDiv.textContent = formatoPrecio(0);
    confirmarBtn.disabled = true;
    return;
  }

  const total = carrito.reduce(
    (acumulado, item) => acumulado + item.precio * item.cantidad,
    0,
  );

  resumenDiv.replaceChildren();
  carrito.forEach((item) => {
    const linea = document.createElement("div");
    linea.className = "checkout-resumen-linea";
    const descripcion = document.createElement("span");
    descripcion.textContent = `${item.nombre} · ${item.tono?.nombre || "Tono único"} × ${item.cantidad}`;
    const precio = document.createElement("strong");
    precio.textContent = formatoPrecio(item.precio * item.cantidad);
    linea.append(descripcion, precio);
    resumenDiv.appendChild(linea);
  });
  totalDiv.textContent = formatoPrecio(total);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const metodo = form.querySelector('input[name="metodo"]:checked')?.value;
    if (!metodo) {
      mostrarMensaje("Seleccioná un medio de pago para continuar.", true);
      return;
    }

    confirmarBtn.disabled = true;
    mostrarMensaje("Registrando la compra...");

    try {
      await procesarCompra(data.user.id);
    } catch (error) {
      console.error("Error al procesar la compra:", error);
      mostrarMensaje(error.message, true);
      confirmarBtn.disabled = false;
      return;
    }

    // El carrito ya quedó en estado "completado": solo se notifica a la UI.
    window.dispatchEvent(new CustomEvent("carritoActualizado"));
    form.hidden = true;
    mostrarMensaje("¡Compra confirmada! Redirigiendo a tus pedidos...");

    setTimeout(() => {
      window.location.href = "/html/pedidos.html";
    }, 1200);
  });
}

inicializarPago().catch((error) => {
  console.error("No se pudo iniciar el pago:", error);
  mostrarMensaje(error.message, true);
});
