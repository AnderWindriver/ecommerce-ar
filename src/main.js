import { OpenMakeup } from 'open-makeup-sdk';
import { productos, buscarProducto } from './productos.js';
import './style.css';

// 1. Referencias al DOM
const el = {
  video:      document.getElementById('camera'),
  canvas:     document.getElementById('output'),
  selCat:     document.getElementById('selector-categoria'),
  selProd:    document.getElementById('selector-producto'),
  producto:   document.getElementById('texto-producto'),
  panel:      document.getElementById('panel-control'),
  info:       document.getElementById('info-panel'),
  btnFloat:   document.getElementById('btn-flotante'),
  paleta:     document.getElementById('paleta-colores'),
  sliderInt:  document.getElementById('sl-intensidad'),
  valInt:     document.getElementById('val-int'),
  loader:     document.getElementById('indicador-carga'),
};

const TIPOS_SDK = { rubor: 'blush', sombra: 'eyeshadow', labial: 'lipstick' };
let categoria = 'labial';
let colorActual = '#E91E63';
let makeup = null;

// 2. Leer la URL (por si venimos de un producto específico)
const params = new URLSearchParams(window.location.search);
const tipoURL = params.get('tipo');
const idURL = params.get('id');

// 3. Inicialización
async function iniciar() {
  try {
    el.loader.textContent = 'Pidiendo permiso de cámara...';
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    el.video.srcObject = stream;
    await el.video.play();

    el.loader.textContent = 'Inicializando...';
    makeup = new OpenMakeup({
      video: el.video,
      renderCanvas: el.canvas,
      assetsBaseUrl: '/assets',
      faceMeshLocateFile: (file) => `/mediapipe/face_mesh/${file}`,
    });
    await makeup.init();

    el.loader.style.display = 'none';
    
    // Iniciamos los menús (vacíos al principio)
    prepararMenus();

    // Si venimos de la tienda con un producto, lo cargamos.
    // Si no, cargamos el primero por defecto (Labial Mate).
    if (tipoURL && idURL && buscarProducto(tipoURL, idURL)) {
      categoria = tipoURL;
      el.selCat.value = tipoURL; // Setea el menú de categorías
      llenarMenuProductos(tipoURL); // Llena el menú de productos
      el.selProd.value = idURL; // Setea el producto específico
      
      const prod = buscarProducto(tipoURL, idURL);
      cargarProductoEnAR(prod); // Aplica los colores
    } else {
      el.selCat.value = 'labial';
      llenarMenuProductos('labial');
      el.selProd.value = 'l1';
      cargarProductoEnAR(buscarProducto('labial', 'l1'));
    }

  } catch (err) {
    console.error(err);
    el.loader.textContent = 'Error: ' + err.message;
  }
}

// 4. Lógica de los Menús
function prepararMenus() {
  // Evento al cambiar la categoría
  el.selCat.addEventListener('change', (e) => {
    const cat = e.target.value;
    if (cat) {
      llenarMenuProductos(cat);
      // Al cambiar de categoría, cargamos el primer producto de esa categoría
      const primerProd = productos[cat][0];
      el.selProd.value = primerProd.id;
      categoria = cat;
      cargarProductoEnAR(primerProd);
    } else {
      // Si eligen la opción vacía
      el.selProd.innerHTML = '<option value="">Seleccioná un producto</option>';
      el.selProd.disabled = true;
      makeup?.clearAll?.();
    }
  });

  // Evento al cambiar el producto
  el.selProd.addEventListener('change', (e) => {
    const id = e.target.value;
    const cat = el.selCat.value;
    if (id && cat) {
      const prod = buscarProducto(cat, id);
      categoria = cat;
      cargarProductoEnAR(prod);
    }
  });
}

function llenarMenuProductos(cat) {
  el.selProd.innerHTML = '';
  el.selProd.disabled = false;

  productos[cat].forEach(prod => {
    const opt = document.createElement('option');
    opt.value = prod.id;
    opt.textContent = prod.nombre;
    el.selProd.appendChild(opt);
  });
}

// 5. Cargar colores del producto
function cargarProductoEnAR(prod) {
  makeup?.clearAll?.();
  el.producto.textContent = prod.nombre;
  
  el.paleta.innerHTML = '';
  prod.tonos.forEach((tono, i) => {
    const sw = document.createElement('div');
    sw.className = 'color-swatch';
    sw.style.background = tono.color;
    if (i === 0) sw.classList.add('activo');

    sw.addEventListener('click', () => {
      colorActual = tono.color;
      aplicar(categoria, tono.color);
      el.paleta.querySelector('.activo')?.classList.remove('activo');
      sw.classList.add('activo');
    });

    el.paleta.appendChild(sw);
  });

  if (prod.tonos.length > 0) {
    colorActual = prod.tonos[0].color;
    aplicar(categoria, colorActual);
  }
}

// 6. Aplicar al SDK
function aplicar(cat, color) {
  const tipo = TIPOS_SDK[cat];
  if (!tipo || !makeup) return;

  makeup.apply(tipo, {
    color: color,
    opacity: parseFloat(el.sliderInt.value),
    finish: 'glossy',
  });
}

// 7. Eventos (Slider y panel)
// Función para forzar el redimensionamiento real del canvas
function redimensionarCanvas() {
  const canvas = document.getElementById('output');
  if (!canvas) return;
  
  // Le decimos al canvas que su tamaño real (en píxeles) sea igual al de la pantalla
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

document.getElementById('btn-minimizar').addEventListener('click', () => {
  el.panel.classList.add('oculto');
  el.info.classList.add('oculto');
  el.btnFloat.classList.add('visible');
});

el.btnFloat.addEventListener('click', () => {
  el.panel.classList.remove('oculto');
  el.info.classList.remove('oculto');
  el.btnFloat.classList.remove('visible');
});

window.addEventListener('load', iniciar);