import { obtenerCarrito, borrarDelCarrito } from './carrito.js';

const listaDiv = document.getElementById('lista-carrito');
const totalDiv = document.getElementById('total-carrito');

async function renderizarCarrito() {
  if (!listaDiv) return; // Si no estamos en la página del carrito, salimos

  const carrito = await obtenerCarrito(); // Esperamos los datos asíncronos de Supabase
  listaDiv.innerHTML = '';
  
  if (carrito.length === 0) {
    listaDiv.innerHTML = '<p style="text-align:center; padding: 20px; color: #666;">Tu carrito está vacío.</p>';
    if (totalDiv) totalDiv.textContent = 'Total: $0';
    return;
  }

  let total = 0;

  carrito.forEach(item => {
    total += item.precio * item.cantidad;
    
    // Creamos la fila del producto (sin etiqueta de imagen)
    const fila = document.createElement('div');
    fila.style.cssText = "display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #ccc; padding: 15px 0;";
    
    const colorHex = item.tono?.color || '#E91E63';
    const nombreTono = item.tono?.nombre || 'Tono único';

    fila.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <div style="width: 25px; height: 25px; border-radius: 50%; background: ${colorHex}; border: 1px solid #000; flex-shrink: 0;" title="Tono: ${nombreTono}"></div>
        <div>
          <strong>${item.nombre}</strong><br>
          <span style="font-size: 14px; color: #666;">Tono: ${nombreTono} | Cant: ${item.cantidad}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 20px;">
        <span>$${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
        <button class="btn-borrar" data-id-item="${item.id_item}" style="background: none; border: none; color: #FF2E5B; cursor: pointer; font-weight: bold; font-size: 16px;" title="Eliminar producto">✕</button>
      </div>
    `;
    
    listaDiv.appendChild(fila);
  });

  if (totalDiv) {
    totalDiv.textContent = `Total: $${total.toLocaleString('es-AR')}`;
  }

  // Escuchar los botones de borrar
  document.querySelectorAll('.btn-borrar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idItem = e.target.getAttribute('data-id-item');
      
      // Borramos usando el id único del ítem en Supabase
      const exito = await borrarDelCarrito(idItem);
      
      if (exito) {
        await renderizarCarrito(); // Volvemos a dibujar la lista localmente
        // Avisamos a todo el sistema que el carrito cambió
        window.dispatchEvent(new CustomEvent('carritoActualizado'));
      }
    });
  });
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
