import { buscarProducto } from './productos.js';

// Lee la URL: ?tipo=labial&id=l1
const params = new URLSearchParams(window.location.search);
const tipo = params.get('tipo');
const id = params.get('id');

const detalle = document.getElementById('detalle');

if (!tipo || !id) {
  detalle.innerHTML = '<p>Producto no especificado.</p>';
} else {
  const prod = buscarProducto(tipo, id);

  if (!prod) {
    detalle.innerHTML = '<p>Producto no encontrado.</p>';
  } else {
    document.title = prod.nombre + ' - Probador AR';
    renderProducto(prod, tipo);
  }
}


function renderProducto(prod, tipo) {
  // Estado: q tono esta activo
  let tonoActual = prod.tonos[0];

  detalle.innerHTML = `
    <img class="detalle-img" id="imagen-prod" src="${tonoActual.imagen}" alt="${prod.nombre}">
    <div class="detalle-info">
      <h1>${prod.nombre}</h1>
      <div class="detalle-precio">$${prod.precio.toLocaleString('es-AR')}</div>
      <p class="detalle-desc">${prod.descripcion}</p>

      <div class="selector-tonos">
        <span class="label">Tono</span>
        <span class="nombre-tono" id="nombre-tono">${tonoActual.nombre}</span>
        <div class="lista-tonos" id="lista-tonos"></div>
      </div>

      <a class="btn-probar" id="btn-probar">Probar en AR</a>
    </div>
  `;

  const listaTonos = document.getElementById('lista-tonos');
  const nombreTono = document.getElementById('nombre-tono');
  const imagenProd = document.getElementById('imagen-prod');
  const btnProbar = document.getElementById('btn-probar');

  // Crear un circulo por cada tono
  prod.tonos.forEach((tono, i) => {
    const circulo = document.createElement('div');
    circulo.className = 'tono' + (i === 0 ? ' activo' : '');
    circulo.style.background = tono.color;
    circulo.title = tono.nombre;

    circulo.addEventListener('click', () => {
      tonoActual = tono;

      // Actualizar UI
      nombreTono.textContent = tono.nombre;
      imagenProd.src = tono.imagen;

      // Marcar como activo
      listaTonos.querySelector('.activo')?.classList.remove('activo');
      circulo.classList.add('activo');

      // Actualizar el link 
      actualizarBoton();
    });

    listaTonos.appendChild(circulo);
  });

  // El boton arma la URL con el color del tono activo
  function actualizarBoton() {
    const colorCodificado = encodeURIComponent(tonoActual.color);
    btnProbar.href = `/ar/?tipo=${tipo}&id=${prod.id}&color=${colorCodificado}`;
  }

  actualizarBoton(); // arranca con el primer tono
}