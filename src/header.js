const contenedor = document.getElementById("app-header");

if (contenedor) {
  contenedor.innerHTML = `
    <header>
      <div class="header-top">
        <a href="/" class="logo" aria-label="Maquillainador, ir al inicio">
          MAQUILLAINADOR
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

    // Si NO hay sesión, mostramos el enlace simple a "Mi cuenta"
    if (!sesion?.user) {
      const enlace = document.createElement("a");
      enlace.href = "/login.html";
      enlace.textContent = "Mi cuenta";
      enlace.className = "enlace-mi-cuenta";
      zonaCuenta.appendChild(enlace);
      return;
    }

    // Si hay sesión activa, obtenemos el nombre
    const usuario = sesion.user;
    const nombre =
      usuario.user_metadata?.nombre?.trim() || usuario.email || "Mi cuenta";

    // --- INTEGRACIÓN DE TU MENÚ DESPLEGABLE ---
    const wrapper = document.createElement("div");
    wrapper.className = "perfil-dropdown-container";

    wrapper.innerHTML = `
      <button type="button" id="btn-perfil-toggle" class="btn-perfil-toggle" aria-expanded="false">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span class="nav-nombre">${nombre}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
      
      <div id="menu-desplegable" class="menu-desplegable oculto">
        <div class="menu-header-usuario">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span class="texto-nombre" title="${nombre}">${nombre}</span>
        </div>
        
        <button type="button" id="btn-cerrar-sesion-dropdown" class="menu-opcion menu-opcion-salir">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Cerrar sesión
        </button>
      </div>
    `;

    zonaCuenta.appendChild(wrapper);

    // --- EVENTOS DEL MENÚ DESPLEGABLE ---
    const btnToggle = wrapper.querySelector("#btn-perfil-toggle");
    const menuDesplegable = wrapper.querySelector("#menu-desplegable");
    const btnCerrarSesion = wrapper.querySelector("#btn-cerrar-sesion-dropdown");

    // Toggle para desplegar / ocultar el menú
    btnToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const estaOculto = menuDesplegable.classList.toggle("oculto");
      btnToggle.setAttribute("aria-expanded", String(!estaOculto));
    });

    // Ocultar si el usuario hace clic fuera del menú
    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        menuDesplegable.classList.add("oculto");
        btnToggle.setAttribute("aria-expanded", "false");
      }
    });

    // Acción para cerrar sesión
    btnCerrarSesion.addEventListener("click", async () => {
      btnCerrarSesion.disabled = true;
      const { error } = await cerrarSesion();

      if (error) {
        console.error("No se pudo cerrar la sesión:", error.message);
        btnCerrarSesion.disabled = false;
        return;
      }

      window.location.href = "/";
    });
  }

  // La sesión se conecta después de dibujar el menú.
  try {
    const { supabase, cerrarSesion } = await import("/js/login.js");

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("No se pudo consultar la sesión:", error.message);
    } else {
      mostrarCuenta(data.session, cerrarSesion);
    }

    supabase.auth.onAuthStateChange((evento, sesion) => {
      if (evento === "SIGNED_OUT") {
        localStorage.removeItem("carrito_ar");
      }
      mostrarCuenta(sesion, cerrarSesion);
    });
  } catch (err) {
    console.error("[Header] Supabase no disponible:", err.message);
  }
}
