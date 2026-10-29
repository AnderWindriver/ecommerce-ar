import { obtenerCarrito } from './carrito.js';

// 1. Actualizar el contador rojo/negro cada vez que carga la página
function actualizarContador() {
  const contador = document.getElementById('contador-carrito');
  if (contador) {
    const carrito = obtenerCarrito();
    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    contador.textContent = total;
  }
}

// 2. Controlar el panel desplegable (solo si existe en el HTML)
function iniciarMiniCarrito() {
  const btnMenu = document.getElementById('btn-carrito-menu');
  const panel = document.getElementById('panel-mini-carrito');
  const itemsDiv = document.getElementById('items-mini-carrito');
  const btnIrCarrito = document.getElementById('btn-ir-carrito');

  // Si no estamos en una página con el carrito en el menú, no hacemos nada
  if (!btnMenu || !panel) return;

  // Abrir / Cerrar
  btnMenu.addEventListener('click', (e) => {
    e.preventDefault(); // Evita que el botón recargue la página
    panel.classList.toggle('abierto');
    dibujarMiniCarrito(); // Lo llenamos con productos cada vez que se abre
  });

  // Cerrar si clickean afuera
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !btnMenu.contains(e.target)) {
      panel.classList.remove('abierto');
    }
  });

  // Botón para ir a la página del carrito
  if (btnIrCarrito) {
    btnIrCarrito.addEventListener('click', () => {
      window.location.href = '/carrito.html';
    });
  }

  // Función que dibuja la lista adentro del desplegable
  function dibujarMiniCarrito() {
    const carrito = obtenerCarrito();
    itemsDiv.innerHTML = ''; // Limpiamos lo que había

    if (carrito.length === 0) {
      itemsDiv.innerHTML = '<p style="text-align:center; font-size: 13px; padding: 10px;">Tu carrito está vacío.</p>';
      return;
    }

    carrito.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item-mini';
      div.innerHTML = `
        <div class="item-mini-color" style="background: ${item.tono.color};"></div>
        <div class="item-mini-info">
          <strong>${item.nombre}</strong><br>
          <span style="color: #666; font-size: 11px;">${item.tono.nombre} x${item.cantidad}</span>
        </div>
        <div class="item-mini-precio">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</div>
      `;
      itemsDiv.appendChild(div);
    });
  }
}

// Ejecutamos todo al cargar la ventana
window.addEventListener('DOMContentLoaded', () => {
  actualizarContador();
  iniciarMiniCarrito();
});

// Escuchador cuando vuelvo a la pestaña 
window.addEventListener('focus', () => {
  actualizarContador();
});