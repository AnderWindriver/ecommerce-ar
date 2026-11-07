# Maquillainador — E-commerce con probador AR

Aplicación web de demostración para explorar maquillaje, probar tonos usando la cámara, agregar productos al carrito y simular una compra.

> **Estado del proyecto:** el pago es simulado. Las cuentas, el carrito y el historial de pedidos se gestionan con Supabase. La aplicación no procesa transacciones reales.

## Contenido

- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Configuración y ejecución local](#configuración-y-ejecución-local)
- [Cómo funciona la aplicación](#cómo-funciona-la-aplicación)
- [Páginas](#páginas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Variables de entorno y datos](#variables-de-entorno-y-datos)
- [Probar el probador AR en celular](#probar-el-probador-ar-en-celular)
- [Build y pruebas](#build-y-pruebas)
- [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)

## Tecnologías

| Área | Tecnología |
| --- | --- |
| Frontend | HTML, CSS y JavaScript en módulos |
| Servidor de desarrollo y build | Vite |
| Probador de maquillaje | Open Makeup SDK y MediaPipe Face Mesh |
| Autenticación y datos del carrito | Supabase Auth y Supabase (PostgreSQL) |
| Servidor HTTP de productos | Node.js y Express |
| Catálogo de demostración | Productos locales y API pública de maquillaje |

El frontend **no usa actualmente Next.js ni React**. Vite sirve las páginas HTML y procesa los módulos JavaScript y CSS.

## Requisitos

- Node.js y npm.
- Un proyecto Supabase configurado con Auth y las tablas `usuarios`, `productos`, `carritos`, `items_carrito`, `pedidos` e `items_pedido`.
- Cámara y permiso de acceso para usar el probador AR.

## Configuración y ejecución local

1. Cloná el repositorio e instalá las dependencias:

   ```bash
   git clone https://github.com/AnderWindriver/ecommerce-ar.git
   cd ecommerce-ar
   npm install
   ```

2. Creá `.env.local` a partir del ejemplo:

   ```bash
   cp .env.example .env.local
   ```

   En Windows PowerShell también podés usar:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Configurá en `.env.local` las variables de Supabase. Para los nombres exactos, consultá `.env.example`. La clave usada por el frontend debe ser la clave pública/`anon` del proyecto; **nunca pongas una `service_role` o una clave secreta en variables `VITE_*`**.

4. Iniciá el servidor del frontend:

   ```bash
   npm run dev
   ```

   Abrí la dirección que indique Vite, normalmente [http://localhost:5173](http://localhost:5173). La raíz redirige a `/html/index.html`.

5. Para cargar productos desde el endpoint Express local, iniciá **en otra terminal**:

   ```bash
   node js/server.js
   ```

   Este servidor escucha en el puerto `3000`; el endpoint es `http://localhost:3000/api/productos`. Si no está disponible, los productos locales siguen siendo utilizables, pero no se podrán cargar los productos remotos.

## Cómo funciona la aplicación

### 1. Inicio y catálogos

- La página de inicio muestra las categorías de rubor, labial y sombra.
- Cada categoría tiene su propia página de catálogo.
- El catálogo combina los productos de demostración definidos en `src/productos.js` con los productos que devuelve el endpoint Express.
- Al seleccionar un producto se abre su ficha, con descripción, precio y selección de tono.

### 2. Ficha y probador AR

- La ficha de producto genera un enlace al probador con la categoría y el identificador del producto en la URL.
- `src/main.js` solicita permiso para la cámara e inicializa Open Makeup SDK y MediaPipe.
- El usuario puede elegir categoría, producto y tono. El probador puede mantener capas activas de rubor, sombra y labial.
- El botón **Agregar seleccionados al carrito** agrega las capas activas con su producto y tono. El botón **Borrar todo el maquillaje** limpia la selección.
- **Volver al catálogo** navega al catálogo de la categoría seleccionada.
- La cámara requiere permiso y un contexto seguro: `localhost` funciona para desarrollo; desde otros dispositivos se necesita HTTPS.

### 3. Cuenta y autenticación

- La página de cuenta permite registrarse, iniciar sesión y solicitar recuperación de contraseña mediante Supabase Auth.
- Durante el inicio de sesión, el código intenta sincronizar el perfil del usuario con la tabla `usuarios`.
- El header consulta la sesión para mostrar el acceso a la cuenta o el menú del usuario. Desde ese menú se puede cerrar sesión y acceder al historial.
- Las funciones de autenticación y creación del cliente Supabase están en `js/login.js`.

### 4. Carrito

- El carrito pertenece al usuario autenticado y se gestiona mediante Supabase.
- Al agregar un producto, la aplicación comprueba la sesión, sincroniza el producto y crea o actualiza el carrito activo y sus ítems.
- El producto y el tono se guardan como ítems; si se vuelve a agregar el mismo producto con el mismo tono, se incrementa su cantidad.
- Desde la página del carrito se puede sumar o restar unidades; la cantidad mínima es una unidad y cada ítem también se puede eliminar.
- `src/carrito-vista.js` presenta la página del carrito; `src/ui-carrito.js` actualiza el contador y el mini carrito del header.
- Es necesario iniciar sesión para persistir productos en el carrito.

### 5. Pago e historial de pedidos

- Desde el carrito se puede ir a la página de pagos si hay productos.
- Se puede elegir transferencia, Bitcoin o tarjeta, pero la selección es **solo demostrativa**: no se conecta a una pasarela, no mueve dinero y no pide datos de tarjeta.
- Al confirmar la demostración, se crea el pedido y sus ítems en las tablas `pedidos` e `items_pedido` de Supabase, y el carrito activo pasa al estado `completado`.
- `src/pedidos-storage.js` procesa la compra y consulta el historial en Supabase; `src/pedidos.js` muestra los pedidos del usuario autenticado.
- Los pedidos se asocian a la cuenta del usuario, por lo que el historial no depende del navegador o dispositivo donde se realizó la compra.

## Páginas

| URL local | Función |
| --- | --- |
| `/html/index.html` | Inicio y acceso a categorías |
| `/html/rubor.html` | Catálogo de rubores |
| `/html/labial.html` | Catálogo de labiales |
| `/html/sombra.html` | Catálogo de sombras |
| `/html/producto.html?tipo=...&id=...` | Detalle de un producto |
| `/html/ar.html?tipo=...&id=...` | Probador de maquillaje AR |
| `/html/carrito.html` | Carrito del usuario |
| `/html/pagos.html` | Selección de pago simulado y confirmación de demo |
| `/html/pedidos.html` | Historial de pedidos del usuario en Supabase |
| `/html/login.html` | Registro, acceso y recuperación de cuenta |

## Estructura del proyecto

```text
ecommerce-ar/
├── html/                  # Páginas HTML de la aplicación
├── img/                   # Imágenes del catálogo local
├── js/
│   ├── login.js           # Cliente y operaciones de Supabase Auth
│   ├── login-vista.js     # Eventos de la página de cuenta
│   ├── server.js          # API Express de productos para desarrollo
│   └── api.js             # Implementación alternativa de API con Channel3
├── public/
│   ├── assets/            # Modelo facial, patrones y shaders del probador
│   └── mediapipe/         # Archivos de MediaPipe usados por el probador
├── src/
│   ├── main.js            # Inicialización y comportamiento del probador AR
│   ├── productos.js       # Catálogo local
│   ├── lista.js           # Renderizado de catálogos
│   ├── producto.js        # Ficha y acciones de producto
│   ├── carrito.js         # Operaciones del carrito en Supabase
│   ├── carrito-vista.js   # Página del carrito
│   ├── ui-carrito.js      # Contador y mini carrito del header
│   ├── pagos.js           # Flujo de pago de demostración
│   ├── pedidos.js         # Renderizado del historial
│   ├── pedidos-storage.js # Procesamiento de compras e historial en Supabase
│   ├── header.js          # Header y estado de sesión
│   ├── tienda.css         # Estilos de tienda y páginas de compra
│   └── style.css          # Estilos del probador AR
├── vite.config.js         # Entradas HTML, build y redirección de raíz
├── .env.example           # Nombres de variables requeridas
└── package.json
```

### API de productos

El frontend consulta `src/api.js`, que realiza una petición a `http://localhost:3000/api/productos`. El servidor sugerido para desarrollo es `js/server.js`, que consulta una API pública de maquillaje y normaliza los productos para el frontend.

También existe `js/api.js`, una implementación alternativa del endpoint que usa Channel3 y requiere `CHANNEL3_API_KEY`. Ambas implementaciones escuchan en el puerto `3000`, por lo que no se deben ejecutar simultáneamente. La configuración de Channel3 no es necesaria para el flujo normal con `js/server.js`.

## Probar el probador AR en celular

La cámara requiere HTTPS fuera de `localhost`. Para una demostración:

1. Iniciá Vite con acceso desde la red:

   ```bash
   npm run dev -- --host 0.0.0.0
   ```

2. Exponé el puerto que informa Vite (normalmente `5173`) con ngrok:

   ```bash
   npx ngrok http 5173
   ```

3. Abrí en el celular la URL HTTPS que muestra ngrok y aceptá el permiso para usar la cámara.

> **Limitación de la API local:** `src/api.js` apunta a `localhost:3000`. En un celular, `localhost` es el propio teléfono, no la computadora. Por eso el catálogo remoto podría no cargar en la demostración móvil; los productos locales permanecen disponibles. El endpoint de API también debe exponerse/configurarse por separado si se necesita probar desde el celular.

## Build y pruebas

Crear el build de producción:

```bash
npm run build
```

Previsualizar el build:

```bash
npm run preview
```

El script `npm test` actualmente es un placeholder y no ejecuta pruebas automatizadas.

## Flujo de trabajo con Git

### Estructura de ramas

```text
main   ← producción (recibe merges de dev)
 └── dev   ← integración
      └── feature/HU-XX-descripcion
```

> No hacer push directo a `main` ni a `dev`; los cambios se integran mediante Pull Request.

### Flujo sugerido

```bash
git checkout dev
git pull origin dev
git checkout -b feature/HU-XX-descripcion

# Trabajar y guardar los cambios
git add .
git commit -m "HU-XX: descripción breve del cambio"
git push -u origin feature/HU-XX-descripcion
```

Después, crear un Pull Request hacia `dev`, solicitar revisión y eliminar la rama una vez integrada.

### Convenciones

| Elemento | Formato | Ejemplo |
| --- | --- | --- |
| Rama feature | `feature/HU-XX-descripcion` | `feature/HU-12-catalogo-productos` |
| Rama fix | `fix/HU-XX-descripcion` | `fix/HU-17-login-error` |
| Commit | `HU-XX: mensaje` | `HU-15: agregar validación de email` |
| Título del PR | `HU-XX: Título de la HU` | `HU-15: Registro con email y contraseña` |
