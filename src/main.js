import { OpenMakeup } from 'open-makeup-sdk';
import './style.css';

// Elementos de la UI
const el = {
  video:      document.getElementById('camera'),
  canvas:     document.getElementById('output'),
  categoria:  document.getElementById('selector-categoria'),
  producto:   document.getElementById('texto-producto'),
  precio:     document.getElementById('texto-precio'),
  panel:      document.getElementById('panel-control'),
  info:       document.getElementById('info-panel'),
  btnFloat:   document.getElementById('btn-flotante'),
  paletaBox:  document.getElementById('bloque-paleta'),
  intBox:     document.getElementById('bloque-intensidad'),
  paleta:     document.getElementById('paleta-colores'),
  sliderInt:  document.getElementById('sl-intensidad'),
  valInt:     document.getElementById('val-int'),
  loader:     document.getElementById('indicador-carga'),
};

// Leer parámetros de la URL (vienen del botón "Probar en AR")
const params = new URLSearchParams(window.location.search);
const tipoURL = params.get('tipo');
const colorURL = params.get('color');

const categoriaInicial = tipoURL || 'labial';
const colorInicial = colorURL ? decodeURIComponent(colorURL) : null;


// Colores disponibles por categoría
const PALETAS = {
  rubor:  ['#FFB6C1', '#FF6B9D', '#E91E63', '#C2185B', '#FF8A80', '#D2691E'],
  sombra: ['#9B6BFF', '#6B9BFF', '#4CAF50', '#FFC107', '#795548', '#212121', '#E91E63'],
  labial: ['#FF5252', '#E91E63', '#C2185B', '#8E24AA', '#B71D1D', '#FF8A80', '#6D4C41'],
};

// El SDK usa estos nombres internamente
const TIPOS_SDK = {
  labial: 'lipstick',
  sombra: 'eyeshadow',
  rubor:  'blush',
};

let categoria = 'labial';
let colorActual = '#E91E63';
let makeup = null;


async function iniciar() {
  try {
    el.loader.textContent = 'Pidiendo permiso de cámara...';
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });
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
    cargarCategoria(categoriaInicial);
    if (colorInicial) {
  colorActual = colorInicial;
  aplicar(categoriaInicial, colorInicial);
}
  } catch (err) {
    console.error(err);
    el.loader.textContent = 'Error: ' + err.message;
  }
}


function cargarCategoria(cat) {
  categoria = cat;

  // Sin categoría: apagar todo y salir
  if (cat === 'ninguno') {
    makeup?.clearAll?.();
    el.producto.textContent = 'Sin maquillaje';
    el.precio.textContent = '';
    el.paletaBox.style.display = 'none';
    el.intBox.style.display = 'none';
    return;
  }

  makeup?.clearAll?.();

  el.paletaBox.style.display = 'block';
  el.intBox.style.display = 'block';
  el.producto.textContent = cat[0].toUpperCase() + cat.slice(1);
  el.precio.textContent = '';

  pintarPaleta(cat);
  colorActual = PALETAS[cat][0];
  aplicar(cat, colorActual);
}


function aplicar(cat, color) {
  const tipo = TIPOS_SDK[cat];
  if (!tipo || !makeup) return;

  makeup.apply(tipo, {
    color,
    opacity: parseFloat(el.sliderInt.value),
    finish: 'glossy',
  });
}


function pintarPaleta(cat) {
  el.paleta.innerHTML = '';

  PALETAS[cat].forEach((hex, i) => {
    const sw = document.createElement('div');
    sw.className = 'color-swatch';
    sw.style.background = hex;
    if (i === 0) sw.classList.add('activo');

    sw.addEventListener('click', () => {
      colorActual = hex;
      aplicar(cat, hex);
      el.paleta.querySelector('.activo')?.classList.remove('activo');
      sw.classList.add('activo');
    });

    el.paleta.appendChild(sw);
  });
}


// Cambiar de categoría
el.categoria.addEventListener('change', (e) => cargarCategoria(e.target.value));

// Slider de intensidad
el.sliderInt.addEventListener('input', (e) => {
  el.valInt.textContent = parseFloat(e.target.value).toFixed(2);
});
el.sliderInt.addEventListener('change', () => {
  if (categoria !== 'ninguno') aplicar(categoria, colorActual);
});

// Mostrar / ocultar panel
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
