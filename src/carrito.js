
//  GUARDA UN JSON EN LA MEMORIA DEL USUARIO COMO PRUEBA
// ESTO PUEDE CAMBIAR AL ACTUALIZAR LA BASE DE DATOS DEL PROYECTO
// Obtener el carrito desde la memoria del navegador
export function obtenerCarrito() {
  const guardado = localStorage.getItem('carrito_ar');
  return guardado ? JSON.parse(guardado) : [];
}

//Guardar el carrito en la memoria
function guardarCarrito(carrito) {
  localStorage.setItem('carrito_ar', JSON.stringify(carrito));
}

// Agregar un producto (con su tono y cantidad)
export function agregarAlCarrito(prod, tono) {
  const carrito = obtenerCarrito();
  
  // Busco si ya esta
  const index = carrito.findIndex(item => item.id === prod.id && item.tono.color === tono.color);
  
  if (index !== -1) {
    // Si ya existe, sumamos 1 a la cantidad
    carrito[index].cantidad += 1;
  } else {
    // Si es nuevo, lo agregamos con cantidad 1
    carrito.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      tono: tono, // Guardamos el nombre y el color del tono
      cantidad: 1
    });
  }
  
  guardarCarrito(carrito);
}

// Borrar un producto (por su ID y color de tono)
export function borrarDelCarrito(id, colorTono) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(item => !(item.id === id && item.tono.color === colorTono));
  guardarCarrito(carrito);
}