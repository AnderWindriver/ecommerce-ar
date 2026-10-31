import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mapeo de categorias para la API publica
const CATEGORIAS = {
  rubor: 'blush',
  labial: 'lipstick',
  sombra: 'eyeshadow'
};

// Tasa de cambio (la API devuelve en dolares)
const TIPO_CAMBIO = 1500;

app.get('/api/productos', async (req, res) => {
  try {
    const tipo = req.query.tipo; // 'rubor', 'labial', 'sombra' o vacio
    const tiposABuscar = tipo ? [tipo] : Object.keys(CATEGORIAS);
    let productosFinales = [];

    for (const cat of tiposABuscar) {
      const tipoAPI = CATEGORIAS[cat];
      if (!tipoAPI) continue;

      const url = `https://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline&product_type=${tipoAPI}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Error al traer ${cat} de la API`);
        continue;
      }

      const data = await response.json();

      // Procesamos cada producto para que encaje en el frontend
      const productosMapeados = data.map(p => {
        // 1. Limpiamos el nombre de la marca
        let nombreLimpio = p.name;
        if (nombreLimpio.toLowerCase().includes('maybelline')) {
          nombreLimpio = nombreLimpio.replace(/maybelline/gi, '').trim();
        }

        // 2. Extraemos los colores. Si la API no trae, ponemos uno por defecto
        const coloresArray = p.product_colors?.map(c => ({
          nombre: c.colour_name,
          color: c.hex_value
        })) || [{ nombre: 'Unico', color: '#E91E63' }];

        // 3. Retornamos el producto armado
        return {
          id: `api-${p.id}`,
          tipo: cat,
          nombre: nombreLimpio || p.name, // Si quedó vacío, dejamos el original
          marca: p.brand || 'Maybelline',
          precio: Math.round(parseFloat(p.price || 10) * TIPO_CAMBIO),
          descripcion: p.description || 'Sin descripcion disponible.',
          imagen: p.image_link || 'https://via.placeholder.com/300',
          tonos: coloresArray.slice(0, 5) // Limitamos a 5 para no saturar
        };
      });

      productosFinales = productosFinales.concat(productosMapeados);
    }

    res.json(productosFinales);
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor API corriendo en http://localhost:${PORT}/api/productos`);
});