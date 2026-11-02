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
  btnLimpiar: document.getElementById('btn-limpiar'),
  paleta: document.getElementById('paleta-colores'),
  loader: document.getElementById('indicador-carga'),
};

const TIPOS_SDK = { rubor: 'blush', sombra: 'eyeshadow', labial: 'lipstick' };
let categoria = 'labial';
let makeup = null;
let productosDeAPI = [];

// ACA GUARDAMOS EL ESTADO DE LO QUE ESTA PUESTO
let capasActivas = {
  rubor: null,
  sombra: null,
  labial: null
};

// 2. Leer la URL
const params = new URLSearchParams(window.location.search);
const tipoURL = params.get('tipo');
const idURL = params.get('id');

// 3. Inicializacion
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

    try {
      productosDeAPI = await obtenerProductosAPI();
    } catch (error) {
      console.error('No se pudieron cargar los productos de la API');
    }

    el.loader.style.display = 'none';
    prepararMenus();

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

// 4. Menús
function prepararMenus() {
  el.selCat.addEventListener('change', (e) => {
    const cat = e.target.value;
    if (cat && productos[cat]) {
      llenarMenuProductos(cat);
      categoria = cat;
      
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

  // Boton para borrar todo el maquillaje
  if (el.btnLimpiar) {
    el.btnLimpiar.addEventListener('click', () => {
      makeup?.clearAll?.();
      capasActivas.rubor = null;
      capasActivas.sombra = null;
      capasActivas.labial = null;
      el.paleta.innerHTML = ''; // Limpiamos los circulitos para que se vea que se borro
    });
  }
}

function llenarMenuProductos(cat) {
  el.selProd.innerHTML = '';
  el.selProd.disabled = false;

  if (productos[cat]) {
    productos[cat].forEach(prod => {
      const opt = document.createElement('option');
      opt.value = prod.id;
      opt.textContent = `🏠 ${prod.nombre}`; 
      el.selProd.appendChild(opt);
    });
  }

  const apiFiltrados = productosDeAPI.filter(p => p.tipo === cat);
  apiFiltrados.forEach(prod => {
    const opt = document.createElement('option');
    opt.value = prod.id;
    opt.textContent = `🌐 ${prod.nombre}`;
    el.selProd.appendChild(opt);
  });
}

// 5. Dibujar paleta de colores
function cargarProductoEnAR(prod) {
  el.producto.textContent = prod.nombre;
  el.paleta.innerHTML = '';
  
  prod.tonos.forEach((tono, i) => {
    const sw = document.createElement('div');
    sw.className = 'color-swatch';
    sw.style.background = tono.color;
    
    // Marco el tono activo
    if (capasActivas[categoria] === tono.color) {
      sw.classList.add('activo');
    }

    sw.addEventListener('click', () => {
      aplicarCapa(categoria, tono.color);
      
      // Actualizamos los bordes visuales
      el.paleta.querySelector('.activo')?.classList.remove('activo');
      sw.classList.add('activo');
    });

    el.paleta.appendChild(sw);
  });

  // Si no hay ninguna capa activa en esta categorIa, aplicamos la primera por defecto
  if (!capasActivas[categoria] && prod.tonos.length > 0) {
    aplicarCapa(categoria, prod.tonos[0].color);
    el.paleta.querySelector('.color-swatch')?.classList.add('activo');
  }
}

// 6. CAPAS
function aplicarCapa(cat, color) {
  const tipo = TIPOS_SDK[cat];
  if (!tipo || !makeup) return;

  // 1. Guardamos el color nuevo en la memoria
  capasActivas[cat] = color;

  // 2. Borramos TODO el maquillaje de la cara
  makeup.clearAll();

  // 3. Volvemos a pintar las capas que SÍ queremos conservar
  for (const categoriaGuardada in capasActivas) {
    const colorGuardado = capasActivas[categoriaGuardada];
    const tipoGuardado = TIPOS_SDK[categoriaGuardada];
    
    if (colorGuardado && tipoGuardado) {
      makeup.apply(tipoGuardado, {
        color: colorGuardado,
        opacity: 1.0,
        finish: 'matte',
      });
    }
  }
}

// 7. Eventos generales
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