import { productos } from './productos.js';
import { obtenerProductosAPI } from './api.js';

export async function cargarLista(tipo) {
  const grilla = document.getElementById('grilla');
  grilla.innerHTML = '<p style="padding: 20px;">Cargando catálogo...</p>'; // Mensaje temporal

  //  Buscamos los productos locales 
  const locales = productos[tipo] || [];
  
  // Buscamos los productos de la API
  const apiProductos = await obtenerProductosAPI(tipo);

  // Los unimos en una sola lista
  const todosLosProductos = [...locales, ...apiProductos];
  
  grilla.innerHTML = ''; 

  if (todosLosProductos.length === 0) {
    grilla.innerHTML = '<p>No hay productos disponibles.</p>';
    return;
  }

  // Dibujamos todo
  todosLosProductos.forEach(prod => {
    // Imagen principal, no tienen imagen en el tono
    const imagenAMostrar = prod.imagen || (prod.tonos && prod.tonos[0]?.imagen);
    
    const card = document.createElement('a');
    card.className = 'tarjeta';
    // Armamos la URL
    card.href = `/producto.html?tipo=${tipo}&id=${prod.id}`;
    
    card.innerHTML = `
      <img src="${imagenAMostrar}" alt="${prod.nombre}">
      <div class="tarjeta-info">
        <div class="tarjeta-nombre">${prod.nombre}</div>
        <div class="tarjeta-precio">$${prod.precio.toLocaleString('es-AR')}</div>
      </div>
    `;
    grilla.appendChild(card);
  });
}