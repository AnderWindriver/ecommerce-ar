import { productos } from './productos.js';
import { obtenerProductosAPI } from './api.js';

const formatoPrecio = (precio) => `$${Number(precio).toLocaleString('es-AR')}`;

function normalizarTexto(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-AR')
    .trim();
}

function obtenerNombreTono(tono) {
  return typeof tono === 'string' ? tono : tono?.nombre ?? tono?.color;
}

function crearControl({ etiqueta, id, tipo, placeholder, min, step }) {
  const grupo = document.createElement('label');
  grupo.className = 'filtro-catalogo';
  grupo.htmlFor = id;

  const texto = document.createElement('span');
  texto.textContent = etiqueta;

  const control = document.createElement(tipo === 'select' ? 'select' : 'input');
  control.id = id;
  control.name = id;

  if (tipo !== 'select') {
    control.type = tipo;
    if (placeholder) control.placeholder = placeholder;
    if (min !== undefined) control.min = String(min);
    if (step !== undefined) control.step = String(step);
  }

  grupo.append(texto, control);
  return { grupo, control };
}

function crearControles(grilla, tipo) {
  const controles = document.createElement('section');
  controles.className = 'controles-catalogo';
  controles.setAttribute('aria-label', 'Buscar, filtrar y ordenar productos');

  const titulo = document.createElement('h2');
  titulo.className = 'sr-only';
  titulo.textContent = 'Buscar y filtrar productos';

  const { grupo: grupoBusqueda, control: busqueda } = crearControl({
    etiqueta: 'Buscar por nombre o marca',
    id: `busqueda-${tipo}`,
    tipo: 'search',
    placeholder: 'Ej.: Maybelline, labial...',
  });
  busqueda.autocomplete = 'off';

  const { grupo: grupoMinimo, control: precioMinimo } = crearControl({
    etiqueta: 'Precio mínimo',
    id: `precio-minimo-${tipo}`,
    tipo: 'number',
    placeholder: 'Sin mínimo',
    min: 0,
    step: 100,
  });

  const { grupo: grupoMaximo, control: precioMaximo } = crearControl({
    etiqueta: 'Precio máximo',
    id: `precio-maximo-${tipo}`,
    tipo: 'number',
    placeholder: 'Sin máximo',
    min: 0,
    step: 100,
  });

  const { grupo: grupoTono, control: tono } = crearControl({
    etiqueta: 'Tono',
    id: `filtro-tono-${tipo}`,
    tipo: 'select',
  });
  const todosLosTonos = document.createElement('option');
  todosLosTonos.value = '';
  todosLosTonos.textContent = 'Todos los tonos';
  tono.appendChild(todosLosTonos);

  const { grupo: grupoOrden, control: orden } = crearControl({
    etiqueta: 'Ordenar por precio',
    id: `orden-precio-${tipo}`,
    tipo: 'select',
  });
  [
    { valor: '', texto: 'Sin ordenar' },
    { valor: 'asc', texto: 'Menor a mayor' },
    { valor: 'desc', texto: 'Mayor a menor' },
  ].forEach(({ valor, texto }) => {
    const opcion = document.createElement('option');
    opcion.value = valor;
    opcion.textContent = texto;
    orden.appendChild(opcion);
  });

  const limpiar = document.createElement('button');
  limpiar.type = 'button';
  limpiar.className = 'btn-limpiar-filtros';
  limpiar.textContent = 'Limpiar filtros';

  const estado = document.createElement('p');
  estado.className = 'estado-catalogo';
  estado.setAttribute('role', 'status');
  estado.setAttribute('aria-live', 'polite');

  controles.append(
    titulo,
    grupoBusqueda,
    grupoMinimo,
    grupoMaximo,
    grupoTono,
    grupoOrden,
    limpiar,
    estado,
  );
  grilla.before(controles);

  return { busqueda, precioMinimo, precioMaximo, tono, orden, limpiar, estado };
}

function crearOpcionesDeTono(control, listaProductos) {
  const tonos = new Map();
  listaProductos.forEach((producto) => {
    producto.tonos?.forEach((tono) => {
      const nombre = obtenerNombreTono(tono)?.trim();
      const clave = normalizarTexto(nombre);
      if (nombre && clave && !tonos.has(clave)) tonos.set(clave, nombre);
    });
  });

  [...tonos.entries()]
    .sort((a, b) => a[1].localeCompare(b[1], 'es'))
    .forEach(([clave, nombre]) => {
      const opcion = document.createElement('option');
      opcion.value = clave;
      opcion.textContent = nombre;
      control.appendChild(opcion);
    });

  control.disabled = tonos.size === 0;
}

