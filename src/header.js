import "./tienda.css";

const contenedor = document.getElementById("app-header");

if (contenedor) {
  contenedor.innerHTML = `
    <header>
      <div class="header-top">
        <a href="/html/index.html" class="logo" aria-label="Maquillainador, ir al inicio">
          MAQUILLAINADOR
        </a>

        <nav class="header-nav" aria-label="Navegación principal">
          <a href="/html/rubor.html">Rubor</a>
          <a href="/html/labial.html">Labial</a>
          <a href="/html/sombra.html">Sombra</a>

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

          <a href="/html/ar.html" class="destacado">Probar en AR</a>

          <div id="zona-cuenta">
            <a href="/html/login.html">Mi cuenta</a>
          </div>
        </nav>
      </div>
    </header>
  `;

  const zonaCuenta = document.getElementById("zona-cuenta");

function mostrarCuenta(sesion, cerrarSesion) {
    zonaCuenta.replaceChildren();

    // Si NO hay sesión, mostramos el botón blanco limpio de "Mi cuenta"
    if (!sesion?.user) {
      const enlace = document.createElement("a");
      enlace.href = "/html/login.html";
      enlace.textContent = "Mi cuenta";
      enlace.className = "enlace-mi-cuenta";
      zonaCuenta.appendChild(enlace);
      return;
    }

    const usuario = sesion.user;
    const nombre =
      usuario.user_metadata?.nombre?.trim() || usuario.email || "Mi cuenta";

    // Contenedor principal del menú desplegable de perfil
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
        
        <div class="menu-separador"></div>
        
        <a href="/html/pedidos.html" class="menu-opcion">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Pedidos realizados
        </a>
        
        <div class="menu-separador"></div>
        
        <button type="button" id="btn-cerrar-sesion-dropdown" class="menu-opcion menu-opcion-salir">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Cerrar sesión
        </button>
      </div>
    `;

    zonaCuenta.appendChild(wrapper);

    // Lógica para abrir/cerrar el menú desplegable al hacer clic
    const btnToggle = wrapper.querySelector("#btn-perfil-toggle");
    const menu = wrapper.querySelector("#menu-desplegable");
    const btnSalir = wrapper.querySelector("#btn-cerrar-sesion-dropdown");

    btnToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("oculto");
      const isOpen = !menu.classList.contains("oculto");
      btnToggle.setAttribute("aria-expanded", isOpen);
    });

    // Cerrar el menú si se hace clic en cualquier otra parte de la pantalla
    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        menu.classList.add("oculto");
        btnToggle.setAttribute("aria-expanded", "false");
      }
    });

    // Acción de cerrar sesión
    btnSalir.addEventListener("click", async () => {
      btnSalir.disabled = true;
      const { error } = await cerrarSesion();

      if (error) {
        console.error("No se pudo cerrar la sesión:", error.message);
        btnSalir.disabled = false;
        return;
      }

      window.location.href = "/html/index.html";
    });
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
