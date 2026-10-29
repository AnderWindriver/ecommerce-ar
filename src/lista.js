import { productos } from './productos.js';

export function cargarLista(tipo) {
  const grilla = document.getElementById('grilla');
  const lista = productos[tipo] || [];

  lista.forEach(prod => {
    const primerTono = prod.tonos[0];

    const card = document.createElement('a');
    card.className = 'tarjeta';
    card.href = `/producto.html?tipo=${tipo}&id=${prod.id}`;
    card.innerHTML = `
      <img src="${primerTono.imagen}" alt="${prod.nombre}">
      <div class="tarjeta-info">
        <div class="tarjeta-nombre">${prod.nombre}</div>
        <div class="tarjeta-precio">$${prod.precio.toLocaleString('es-AR')}</div>
      </div>
    `;
    grilla.appendChild(card);
  });
}