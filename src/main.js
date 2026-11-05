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
  linkCatalogo: document.getElementById('btn-volver-catalogo'),
  btnFloat: document.getElementById('btn-flotante'),
  btnLimpiar: document.getElementById('btn-limpiar'),
  btnAgregarCarrito: document.getElementById('btn-agregar-carrito'),
  estadoCarrito: document.getElementById('estado-carrito-ar'),
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
const productosActivos = {
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
        actualizarEnlaceCatalogo(tipoURL);
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
  actualizarEnlaceCatalogo('labial');
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
      actualizarEnlaceCatalogo(cat);
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
      productosActivos.rubor = null;
      productosActivos.sombra = null;
      productosActivos.labial = null;
      el.paleta.innerHTML = ''; // Limpiamos los circulitos para que se vea que se borro
      actualizarBotonCarrito();
    });
  }

  el.btnAgregarCarrito?.addEventListener('click', agregarSeleccionadosAlCarrito);
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

function actualizarEnlaceCatalogo(cat) {
  if (el.linkCatalogo && productos[cat]) {
    el.linkCatalogo.href = `/html/${cat}.html`;
  }
}

// 5. Dibujar paleta de colores
function cargarProductoEnAR(prod) {
  el.producto.textContent = prod.nombre;
  el.paleta.innerHTML = '';

  const tonos = prod.tonos?.length
    ? prod.tonos
    : [{ nombre: 'Único', color: '#E91E63' }];
  const tonoSeleccionado =
    tonos.find((tono) => tono.color === capasActivas[categoria]) || tonos[0];
  productosActivos[categoria] = { producto: prod, tono: tonoSeleccionado };
  capasActivas[categoria] = tonoSeleccionado.color;

  tonos.forEach((tono) => {
    const sw = document.createElement('div');
    sw.className = 'color-swatch';
    sw.style.background = tono.color;
    
    // Marco el tono activo
    if (tonoSeleccionado === tono) {
      sw.classList.add('activo');
    }

    sw.addEventListener('click', () => {
      productosActivos[categoria] = { producto: prod, tono };
      aplicarCapa(categoria, tono.color);
      
      // Actualizamos los bordes visuales
      el.paleta.querySelector('.activo')?.classList.remove('activo');
      sw.classList.add('activo');
      actualizarBotonCarrito();
    });

    el.paleta.appendChild(sw);
  });

  aplicarCapa(categoria, tonoSeleccionado.color);
  actualizarBotonCarrito();
}

function actualizarBotonCarrito() {
  if (!el.btnAgregarCarrito) return;

  const cantidad = Object.values(productosActivos).filter(Boolean).length;
  el.btnAgregarCarrito.disabled = cantidad === 0;
  el.btnAgregarCarrito.textContent = cantidad
    ? `Agregar ${cantidad} ${cantidad === 1 ? 'producto seleccionado' : 'productos seleccionados'} al carrito`
    : 'Agregar seleccionados al carrito';
}

async function agregarSeleccionadosAlCarrito() {
  const seleccionados = Object.entries(productosActivos)
    .filter(([, seleccion]) => seleccion)
    .map(([tipo, seleccion]) => ({ ...seleccion, tipo }));
  if (seleccionados.length === 0 || !el.btnAgregarCarrito) return;

  el.btnAgregarCarrito.disabled = true;
  el.estadoCarrito.textContent = 'Agregando productos al carrito...';
  el.estadoCarrito.classList.remove('error');

  try {
    const { agregarAlCarrito } = await import('./carrito.js');
    let agregados = 0;

    for (const { producto, tono, tipo } of seleccionados) {
      const resultado = await agregarAlCarrito({ ...producto, tipo }, tono);
      if (!resultado) break;
      agregados += 1;
    }

    if (agregados === seleccionados.length) {
      el.estadoCarrito.textContent =
        `${agregados} ${agregados === 1 ? 'producto agregado' : 'productos agregados'} al carrito.`;
    } else if (agregados > 0) {
      el.estadoCarrito.textContent =
        `Se agregaron ${agregados} de ${seleccionados.length} productos. Revisá el carrito.`;
      el.estadoCarrito.classList.add('error');
    } else {
      el.estadoCarrito.textContent =
        'No se pudieron agregar los productos. Iniciá sesión y volvé a intentarlo.';
      el.estadoCarrito.classList.add('error');
    }
  } catch (error) {
    console.error('No se pudieron agregar los productos del probador:', error);
    el.estadoCarrito.textContent = 'No se pudieron agregar los productos al carrito.';
    el.estadoCarrito.classList.add('error');
  } finally {
    actualizarBotonCarrito();
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