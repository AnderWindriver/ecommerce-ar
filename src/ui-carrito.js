import { obtenerCarrito } from './carrito.js';

// 1. Actualizar el contador rojo/negro
export async function actualizarContador() {
  const contador = document.getElementById('contador-carrito');
  if (contador) {
    const carrito = await obtenerCarrito();
    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    contador.textContent = total;
  }
}

// 2. Controlar el panel desplegable
function iniciarMiniCarrito() {
  const btnMenu = document.getElementById('btn-carrito-menu');
  const panel = document.getElementById('panel-mini-carrito');
  const itemsDiv = document.getElementById('items-mini-carrito');
  const btnIrCarrito = document.getElementById('btn-ir-carrito');

  if (!btnMenu || !panel) return;

  // Abrir / Cerrar
  btnMenu.addEventListener('click', async (e) => {
    e.preventDefault();
    panel.classList.toggle('abierto');
    await dibujarMiniCarrito();
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
      window.location.href = '/html/carrito.html';
    });
  }

  // Función que dibuja la lista adentro del desplegable
  async function dibujarMiniCarrito() {
    const carrito = await obtenerCarrito();
    itemsDiv.innerHTML = '';

    if (carrito.length === 0) {
      itemsDiv.innerHTML = '<p style="text-align:center; font-size: 13px; padding: 10px;">Tu carrito está vacío.</p>';
      return;
    }

    carrito.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item-mini';
      
      const colorHex = item.tono?.color || '#E91E63';
      const nombreTono = item.tono?.nombre || 'Tono único';

      div.innerHTML = `
        <div class="item-mini-color" style="background: ${colorHex};"></div>
        <div class="item-mini-info">
          <strong>${item.nombre}</strong><br>
          <span style="color: #666; font-size: 11px;">${nombreTono} x${item.cantidad}</span>
        </div>
        <div class="item-mini-precio">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</div>
      `;
      itemsDiv.appendChild(div);
    });
  }
}

// 3. Inicialización segura para módulos de Vite (evita que se pierda el evento DOMContentLoaded)
async function inicializarUI() {
  await actualizarContador();
  iniciarMiniCarrito();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', inicializarUI);
} else {
  // Si el DOM ya cargó, se ejecuta inmediatamente
  inicializarUI();
}

// Actualizar si el usuario vuelve a enfocar la pestaña
window.addEventListener('focus', async () => {
  await actualizarContador();
});

// 4. Escuchar el evento personalizado disparado desde agregarAlCarrito
window.addEventListener('carritoActualizado', async () => {
  await actualizarContador();
  
  // Si el mini carrito está abierto en ese momento, actualizamos su contenido también
  const panel = document.getElementById('panel-mini-carrito');
  if (panel && panel.classList.contains('abierto')) {
    const btnMenu = document.getElementById('btn-carrito-menu');
    if (btnMenu) {
      // Forzamos un redibujado rápido buscando el contenedor de ítems
      const itemsDiv = document.getElementById('items-mini-carrito');
      if (itemsDiv) {
        const carrito = await obtenerCarrito();
        itemsDiv.innerHTML = '';
        carrito.forEach(item => {
          const div = document.createElement('div');
          div.className = 'item-mini';
          div.innerHTML = `
            <div class="item-mini-color" style="background: ${item.tono?.color || '#E91E63'};"></div>
            <div class="item-mini-info">
              <strong>${item.nombre}</strong><br>
              <span style="color: #666; font-size: 11px;">${item.tono?.nombre || 'Tono'} x${item.cantidad}</span>
            </div>
            <div class="item-mini-precio">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</div>
          `;
          itemsDiv.appendChild(div);
        });
      }
    }
  }
});
