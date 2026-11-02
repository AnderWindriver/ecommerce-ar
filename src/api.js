// src/api.js
export async function obtenerProductosAPI(tipo = '') {
  try {
    const url = tipo 
      ? `http://localhost:3000/api/productos?tipo=${tipo}` 
      : 'http://localhost:3000/api/productos';
      
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error('Error al conectar con el servidor');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error trayendo productos de la API:', error);
    return [];
  }
}