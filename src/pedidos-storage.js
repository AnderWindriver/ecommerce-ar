import { supabase } from "../js/login.js";

/**
 * Procesa la compra del carrito activo del usuario.
 *
 * Supabase JS no soporta transacciones desde el cliente, así que la
 * "atomicidad" se logra con rollback compensatorio: si falla un paso
 * posterior, se eliminan los registros creados en los pasos anteriores.
 *
 * @param {string} idUsuario - UUID del usuario autenticado.
 * @returns {Promise<{ id_pedido: number|string, total_ars: number }>}
 */
export async function procesarCompra(idUsuario) {
  // 1. Carrito activo + items + datos del producto
  const { data: carrito, error: errCarrito } = await supabase
    .from("carritos")
    .select(
      `
      id_carrito,
      items_carrito (
        id_item,
        id_prod,
        cant,
        tonos,
        productos ( id_prod, nombre, precio )
      )
    `,
    )
    .eq("id_usuario", idUsuario)
    .eq("estado", "activo")
    .order("id_carrito", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errCarrito) {
    throw new Error(`No se pudo consultar el carrito: ${errCarrito.message}`);
  }
  if (!carrito || !carrito.items_carrito?.length) {
    throw new Error("No hay un carrito activo con productos.");
  }

  // Validar que cada item tenga un producto existente en la BD
  const items = carrito.items_carrito;
  const invalido = items.find((i) => !i.productos);
  if (invalido) {
    throw new Error("Un producto del carrito ya no está disponible.");
  }

  // 2. Total en ARS
  const total_ars = items.reduce(
    (acc, i) => acc + Number(i.cant) * Number(i.productos.precio),
    0,
  );

  // 3. Pedido principal
  const { data: pedido, error: errPedido } = await supabase
    .from("pedidos")
    .insert({
      id_usuario: idUsuario,
      total_ars,
      fecha_creacion: new Date().toISOString(),
    })
    .select("id_pedido")
    .single();

  if (errPedido) {
    throw new Error(`No se pudo crear el pedido: ${errPedido.message}`);
  }
  const id_pedido = pedido.id_pedido;

  // Rollback compensatorio
  const revertir = async () => {
    await supabase.from("items_pedido").delete().eq("id_pedido", id_pedido);
    await supabase.from("pedidos").delete().eq("id_pedido", id_pedido);
  };

  try {
    // 4. Items del pedido (id_prod validado por la BD vía el join)
    const itemsPedido = items.map((i) => ({
      id_pedido,
      id_prod: i.productos.id_prod,
      cantidad: i.cant,
      precio_unitario: i.productos.precio,
      tono: i.tonos ?? null,
    }));

    const { error: errItems } = await supabase
      .from("items_pedido")
      .insert(itemsPedido);
    if (errItems) {
      throw new Error(`No se pudieron guardar los items: ${errItems.message}`);
    }

    // 5. Cerrar el carrito
    const { error: errEstado } = await supabase
      .from("carritos")
      .update({ estado: "completado" })
      .eq("id_carrito", carrito.id_carrito)
      .eq("estado", "activo");
    if (errEstado) {
      throw new Error(`No se pudo cerrar el carrito: ${errEstado.message}`);
    }
  } catch (error) {
    await revertir();
    throw error;
  }

  return { id_pedido, total_ars };
}

/**
 * Devuelve el historial de pedidos del usuario (más recientes primero).
 * Si no se pasa idUsuario, se toma de la sesión actual.
 * Formato de cada pedido, compatible con la vista de historial:
 * { id, fecha, total, items: [{ nombre, precio, cantidad, tono }] }
 *
 * @param {string} [idUsuario]
 * @returns {Promise<Array>}
 */
export async function obtenerPedidos(idUsuario) {
  let uid = idUsuario;
  if (!uid) {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw new Error(`No se pudo validar la sesión: ${error.message}`);
    uid = data.user?.id;
    if (!uid) return [];
  }

  const { data, error } = await supabase
    .from("pedidos")
    .select(
      `
      id_pedido,
      total_ars,
      fecha_creacion,
      items_pedido (
        id_prod,
        cantidad,
        precio_unitario,
        tono,
        productos ( nombre )
      )
    `,
    )
    .eq("id_usuario", uid)
    .order("fecha_creacion", { ascending: false });

  if (error) {
    throw new Error(`No se pudo cargar el historial: ${error.message}`);
  }

  return (data ?? []).map((p) => ({
    id: p.id_pedido,
    fecha: p.fecha_creacion,
    total: Number(p.total_ars),
    items: (p.items_pedido ?? []).map((i) => ({
      nombre: i.productos?.nombre ?? "Producto",
      precio: Number(i.precio_unitario),
      cantidad: i.cantidad,
      tono:
        (typeof i.tonos === "object" && i.tonos !== null
          ? i.tonos.nombre
          : i.tonos) || "Tono único",
    })),
  }));
}