function coincideConFiltros(producto, filtros) {
  const consulta = normalizarTexto(filtros.busqueda.value);
  const textoProducto = normalizarTexto(
    `${producto.nombre} ${producto.marca ?? ''}`,
  );
  const precio = Number(producto.precio);
  const minimo = filtros.precioMinimo.value === ''
    ? null
    : Number(filtros.precioMinimo.value);
  const maximo = filtros.precioMaximo.value === ''
    ? null
    : Number(filtros.precioMaximo.value);
  const coincideTono = !filtros.tono.value || producto.tonos?.some((tono) =>
    normalizarTexto(obtenerNombreTono(tono)) === filtros.tono.value,
  );

  return (
    (!consulta || textoProducto.includes(consulta)) &&
    (minimo === null || precio >= minimo) &&
    (maximo === null || precio <= maximo) &&
    coincideTono
  );
}

function renderizarProductos(grilla, listaProductos, tipo, filtros) {
  const minimo = filtros.precioMinimo.value === ''
    ? null
    : Number(filtros.precioMinimo.value);
  const maximo = filtros.precioMaximo.value === ''
    ? null
    : Number(filtros.precioMaximo.value);

  if (
    (minimo !== null && minimo < 0) ||
    (maximo !== null && maximo < 0) ||
    (minimo !== null && maximo !== null && minimo > maximo)
  ) {
    grilla.replaceChildren();
    filtros.estado.textContent =
      'Los precios no pueden ser negativos y el mínimo no puede superar al máximo.';
    filtros.estado.classList.add('error');
    return;
  }

  const resultados = listaProductos.filter((producto) =>
    coincideConFiltros(producto, filtros),
  );

  if (filtros.orden.value) {
    const direccion = filtros.orden.value === 'asc' ? 1 : -1;
    resultados.sort((a, b) => direccion * (Number(a.precio) - Number(b.precio)));
  }

  grilla.replaceChildren();
  filtros.estado.classList.remove('error');

  if (resultados.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'catalogo-vacio';
    vacio.textContent = listaProductos.length
      ? 'No hay productos que coincidan con los filtros seleccionados.'
      : 'No hay productos disponibles.';
    grilla.appendChild(vacio);
    filtros.estado.textContent = listaProductos.length
      ? 'No se encontraron resultados.'
      : 'No hay productos disponibles en esta categoría.';
    return;
  }

  filtros.estado.textContent = `Mostrando ${resultados.length} ${
    resultados.length === 1 ? 'producto' : 'productos'
  }`;

  resultados.forEach((producto) => {
    const imagen = producto.imagen || producto.tonos?.[0]?.imagen;
    const tarjeta = document.createElement('a');
    tarjeta.className = 'tarjeta';
    tarjeta.href = `/html/producto.html?${new URLSearchParams({
      tipo,
      id: producto.id,
    })}`;

    const imagenProducto = document.createElement('img');
    if (imagen) imagenProducto.src = imagen;
    imagenProducto.alt = producto.nombre;
    imagenProducto.loading = 'lazy';

    const informacion = document.createElement('div');
    informacion.className = 'tarjeta-info';

    const nombre = document.createElement('div');
    nombre.className = 'tarjeta-nombre';
    nombre.textContent = producto.nombre;

    const precio = document.createElement('div');
    precio.className = 'tarjeta-precio';
    precio.textContent = formatoPrecio(producto.precio);

    informacion.append(nombre, precio);
    tarjeta.append(imagenProducto, informacion);
    grilla.appendChild(tarjeta);
  });
}

export async function cargarLista(tipo) {
  const grilla = document.getElementById('grilla');
  if (!grilla) return;

  const listaLocal = productos[tipo] || [];
  grilla.replaceChildren();

  const carga = document.createElement('p');
  carga.className = 'catalogo-vacio';
  carga.textContent = 'Cargando catálogo...';
  grilla.appendChild(carga);

  const apiProductos = await obtenerProductosAPI(tipo);
  const todosLosProductos = [...listaLocal, ...apiProductos];
  const filtros = crearControles(grilla, tipo);
  crearOpcionesDeTono(filtros.tono, todosLosProductos);

  const actualizar = () =>
    renderizarProductos(grilla, todosLosProductos, tipo, filtros);

  [filtros.busqueda, filtros.precioMinimo, filtros.precioMaximo].forEach(
    (control) => control.addEventListener('input', actualizar),
  );
  [filtros.tono, filtros.orden].forEach((control) =>
    control.addEventListener('change', actualizar),
  );
  filtros.limpiar.addEventListener('click', () => {
    filtros.busqueda.value = '';
    filtros.precioMinimo.value = '';
    filtros.precioMaximo.value = '';
    filtros.tono.value = '';
    filtros.orden.value = '';
    actualizar();
    filtros.busqueda.focus();
  });

  actualizar();
}
