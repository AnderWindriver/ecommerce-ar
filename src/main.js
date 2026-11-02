import { OpenMakeup } from 'open-makeup-sdk';
import { productos, buscarProducto } from './productos.js';
import { obtenerProductosAPI } from './api.js';
import './style.css';

// 1. Referencias al DOM
const el = {
  video: document.getElementById('camera'),
  canvas: document.getElementById('output'),
  selCat: document.getElementById('selector-categoria'),
  selProd: document.getElementById('selector-producto'),
  producto: document.getElementById('texto-producto'),
  panel: document.getElementById('panel-control'),
  info: document.getElementById('info-panel'),
  btnFloat: document.getElementById('btn-flotante'),
  paleta: document.getElementById('paleta-colores'),
  sliderInt: document.getElementById('sl-intensidad'),
  valInt: document.getElementById('val-int'),
  loader: document.getElementById('indicador-carga'),
};

const TIPOS_SDK = { rubor: 'blush', sombra: 'eyeshadow', labial: 'lipstick' };
let categoria = 'labial';
let colorActual = '#E91E63';
let makeup = null;
let productosDeAPI = []; // Guarda los productos de la API al inicio

// 2. Leer la URL
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

    // Traemos los productos de la API antes de armar los menús
    try {
      productosDeAPI = await obtenerProductosAPI();
    } catch (error) {
      console.error('No se pudieron cargar los productos de la API');
    }

    el.loader.style.display = 'none';
    prepararMenus();

    // 4. Lógica de arranque (Local vs API)
    if (tipoURL && idURL) {
      let prodEncontrado = null;

      if (idURL.startsWith('api-')) {
        prodEncontrado = productosDeAPI.find(p => p.id === idURL);
      } else {
        prodEncontrado = buscarProducto(tipoURL, idURL);
      }

      if (prodEncontrado) {
        categoria = tipoURL;
        el.selCat.value = tipoURL;
        llenarMenuProductos(tipoURL);
        el.selProd.value = idURL;
        cargarProductoEnAR(prodEncontrado);
      } else {
        cargarDefault();
      }
    } else {
      cargarDefault();
    }

  } catch (err) {
    console.error(err);
    el.loader.textContent = 'Error: ' + err.message;
  }
}

function cargarDefault() {
  el.selCat.value = 'labial';
  llenarMenuProductos('labial');
  el.selProd.value = 'l1';
  cargarProductoEnAR(buscarProducto('labial', 'l1'));
}

// 5. Lógica de los Menús
function prepararMenus() {
  el.selCat.addEventListener('change', (e) => {
    const cat = e.target.value;
    if (cat && productos[cat]) {
      llenarMenuProductos(cat);
      categoria = cat;
      
      // Al cambiar de categoría, seleccionamos y cargamos el primer producto de la lista (sea local o API)
      const primerOptionValue = el.selProd.options[0]?.value;
      if (primerOptionValue) {
        el.selProd.value = primerOptionValue;
        const esAPI = primerOptionValue.startsWith('api-');
        const prod = esAPI 
          ? productosDeAPI.find(p => p.id === primerOptionValue)
          : buscarProducto(cat, primerOptionValue);
        
        if (prod) cargarProductoEnAR(prod);
      }
    }
  });

  el.selProd.addEventListener('change', (e) => {
    const id = e.target.value;
    const cat = el.selCat.value;
    if (!id || !cat) return;

    let prod = null;
    if (id.startsWith('api-')) {
      prod = productosDeAPI.find(p => p.id === id);
    } else {
      prod = buscarProducto(cat, id);
    }

    if (prod) {
      categoria = cat;
      cargarProductoEnAR(prod);
    }
  });
}

function llenarMenuProductos(cat) {
  el.selProd.innerHTML = '';
  el.selProd.disabled = false;

  // 1. Agregamos los locales representados con una casita <3
  if (productos[cat]) {
    productos[cat].forEach(prod => {
      const opt = document.createElement('option');
      opt.value = prod.id;
      opt.textContent = `🏠 ${prod.nombre}`; 
      el.selProd.appendChild(opt);
    });
  }

  // 2. Agregamos los de la API representados con un mundito
  const apiFiltrados = productosDeAPI.filter(p => p.tipo === cat);
  apiFiltrados.forEach(prod => {
    const opt = document.createElement('option');
    opt.value = prod.id;
    opt.textContent = `🌐 ${prod.nombre}`;
    el.selProd.appendChild(opt);
  });
}

// 6. Cargar colores del producto
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

// 7. Aplicar al SDK
function aplicar(cat, color) {
  const tipo = TIPOS_SDK[cat];
  if (!tipo || !makeup) return;

  let intensidad = parseFloat(el.sliderInt.value);
  if (intensidad < 0.85) intensidad = 0.85; 

  makeup.apply(tipo, {
    color: color,
    opacity: intensidad,
    finish: 'matte',
  });
}

// 8. Eventos (Slider y panel)
el.sliderInt.addEventListener('input', (e) => {
  el.valInt.textContent = parseFloat(e.target.value).toFixed(2);
});

el.sliderInt.addEventListener('change', () => {
  aplicar(categoria, colorActual);
});

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