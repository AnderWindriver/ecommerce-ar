// test.js
const email = process.argv[2];
const password = process.argv[3];

console.log(`\n--- Probando ---`);
console.log(`Correo: ${email}`);
console.log(`Contraseña: ${password}`);

if (!email || !password) {
  console.log("❌ Error: Faltan argumentos. Uso: node test.js correo@gmail.com contraseña\n");
  process.exit(1);
}

const correoLimpio = email.trim().toLowerCase();

// 1. Validación de formato básico de correo
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!regexEmail.test(correoLimpio)) {
  console.log("❌ Resultado: Formato de correo inválido.\n");
  process.exit(1);
}

// 2. Lista blanca de dominios
const dominiosPermitidos = [
  "gmail.com", "hotmail.com", "outlook.com", "yahoo.com",
  "icloud.com", "live.com", "hotmail.es", "yahoo.es"
];
const dominio = correoLimpio.split("@")[1];

if (!dominiosPermitidos.includes(dominio)) {
  console.log("❌ Resultado: Dominio no permitido o mal escrito (ej: gmial.com).\n");
  process.exit(1);
}

// 3. Validación de contraseña mínima de 8 caracteres
if (password.length < 8) {
  console.log("❌ Resultado: La contraseña debe tener al menos 8 caracteres.\n");
  process.exit(1);
}

console.log("✅ Resultado: ¡Éxito! Todas las validaciones pasaron correctamente.\n");
