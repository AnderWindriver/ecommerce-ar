// Catalogo de productos.
// Cada producto tiene una lista de tonos disponibles.


export const productos = {

  rubor: [
    {
      id: 'r1',
      nombre: 'Rubor Líquido Sunkisser',
      precio: 18500,
      descripcion: 'Rubor líquido con acabado glow. Se funde con la piel al instante y dura todo el día.',
      tonos: [
        { nombre: 'CITY SIZZLE', color: '#F4A79A', imagen: '/img/rubor-1-a.jpg' },
        { nombre: 'ROSE',        color: '#D4746C', imagen: '/img/rubor-1-b.jpg' },
        { nombre: 'ROSA FUEGO',  color: '#E56B80', imagen: '/img/rubor-1-c.jpg' },
      ],
    },
    {
      id: 'r2',
      nombre: 'Rubor en Polvo Fit Me',
      precio: 15200,
      descripcion: 'Polvo compacto de larga duración. Acabado natural, ideal para todos los días.',
      tonos: [
        { nombre: 'NUDE',    color: '#E8B4A0', imagen: '/img/rubor-2-a.jpg' },
        { nombre: 'MAUVE',   color: '#B56576', imagen: '/img/rubor-2-b.jpg' },
        { nombre: 'CORAL',   color: '#F08080', imagen: '/img/rubor-2-c.jpg' },
      ],
    },
    {
      id: 'r3',
      nombre: 'Rubor Cremoso Cheek Heat',
      precio: 16800,
      descripcion: 'Textura cremosa que se difumina fácil. Se puede usar en mejillas y labios.',
      tonos: [
        { nombre: 'ROSA',    color: '#E56B80', imagen: '/img/rubor-3-a.jpg' },
        { nombre: 'DURAZNO', color: '#F5A88D', imagen: '/img/rubor-3-b.jpg' },
      ],
    },
  ],

  labial: [
    {
      id: 'l1',
      nombre: 'Labial Mate Super Stay',
      precio: 21000,
      descripcion: 'Labial líquido de larga duración. Acabado mate intenso que no se corre.',
      tonos: [
        { nombre: 'ROJO CLÁSICO', color: '#B71D1D', imagen: '/img/labial-1-a.jpg' },
        { nombre: 'FRAMBUESA',    color: '#8E24AA', imagen: '/img/labial-1-b.jpg' },
        { nombre: 'NUDE',         color: '#6D4C41', imagen: '/img/labial-1-c.jpg' },
      ],
    },
    {
      id: 'l2',
      nombre: 'Labial Cremoso Color Sensational',
      precio: 19400,
      descripcion: 'Fórmula cremosa con manteca de karité. Color intenso desde la primera pasada.',
      tonos: [
        { nombre: 'ROSA INTENSO', color: '#E91E63', imagen: '/img/labial-2-a.jpg' },
        { nombre: 'CORAL',        color: '#FF5252', imagen: '/img/labial-2-b.jpg' },
        { nombre: 'CIRUELA',      color: '#6A1B9A', imagen: '/img/labial-2-c.jpg' },
      ],
    },
    {
      id: 'l3',
      nombre: 'Labial Gloss Vinyl Ink',
      precio: 23500,
      descripcion: 'Brillo tipo vinilo con alta pigmentación. Sensación liviana y no pegajosa.',
      tonos: [
        { nombre: 'FRAMBUESA', color: '#C2185B', imagen: '/img/labial-3-a.jpg' },
        { nombre: 'DURAZNO',   color: '#FF8A80', imagen: '/img/labial-3-b.jpg' },
      ],
    },
  ],

  sombra: [
    {
      id: 's1',
      nombre: 'Paleta Nudes of New York',
      precio: 32000,
      descripcion: 'Doce tonos neutros para looks de día y de noche. Textura suave y pigmentada.',
      tonos: [
        { nombre: 'VIOLETA', color: '#9B6BFF', imagen: '/img/sombra-1-a.jpg' },
        { nombre: 'MARRÓN',  color: '#795548', imagen: '/img/sombra-1-b.jpg' },
      ],
    },
    {
      id: 's2',
      nombre: 'Sombra Líquida Chrome',
      precio: 18900,
      descripcion: 'Sombra líquida con acabado metálico. Aplicación fácil con el dedo o pincel.',
      tonos: [
        { nombre: 'PLATA',  color: '#6B9BFF', imagen: '/img/sombra-2-a.jpg' },
        { nombre: 'DORADO', color: '#FFC107', imagen: '/img/sombra-2-b.jpg' },
      ],
    },
    {
      id: 's3',
      nombre: 'Cuarteto The City Mini',
      precio: 26500,
      descripcion: 'Cuatro tonos que combinan entre sí. Ideal para llevar en la cartera.',
      tonos: [
        { nombre: 'TIERRA', color: '#795548', imagen: '/img/sombra-3-a.jpg' },
        { nombre: 'ROSA',   color: '#E91E63', imagen: '/img/sombra-3-b.jpg' },
      ],
    },
  ],
};


// Buscar un producto por categoría e id
export function buscarProducto(tipo, id) {
  const lista = productos[tipo] || [];
  return lista.find(p => p.id === id);
}