import { buscarProducto } from './productos.js';
import { obtenerProductosAPI } from './api.js'; 
import { agregarAlCarrito } from './carrito.js';

// 1. Leer la URL
const params = new URLSearchParams(window.location.search);
const tipo = params.get('tipo');
const id = params.get('id');
const detalle = document.getElementById('detalle');

// 2. Funcion principal
async function iniciarPagina() {
  if (!tipo || !id) {
    detalle.innerHTML = '<p>Producto no especificado.</p>';
    return;
  }

  let prod = null;

  // Si el ID empieza con 'api-', lo buscamos en el servidor de Node
  if (id.startsWith('api-')) {
    const productosAPI = await obtenerProductosAPI(tipo);
    prod = productosAPI.find(p => p.id === id);
  } else {
    // Si no, lo buscamos en productos locales
    prod = buscarProducto(tipo, id);
  }

  if (!prod) {
    detalle.innerHTML = '<p>Producto no encontrado.</p>';
    return;
  }

  document.title = prod.nombre + ' - Probador AR';
  renderProducto(prod, tipo);
}

// 3. Dibuja el HTML
function renderProducto(prod, tipo) {
  // Si el producto viene de la API, el primer tono puede no tener imagen propia.
  // Usamos la imagen principal del producto como respaldo.
  let tonoActual = prod.tonos[0];
  if (!tonoActual.imagen && prod.imagen) {
    tonoActual.imagen = prod.imagen;
  }

  const template = document.getElementById('template-producto');
  const clone = template.content.cloneNode(true);

  const img = clone.getElementById('imagen-prod');
  const h1 = clone.getElementById('prod-nombre');
  const precio = clone.getElementById('prod-precio');
  const desc = clone.getElementById('prod-desc');
  const nombreTono = clone.getElementById('nombre-tono');
  const listaTonos = clone.getElementById('lista-tonos');
  const btnProbar = clone.getElementById('btn-probar');
  const btnAgregar = clone.getElementById('btn-agregar');

  // llenamos datos base
  img.src = tonoActual.imagen || prod.imagen;
  img.alt = prod.nombre;
  h1.textContent = prod.nombre;
  precio.textContent = '$' + prod.precio.toLocaleString('es-AR');
  desc.textContent = prod.descripcion;
  nombreTono.textContent = tonoActual.nombre;

  // Boton de AR
  btnProbar.href = `/ar/?tipo=${tipo}&id=${prod.id}`;

  // Generar tonos
  prod.tonos.forEach((tono, i) => {
    const circulo = document.createElement('div');
    circulo.className = 'tono' + (i === 0 ? ' activo' : '');
    circulo.style.background = tono.color;
    circulo.title = tono.nombre;

    circulo.addEventListener('click', () => {
      tonoActual = tono;
      nombreTono.textContent = tono.nombre;
      
      // Si el tono no tiene imagen, usamos la general del producto
      img.src = tono.imagen || prod.imagen;
      
      listaTonos.querySelector('.activo')?.classList.remove('activo');
      circulo.classList.add('activo');
    });

    listaTonos.appendChild(circulo);
  });

  // Boton de carrito
  btnAgregar.addEventListener('click', () => {
    agregarAlCarrito(prod, tonoActual);
    btnAgregar.textContent = '¡AGREGADO!';
    setTimeout(() => { btnAgregar.textContent = 'AGREGAR AL CARRITO'; }, 1500);
  });

  detalle.innerHTML = '';
  detalle.appendChild(clone);
}


iniciarPagina();
