//para correr usar: node js/api.js

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';
import cors from 'cors';
import { Channel3 } from '@channel3/sdk';

// Configuración inicial de la aplicación Express
const app = express();
const PORT = 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Verificación de seguridad de variables de entorno
if (!process.env.CHANNEL3_API_KEY) {
  console.error('❌ Error: La variable de entorno CHANNEL3_API_KEY no está definida. Por favor, configúrala en tu archivo .env.local.');
  process.exit(1);
}

// Inicialización del cliente de Channel3
const channel3 = new Channel3({ apiKey: process.env.CHANNEL3_API_KEY });

// Constantes de negocio
const TIPO_CAMBIO_ARS = 1500;          // Tasa de conversión de USD a Pesos Argentinos
const MINIMO_POR_CATEGORIA = 12;       // Cantidad mínima requerida por cada categoría

// Mapeo y configuración de categorías (IDs y términos de búsqueda)
const CATEGORIAS_CONFIG = [
    { id_cat: 1, query: 'Maybelline blush', tipo: 'rubor' },
    { id_cat: 2, query: 'Maybelline lipstick', tipo: 'labial' },
    { id_cat: 3, query: 'Maybelline eyeshadow', tipo: 'sombra' },
];

/**
 * Función asíncrona para consultar productos en la API de Channel3 por palabra clave.
 */
async function obtenerProductosPorQuery(query, limite = MINIMO_POR_CATEGORIA) {
  try {
    const results = await channel3.products.search({ query, limit: 25 });
    const items = results?.response?.products || results?.data || results?.products || [];

    return items.slice(0, limite);
  } catch (err) {
    console.error(`❌ Error buscando "${query}":`, err.message);
    return [];
  }
}
/**
 * Extrae la URL de la imagen principal del producto de manera segura.
 */
function extraerImagen(p) {
  if (!p.images || p.images.length === 0) {
    return p.image_url || 'https://via.placeholder.com/300';
  }

  // 1. Buscamos si hay una imagen principal o de tipo 'hero' (foto de producto limpia)
  const mainImage = 
    p.images.find((img) => img.is_main_image) ||
    p.images.find((img) => img.shot_type === 'hero') ||
    p.images[0];

  // 2. Aplicamos la regla de la doc: preferir 'cleaned_url' si existe, de lo contrario 'url'
  return mainImage.cleaned_url ?? mainImage.url ?? 'https://via.placeholder.com/300';
}

/**
 * Extrae el precio en dólares desde la estructura de ofertas de Channel3.
 */
function extraerPrecioUSD(p) {
  // Busca en la primera oferta de un retailer, contemplando tanto 'price' como 'amount'
  const primeraOferta = p.offers?.[0]?.price;
  return primeraOferta?.price ?? primeraOferta?.amount ?? p.price?.price ?? 10.0;
}

// ==========================================
// ENDPOINT PRINCIPAL: GET /api/productos
// ==========================================
app.get('/api/productos', async (req, res) => {
  try {
    const { tipo } = req.query; // Permite filtrar opcionalmente por ?tipo=labial, etc.
    let categoriasAProcesar = CATEGORIAS_CONFIG;

    // Si el usuario especifica un tipo, filtramos solo esa categoría
    if (tipo) {
      const filtrada = CATEGORIAS_CONFIG.find(
        (c) => c.tipo === String(tipo).toLowerCase()
      );
      if (filtrada) {
        categoriasAProcesar = [filtrada];
      }
    }

    let productosFinales = [];

    // Iteramos sobre las categorías seleccionadas para recolectar los productos
    for (const cat of categoriasAProcesar) {
      console.log(`🔍 Consultando categoría: ${cat.tipo} (${cat.query})...`);
      const rawProducts = await obtenerProductosPorQuery(cat.query, MINIMO_POR_CATEGORIA);

      // Mapeamos los datos crudos al formato exacto que necesita tu frontend / base de datos
      const mapeados = rawProducts.map((p) => {
        const precioUSD = extraerPrecioUSD(p);
        const marcaOficial = p.brands?.[0]?.name || 'Maybelline';      
        // Extraemos colores de structured_attributes o colors de forma segura
        const colores = p.colors?.map((c) => c.hex || c.name).filter(Boolean).join(', ') || 'Variados';

          return {
            id: p.id,                        // ID único y canónico de Channel3
            id_cat: cat.id_cat,              // 1: Rubor, 2: Labial, 3: Sombra
            nombre: p.title,                 // Título oficial del producto
            marca: marcaOficial,             // Marca extraída del schema oficial
            descripcion: p.description || 'Sin descripción disponible.',
            color: colores,
            precio_ars: Math.round(precioUSD * TIPO_CAMBIO_ARS), // Conversión aplicada
            imagen_url: extraerImagen(p),    // Imagen limpia procesada con cleaned_url / hero
            };
      });

      productosFinales.push(...mapeados);
    }

    // Retornamos el JSON con todos los productos procesados
    res.json(productosFinales);
  } catch (error) {
    console.error('❌ Error general en /api/productos:', error);
    res.status(500).json({ error: error.message || 'Error al obtener los productos' });
  }
});

// Inicialización del servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}/api/productos`);
});
