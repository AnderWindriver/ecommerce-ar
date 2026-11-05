const CLAVE_PEDIDOS = "pedidos-demo";

function leerPedidos(usuarioId) {
  const pedidosPorUsuario = JSON.parse(
    localStorage.getItem(CLAVE_PEDIDOS) || "{}",
  );
  return pedidosPorUsuario[usuarioId] || [];
}

export function obtenerPedidos(usuarioId) {
  try {
    return leerPedidos(usuarioId);
  } catch (error) {
    console.error("No se pudo leer el historial de pedidos:", error);
    throw new Error("No se pudo cargar el historial de compras.");
  }
}

export function guardarPedido(usuarioId, pedido) {
  try {
    const pedidosPorUsuario = JSON.parse(
      localStorage.getItem(CLAVE_PEDIDOS) || "{}",
    );
    const pedidosUsuario = pedidosPorUsuario[usuarioId] || [];
    pedidosPorUsuario[usuarioId] = [pedido, ...pedidosUsuario];
    localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidosPorUsuario));
  } catch (error) {
    console.error("No se pudo guardar el pedido:", error);
    throw new Error("No se pudo guardar la compra en este navegador.");
  }
}
