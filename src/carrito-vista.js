
import { obtenerCarrito, borrarDelCarrito } from './carrito.js';

const listaDiv = document.getElementById('lista-carrito');
const totalDiv = document.getElementById('total-carrito');

function renderizarCarrito() {
  const carrito = obtenerCarrito();
  listaDiv.innerHTML = '';
  
  if (carrito.length === 0) {
    listaDiv.innerHTML = '<p style="text-align:center;">Tu carrito está vacío.</p>';
    totalDiv.textContent = '';
    return;
  }

  let total = 0;

  carrito.forEach(item => {
    total += item.precio * item.cantidad;
    
    // Creamos la fila del producto
    const fila = document.createElement('div');
    fila.style.cssText = "display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #ccc; padding: 15px 0;";
    
    fila.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <div style="width: 20px; height: 20px; border-radius: 50%; background: ${item.tono.color}; border: 1px solid #000;"></div>
        <div>
          <strong>${item.nombre}</strong><br>
          <span style="font-size: 14px; color: #666;">Tono: ${item.tono.nombre} | Cant: ${item.cantidad}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 20px;">
        <span>$${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
        <button class="btn-borrar" data-id="${item.id}" data-color="${item.tono.color}" style="background: none; border: none; color: #FF2E5B; cursor: pointer; font-weight: bold;">X</button>
      </div>
    `;
    
    listaDiv.appendChild(fila);
  });

  totalDiv.textContent = `Total: $${total.toLocaleString('es-AR')}`;

  // Escuchar los botones de borrar
  document.querySelectorAll('.btn-borrar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      const color = e.target.getAttribute('data-color');
      borrarDelCarrito(id, color);
      renderizarCarrito(); // Volver a dibujar
      // Actualizamos el contador del menú
      window.dispatchEvent(new Event('load')); 
    });
  });
}

window.addEventListener('load', renderizarCarrito);