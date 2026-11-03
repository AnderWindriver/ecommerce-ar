import { supabase } from '../js/login.js';

/**
 * Obtiene los productos del carrito actual desde Supabase.
 * Devuelve siempre un array para evitar errores de renderizado.
 */
export async function obtenerCarrito() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];

    // Buscamos el carrito activo del usuario
    const { data: carrito, error: carritoError } = await supabase
      .from('carritos')
      .select('id_carrito')
      .eq('id_usuario', user.id)
      .eq('estado', 'activo')
      .maybeSingle();

    if (carritoError || !carrito) return [];

    // Traemos los ítems asociados a ese carrito junto con la info de la tabla productos
    const { data: items, error: itemsError } = await supabase
      .from('items_carrito')
      .select(`
        id_item,
        cant,
        tonos,
        productos (
          id_prod,
          nombre,
          precio,
          imagen_url
        )
      `)
      .eq('id_carrito', carrito.id_carrito);

    if (itemsError || !items) return [];

    // Mapeamos los datos para que sean fáciles de leer en tu frontend
    return items.map(item => ({
      id_item: item.id_item,
      id: item.productos?.id_prod || '',
      nombre: item.productos?.nombre || 'Producto',
      precio: item.productos?.precio || 0,
      imagen: item.productos?.imagen_url || '',
      tono: item.tonos,
      cantidad: item.cant
    }));

  } catch (error) {
    console.error('❌ Error al obtener el carrito:', error.message);
    return [];
  }
}

/**
 * Agrega un producto (con su tono y cantidad) al carrito persistente de Supabase.
 */
export async function agregarAlCarrito(prod, tono, cantidad = 1) {
  try {
    // 🚀 EFECTO INSTANTÁNEO (Optimistic UI): Actualizamos el contador visualmente YA MISMO
    const contador = document.getElementById('contador-carrito');
    if (contador) {
      const actual = parseInt(contador.textContent) || 0;
      contador.textContent = actual + cantidad;
    }

    // 1. Verificar que el usuario haya iniciado sesión
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      alert('Debes iniciar sesión para guardar productos en tu carrito.');
      window.location.href = '/login.html';
      // Si no está logueado, revertimos el contador visual
      window.dispatchEvent(new CustomEvent('carritoActualizado'));
      return false;
    }

    // 2. Mapeo de categorías (1: rubor, 2: labial, 3: sombra)
    const catMap = { rubor: 1, labial: 2, sombra: 3 };
    const idCat = catMap[prod.tipo] || 1;

    // 3. Asegurar que el producto exista en la tabla 'productos' (Upsert)
    const { error: prodError } = await supabase
      .from('productos')
      .upsert({
        id_prod: prod.id,
        id_cat: idCat,
        nombre: prod.nombre,
        precio: prod.precio,
        imagen_url: prod.imagen,
        descripcion: prod.descripcion || 'Sin descripción disponible.',
        tonos: prod.tonos
      }, { onConflict: 'id_prod' });

    if (prodError) throw new Error('Error al registrar el producto: ' + prodError.message);

    // 4. Buscar si el usuario ya tiene un carrito activo
    let { data: carrito, error: carritoError } = await supabase
      .from('carritos')
      .select('id_carrito')
      .eq('id_usuario', user.id)
      .eq('estado', 'activo')
      .maybeSingle();

    if (carritoError) throw new Error('Error al buscar el carrito: ' + carritoError.message);

    if (!carrito) {
      const { data: nuevoCarrito, error: crearError } = await supabase
        .from('carritos')
        .insert({
          id_usuario: user.id,
          estado: 'activo'
        })
        .select('id_carrito')
        .single();

      if (crearError) throw new Error('Error al crear el carrito: ' + crearError.message);
      carrito = nuevoCarrito;
    }

    // 5. Verificar si ya existe este producto con EL MISMO TONO
    const { data: itemsExistentes, error: queryError } = await supabase
      .from('items_carrito')
      .select('id_item, cant, tonos')
      .eq('id_carrito', carrito.id_carrito)
      .eq('id_prod', prod.id);

    if (queryError) throw new Error('Error al verificar ítems existentes: ' + queryError.message);

    const itemCoincidente = itemsExistentes?.find(item => {
      return item.tonos?.color === tono.color;
    });

    if (itemCoincidente) {
      const nuevaCantidad = itemCoincidente.cant + cantidad;
      const { error: updateError } = await supabase
        .from('items_carrito')
        .update({ cant: nuevaCantidad })
        .eq('id_item', itemCoincidente.id_item);

      if (updateError) throw new Error('Error al actualizar la cantidad: ' + updateError.message);
    } else {
      const { error: itemError } = await supabase
        .from('items_carrito')
        .insert({
          id_carrito: carrito.id_carrito,
          id_prod: prod.id,
          cant: cantidad,
          tonos: tono 
        });

      if (itemError) throw new Error('Error al agregar el ítem al carrito: ' + itemError.message);
    }

    // Sincronizamos por seguridad con el valor real de la base de datos al finalizar
    window.dispatchEvent(new CustomEvent('carritoActualizado'));
    return true;

  } catch (error) {
    console.error('❌ Error en agregarAlCarrito:', error.message);
    alert('No se pudo agregar el producto al carrito. Inténtalo de nuevo.');
    // Si hay error, recalculamos con la realidad de la BD para corregir el contador visual
    window.dispatchEvent(new CustomEvent('carritoActualizado'));
    return false;
  }
}
/**
 * Borra un producto del carrito en Supabase por su ID de ítem.
 */
export async function borrarDelCarrito(idItem) {
  try {
    const { error } = await supabase
      .from('items_carrito')
      .delete()
      .eq('id_item', idItem);

    if (error) throw error;
    console.log('🗑️ Ítem eliminado del carrito.');
    return true;
  } catch (error) {
    console.error('❌ Error al borrar del carrito:', error.message);
    return false;
  }
}
