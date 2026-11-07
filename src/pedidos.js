import { supabase } from "../js/login.js";
import { obtenerPedidos } from "./pedidos-storage.js";

const contenedor = document.getElementById("lista-pedidos");

const formatoPrecio = (precio) =>
  `$${Number(precio).toLocaleString("es-AR")}`;

function agregarTexto(elemento, clase, texto) {
  const nodo = document.createElement("p");
  nodo.className = clase;
  nodo.textContent = texto;
  elemento.appendChild(nodo);
}

async function renderizarPedidos() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`No se pudo validar la sesión: ${error.message}`);

  if (!data.user) {
    window.location.href = "/html/login.html";
    return;
  }

  const pedidos = await obtenerPedidos(data.user.id);
  if (pedidos.length === 0) {
    agregarTexto(
      contenedor,
      "pedido-vacio",
      "Todavía no realizaste compras. Cuando confirmes una compra, aparecerá acá.",
    );
    return;
  }

  pedidos.forEach((pedido) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "pedido-card";

    const titulo = document.createElement("h2");
    titulo.textContent = `Pedido #${String(pedido.id).slice(0, 8).toUpperCase()}`;
    tarjeta.appendChild(titulo);

    agregarTexto(
      tarjeta,
      "pedido-meta",
      new Date(pedido.fecha).toLocaleString("es-AR"),
    );

    const detalle = document.createElement("div");
    pedido.items.forEach((item) => {
      const linea = document.createElement("div");
      linea.className = "pedido-item";
      const descripcion = document.createElement("span");
      descripcion.textContent = `${item.nombre} · ${item.tono} × ${item.cantidad}`;
      const precio = document.createElement("strong");
      precio.textContent = formatoPrecio(item.precio * item.cantidad);
      linea.append(descripcion, precio);
      detalle.appendChild(linea);
    });
    tarjeta.appendChild(detalle);

    const total = document.createElement("p");
    total.className = "pedido-total";
    total.textContent = `Total: ${formatoPrecio(pedido.total)}`;
    tarjeta.appendChild(total);
    contenedor.appendChild(tarjeta);
  });
}

renderizarPedidos().catch((error) => {
  console.error("No se pudo cargar el historial de pedidos:", error);
  agregarTexto(contenedor, "checkout-mensaje error", error.message);
});
