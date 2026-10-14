# ecommerce-ar

E-commerce con try-on AR — Proyecto académico

# Regla de oro

Nadie pushea directo a main ni a dev. Todo entra por Pull Request.

# Estructura de ramas

Main ← producción (solo recibe merges de dev)
└──→dev ← integración (recibe merges de feature/HU-XX)
└──→feature/HU-XX-descripcion ← una rama por Historia de Usuario

Flujo resumido:
git checkout dev && git pull
git checkout feature/HU-XX-descripcion
...trabajar...
git add . && git commit -m "HU-XX: mensaje"
git push
git merge dev (para actualizar)
Crear PR en GitHub → base: dev
Compañero aprueba
Merge + Delete branch
it checkout dev && git pull

Flujo por HU
1️⃣ Arrancar la HU

    git checkout dev
    git pull origin dev
    git checkout feature/HU-XX-descripcion
    git pull origin feature/HU-XX-descripcion

Ejemplo:
git checkout dev
git pull origin dev
git checkout feature/HU-12-Repositorio GitHub con ramas por feature
git pull origin feature/HU-12-Repositorio GitHub con ramas por feature

2️⃣ Trabajar y commitear

    git add .
    git commit -m "HU-XX: descripción breve del cambio"
    git push

Formato de commit obligatorio: HU-XX: mensaje
Ejemplo: HU-12: crear estructura del catálogo

3️⃣ Antes de crear el PR (evitar conflictos)

    git checkout dev
    git pull origin dev
    git checkout feature/HU-XX-descripcion
    git merge dev

# resolver conflictos si hay

    git push

4️⃣ Crear el Pull Request en GitHub
Un pull request es una propuesta para fusionar los cambios de código que hiciste en una rama hacia otra rama
¿Porque hacemos el pullrequest en vez de mandarlo de una al repo?
El PR obliga a que otro miembro del equipo revise el código antes de integrarlo, lo que reduce bugs, errores de lógica y credenciales filtradas; además deja un historial claro de qué cambió, quién lo aprobó y por qué (pueden ser ustedes mismo porque asi es el plan free) , lo cual es clave para la trazabilidad. Sin PR, cualquiera podría romper dev sin que nadie se entere hasta que sea tarde.

Formato del PR:
Base: dev ← Compare: feature/HU-XX-descripcion  
 Título: HU-XX: Título de la HU
Descripción: pegar la HU

5️⃣ Revisión y merge

Se hace Merge pull request → Confirm merge.
Click en Delete branch (borra la rama remota).

6️⃣ Volver a dev limpio

git checkout dev
git pull origin dev
git branch -d feature/HU-XX-descripcion
