import { buscarProducto } from './productos.js';
import { agregarAlCarrito } from './carrito.js';

// 1. Leer los parámetros de la URL
const params = new URLSearchParams(window.location.search);
const tipo = params.get('tipo');
const id = params.get('id');

const detalle = document.getElementById('detalle');

// 2. Verificar que tengamos los datos y que el producto exista
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

// 3. La función que dibuja todo
function renderProducto(prod, tipo) {
  let tonoActual = prod.tonos[0];

  // Clonamos el molde del HTML
  const template = document.getElementById('template-producto');
  const clone = template.content.cloneNode(true);

  // Buscamos los elementos dentro del clon
  const img = clone.getElementById('imagen-prod');
  const h1 = clone.getElementById('prod-nombre');
  const precio = clone.getElementById('prod-precio');
  const desc = clone.getElementById('prod-desc');
  const nombreTono = clone.getElementById('nombre-tono');
  const listaTonos = clone.getElementById('lista-tonos');
  const btnProbar = clone.getElementById('btn-probar');
  const btnAgregar = clone.getElementById('btn-agregar');

  // Llenamos los datos base
  img.src = tonoActual.imagen;
  img.alt = prod.nombre;
  h1.textContent = prod.nombre;
  precio.textContent = '$' + prod.precio.toLocaleString('es-AR');
  desc.textContent = prod.descripcion;
  nombreTono.textContent = tonoActual.nombre;

  // Actualizar el botón de AR
  btnProbar.href = `/ar/?tipo=${tipo}&id=${prod.id}`;

  // Generar los circulitos de los tonos
  prod.tonos.forEach((tono, i) => {
    const circulo = document.createElement('div');
    circulo.className = 'tono' + (i === 0 ? ' activo' : '');
    circulo.style.background = tono.color;
    circulo.title = tono.nombre;

    circulo.addEventListener('click', () => {
      tonoActual = tono;
      nombreTono.textContent = tono.nombre;
      img.src = tono.imagen;
      
      // Actualizamos la clase activa
      listaTonos.querySelector('.activo')?.classList.remove('activo');
      circulo.classList.add('activo');
    });

    listaTonos.appendChild(circulo);
  });

  // Evento del botón Agregar al Carrito
  btnAgregar.addEventListener('click', () => {
    agregarAlCarrito(prod, tonoActual);
    btnAgregar.textContent = '¡AGREGADO!';
    setTimeout(() => { btnAgregar.textContent = 'AGREGAR AL CARRITO'; }, 1500);
     window.dispatchEvent(new Event('focus'))
  });

  // Inyectamos el clon completo en la página
  detalle.innerHTML = ''; // Limpiamos el contenedor
  detalle.appendChild(clone); // Metemos el clon
}