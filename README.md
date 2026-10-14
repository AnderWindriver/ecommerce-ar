```markdown
# 🕶️ E-commerce AR
---

##  Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js + React |
| AR |  |
| Backend | NestJS + Node.js |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deploy | Vercel + Supabase |

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/AnderWindriver/ecommerce-ar.git
cd ecommerce-ar
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo:

```bash
cp .env.example .env.local
```

Rellenar las variables con los valores del proyecto en Supabase.

### 4. Correr en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Flujo de trabajo con Git

### Estructura de ramas

```
main   ← producción (solo recibe merges de dev)
 └── dev   ← integración (recibe merges de feature/HU-XX)
      └── feature/HU-XX-descripcion
```

### Regla de oro

> **Nadie pushea directo a `main` ni a `dev`. Todo entra por Pull Request.**

### Flujo por Historia de Usuario

```bash
# 1. Actualizar dev
git checkout dev
git pull origin dev

# 2. Crear rama feature
git checkout -b feature/HU-XX-descripcion

# 3. Trabajar y commitear
git add .
git commit -m "HU-XX: descripción breve del cambio"
git push -u origin feature/HU-XX-descripcion

# 4. Crear PR en GitHub → base: dev
# 5. Aprobación de un compañero
# 6. Merge + Delete branch
```

### Convenciones

| Elemento | Formato | Ejemplo |
|---|---|---|
| Rama feature | `feature/HU-XX-descripcion` | `feature/HU-12-catalogo-productos` |
| Rama fix | `fix/HU-XX-descripcion` | `fix/HU-17-login-error` |
| Commit | `HU-XX: mensaje` | `HU-15: agregar validación de email` |
| PR title | `HU-XX: Título de la HU` | `HU-15: Registro con email y contraseña` |

---

## 📋 Estructura del proyecto

```
ecommerce-ar/
├── app/                 # Rutas de Next.js
├── components/          # Componentes React (incluye AR)
├── lib/                 # Utilidades y lógica pura
├── public/              # Assets estáticos (modelos GLB)
├── .env.example         # Plantilla de variables de entorno
├── .gitignore
├── README.md
└── package.json
```

---

## 🧪 Pruebas

### Probar la AR en desktop
1. `npm run dev`
2. Abrir `http://localhost:3000`
3. Click en "Probar en AR" en cualquier producto.

### Probar la AR en celular
1. Levantar el servidor con `ngrok`:
   ```bash
   npx ngrok http 3000
   ```
2. Abrir la URL de ngrok en el navegador del celular.
3. Aceptar el permiso de cámara.

---
