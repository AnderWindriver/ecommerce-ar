const contenedor = document.getElementById("app-header");

if (contenedor) {
  contenedor.innerHTML = `
    <header>
      <div class="header-top">
        <a href="/" class="logo" style="text-decoration:none;color:inherit">
          PROBADOR AR
        </a>

        <nav class="header-nav" aria-label="Navegación principal">
          <a href="/rubor.html">Rubor</a>
          <a href="/labial.html">Labial</a>
          <a href="/sombra.html">Sombra</a>

          <div class="mini-carrito-wrapper">
            <button
              id="btn-carrito-menu"
              class="btn-carrito-menu"
              type="button"
              aria-label="Abrir mini carrito"
            >
              🛒 Carrito (<span id="contador-carrito">0</span>)
            </button>

            <div id="panel-mini-carrito" class="panel-mini-carrito">
              <div id="items-mini-carrito" class="items-mini-carrito"></div>
              <div class="footer-mini-carrito">
                <button id="btn-ir-carrito" type="button">
                  Ver Carrito Completo
                </button>
              </div>
            </div>
          </div>

          <a href="/ar/" class="destacado">Probar en AR</a>

          <div id="zona-cuenta">
            <a href="/login.html">Mi cuenta</a>
          </div>
        </nav>
      </div>
    </header>
  `;

  const zonaCuenta = document.getElementById("zona-cuenta");

  function mostrarCuenta(sesion, cerrarSesion) {
    zonaCuenta.replaceChildren();

    if (!sesion?.user) {
      const enlace = document.createElement("a");
      enlace.href = "/login.html";
      enlace.textContent = "Mi cuenta";
      zonaCuenta.appendChild(enlace);
      return;
    }

    const usuario = sesion.user;
    const nombre =
      usuario.user_metadata?.nombre?.trim() || usuario.email || "Mi cuenta";

    const etiqueta = document.createElement("span");
    etiqueta.textContent = nombre;
    etiqueta.className = "usuario-conectado";

    const enlaceCuenta = document.createElement("a");
    enlaceCuenta.href = "/login.html";
    enlaceCuenta.textContent = "Mi cuenta";

    const botonSalir = document.createElement("button");
    botonSalir.type = "button";
    botonSalir.textContent = "Cerrar sesión";

    botonSalir.addEventListener("click", async () => {
      botonSalir.disabled = true;
      const { error } = await cerrarSesion();

      if (error) {
        console.error("No se pudo cerrar la sesión:", error.message);
        botonSalir.disabled = false;
        return;
      }

      window.location.href = "/";
    });

    zonaCuenta.append(etiqueta, enlaceCuenta, botonSalir);
  }

  // La sesión se conecta después de dibujar el menú.
  // Si Supabase falla, el header sigue visible.
  try {
    const { supabase, cerrarSesion } = await import("/js/login.js");

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("No se pudo consultar la sesión:", error.message);
    } else {
      mostrarCuenta(data.session, cerrarSesion);
    }

    supabase.auth.onAuthStateChange((evento, sesion) => {
      // Al cerrar sesión (en esta pestaña o en otra) se vacía el carrito local.
      if (evento === "SIGNED_OUT") {
        localStorage.removeItem("carrito_ar");
      }
      mostrarCuenta(sesion, cerrarSesion);
    });
  } catch (err) {
    console.error("[Header] Supabase no disponible:", err.message);
  }
}
