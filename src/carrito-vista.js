import {
  obtenerCarrito,
  actualizarCantidadCarrito,
  borrarDelCarrito,
} from './carrito.js';

const listaDiv = document.getElementById('lista-carrito');
const totalDiv = document.getElementById('total-carrito');
const linkPagos = document.getElementById('link-pagos');
const mensajeDiv = document.createElement('p');
mensajeDiv.className = 'carrito-mensaje';
mensajeDiv.setAttribute('role', 'status');
mensajeDiv.setAttribute('aria-live', 'polite');
mensajeDiv.hidden = true;
listaDiv?.insertAdjacentElement('afterend', mensajeDiv);

function mostrarMensaje(texto, esError = false) {
  mensajeDiv.textContent = texto;
  mensajeDiv.classList.toggle('error', esError);
  mensajeDiv.hidden = false;
}

function notificarCambioCarrito() {
  mensajeDiv.hidden = true;
  window.dispatchEvent(new CustomEvent('carritoActualizado'));
}

async function renderizarCarrito() {
  if (!listaDiv) return; // Si no estamos en la página del carrito, salimos

  const carrito = await obtenerCarrito(); // Esperamos los datos asíncronos de Supabase
  listaDiv.innerHTML = '';
  
  if (carrito.length === 0) {
    listaDiv.innerHTML = '<p style="text-align:center; padding: 20px; color: #666;">Tu carrito está vacío.</p>';
    if (totalDiv) totalDiv.textContent = 'Total: $0';
    if (linkPagos) linkPagos.hidden = true;
    return;
  }

  if (linkPagos) linkPagos.hidden = false;

  let total = 0;

  carrito.forEach(item => {
    total += item.precio * item.cantidad;

    const fila = document.createElement('div');
    fila.className = 'fila-carrito';

    const colorHex = item.tono?.color || '#E91E63';
    const nombreTono = item.tono?.nombre || 'Tono único';
    const informacion = document.createElement('div');
    informacion.className = 'carrito-producto';

    const muestraTono = document.createElement('div');
    muestraTono.className = 'carrito-tono';
    muestraTono.style.backgroundColor = colorHex;
    muestraTono.title = `Tono: ${nombreTono}`;
    muestraTono.setAttribute('aria-hidden', 'true');

    const descripcion = document.createElement('div');
    const nombre = document.createElement('strong');
    nombre.textContent = item.nombre;
    const tono = document.createElement('span');
    tono.className = 'carrito-tono-nombre';
    tono.textContent = `Tono: ${nombreTono}`;
    descripcion.append(nombre, tono);
    informacion.append(muestraTono, descripcion);

    const acciones = document.createElement('div');
    acciones.className = 'carrito-acciones-item';

    const controlCantidad = document.createElement('div');
    controlCantidad.className = 'control-cantidad';
    controlCantidad.setAttribute('aria-label', `Cantidad de ${item.nombre}`);

    const btnRestar = document.createElement('button');
    btnRestar.type = 'button';
    btnRestar.className = 'btn-cantidad';
    btnRestar.textContent = '−';
    btnRestar.setAttribute('aria-label', `Restar una unidad de ${item.nombre}`);
    btnRestar.disabled = item.cantidad <= 1;
    btnRestar.addEventListener('click', () =>
      cambiarCantidad(item, item.cantidad - 1, btnRestar),
    );

    const cantidad = document.createElement('span');
    cantidad.className = 'cantidad-carrito';
    cantidad.textContent = item.cantidad;
    cantidad.setAttribute('aria-live', 'polite');

    const btnSumar = document.createElement('button');
    btnSumar.type = 'button';
    btnSumar.className = 'btn-cantidad';
    btnSumar.textContent = '+';
    btnSumar.setAttribute('aria-label', `Sumar una unidad de ${item.nombre}`);
    btnSumar.addEventListener('click', () =>
      cambiarCantidad(item, item.cantidad + 1, btnSumar),
    );

    controlCantidad.append(btnRestar, cantidad, btnSumar);

    const precio = document.createElement('strong');
    precio.className = 'precio-item-carrito';
    precio.textContent = `$${(item.precio * item.cantidad).toLocaleString('es-AR')}`;

    const btnBorrar = document.createElement('button');
    btnBorrar.type = 'button';
    btnBorrar.className = 'btn-borrar';
    btnBorrar.textContent = 'Eliminar';
    btnBorrar.setAttribute('aria-label', `Eliminar ${item.nombre} del carrito`);
    btnBorrar.addEventListener('click', () => eliminarItem(item.id_item, btnBorrar));

    acciones.append(controlCantidad, precio, btnBorrar);
    fila.append(informacion, acciones);
    listaDiv.appendChild(fila);
  });

  if (totalDiv) {
    totalDiv.textContent = `Total: $${total.toLocaleString('es-AR')}`;
  }
}

async function cambiarCantidad(item, nuevaCantidad, boton) {
  boton.disabled = true;
  const exito = await actualizarCantidadCarrito(item.id_item, nuevaCantidad);

  if (!exito) {
    mostrarMensaje('No se pudo actualizar la cantidad. Intentá nuevamente.', true);
    boton.disabled = false;
    return;
  }

  notificarCambioCarrito();
}

async function eliminarItem(idItem, boton) {
  boton.disabled = true;
  const exito = await borrarDelCarrito(idItem);

  if (!exito) {
    mostrarMensaje('No se pudo eliminar el producto. Intentá nuevamente.', true);
    boton.disabled = false;
    return;
  }

  notificarCambioCarrito();
}

// Inicialización segura para cuando cargue el DOM
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', renderizarCarrito);
} else {
  renderizarCarrito();
}

// Escuchador global por si el carrito se modifica desde otra sección o pestaña
window.addEventListener('carritoActualizado', async () => {
  await renderizarCarrito();
});
