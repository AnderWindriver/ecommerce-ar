import { buscarProducto } from './productos.js';
import { obtenerProductosAPI } from './api.js'; // <-- Importante: Traemos la API
import { agregarAlCarrito } from './carrito.js';

// 1. Leer los parámetros de la URL
const params = new URLSearchParams(window.location.search);
const tipo = params.get('tipo');
const id = params.get('id');
const detalle = document.getElementById('detalle');

// 2. Función principal (Asíncrona porque tiene que esperar a la API)
async function iniciarPagina() {
  if (!tipo || !id) {
    detalle.innerHTML = '<p>Producto no especificado.</p>';
    return;
  }

  let prod = null;

  try {
    // Si el ID empieza con 'api-', significa que vino del servidor de Node
    if (id.startsWith('api-')) {
      const productosAPI = await obtenerProductosAPI(tipo);
      prod = productosAPI.find(p => p.id === id);
    } else {
      // Si no, es uno de tus productos locales (hardcodeados)
      prod = buscarProducto(tipo, id);
    }
  } catch (error) {
    console.error("Error al buscar el producto:", error);
  }

  // Si no lo encontró (o falló la API), mostramos el error
  if (!prod) {
    detalle.innerHTML = '<p>Producto no encontrado.</p>';
    return;
  }

  // Si todo salió bien, dibujamos la página
  document.title = prod.nombre + ' - Probador AR';
  renderProducto(prod, tipo);
}

// 3. Función que arma el HTML del producto
function renderProducto(prod, tipo) {
  // Aseguramos que el producto tenga al menos un tono para evitar errores
  let tonoActual = (prod.tonos && prod.tonos.length > 0) 
    ? prod.tonos[0] 
    : { nombre: 'Único', color: '#E91E63', imagen: prod.imagen };

  // Si el tono no tiene imagen propia, usamos la imagen general del producto
  if (!tonoActual.imagen && prod.imagen) {
    tonoActual.imagen = prod.imagen;
  }

  // Clonamos la plantilla HTML
  const template = document.getElementById('template-producto');
  const clone = template.content.cloneNode(true);

  // Referencias a los elementos del clon
  const img = clone.getElementById('imagen-prod');
  const h1 = clone.getElementById('prod-nombre');
  const precio = clone.getElementById('prod-precio');
  const desc = clone.getElementById('prod-desc');
  const nombreTono = clone.getElementById('nombre-tono');
  const listaTonos = clone.getElementById('lista-tonos');
  const btnProbar = clone.getElementById('btn-probar');
  const btnAgregar = clone.getElementById('btn-agregar');

  // Llenamos los datos base
  img.src = tonoActual.imagen || prod.imagen;
  img.alt = prod.nombre;
  h1.textContent = prod.nombre;
  precio.textContent = '$' + prod.precio.toLocaleString('es-AR');
  desc.textContent = prod.descripcion;
  nombreTono.textContent = tonoActual.nombre;

  // Actualizamos el enlace del botón AR
  btnProbar.href = `/ar/?tipo=${tipo}&id=${prod.id}`;

  // Generamos los círculos de colores
  // Si por alguna razón no hay tonos, creamos una lista con el tono por defecto
  const tonosParaDibujar = (prod.tonos && prod.tonos.length > 0) ? prod.tonos : [tonoActual];

  tonosParaDibujar.forEach((tono, i) => {
    const circulo = document.createElement('div');
    circulo.className = 'tono' + (i === 0 ? ' activo' : '');
    circulo.style.background = tono.color;
    circulo.title = tono.nombre;

    circulo.addEventListener('click', () => {
      tonoActual = tono;
      nombreTono.textContent = tono.nombre;
      
      // Si el nuevo tono no tiene imagen, mantenemos la del producto
      img.src = tono.imagen || prod.imagen;

      // Actualizamos la clase activa visualmente
      listaTonos.querySelector('.activo')?.classList.remove('activo');
      circulo.classList.add('activo');
    });

    listaTonos.appendChild(circulo);
  });

  // Lógica del botón Agregar al Carrito
  btnAgregar.addEventListener('click', () => {
    agregarAlCarrito(prod, tonoActual);
    btnAgregar.textContent = '¡AGREGADO!';
    setTimeout(() => { btnAgregar.textContent = 'AGREGAR AL CARRITO'; }, 1500);
    
    // Avisamos al header para que actualice el contador
    window.dispatchEvent(new Event('focus')); 
  });

  // Inyectamos el resultado final en la página
  detalle.innerHTML = '';
  detalle.appendChild(clone);
}

// Ejecutamos todo
iniciarPagina();