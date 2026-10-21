import { productos } from './productos.js';

const categorias = ['rubor', 'labial', 'sombra'];
const grilla = document.getElementById('grilla-categorias');

categorias.forEach(tipo => {
  const destacado = productos[tipo][0];
  const primerTono = destacado.tonos[0];

  const tarjeta = document.createElement('a');
  tarjeta.className = 'tarjeta';
  tarjeta.href = `/${tipo}.html`;
  tarjeta.innerHTML = `
    <img src="${primerTono.imagen}" alt="${destacado.nombre}">
    <div class="tarjeta-info">
      <div class="tarjeta-nombre">${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</div>
      <div class="tarjeta-precio">Ver todos los productos</div>
    </div>
  `;
  grilla.appendChild(tarjeta);
});