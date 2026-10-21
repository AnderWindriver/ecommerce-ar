// Cargar el cliente de Supabase
import { registrarUsuario, iniciarSesion, cerrarSesion } from './login.js';

async function probarBackend() {
  console.log('🚀 --- INICIANDO PRUEBAS DE BACKEND --- 🚀\n');

  // Datos de prueba
  const emailPrueba = `ulisesmailparatest10@gmail.com`;
  const passwordPrueba = '12345678';
  const nombrePrueba = 'Ulises Test';

  // 1. Probar SCRUM-15: Registro de usuario
  console.log(`1️⃣ Probando Registro para: ${emailPrueba}...`);
  const { data: regData, error: regError } = await registrarUsuario(emailPrueba, passwordPrueba, nombrePrueba);

  if (regError) {
    console.error('❌ Error en Registro:', regError.message);
    return;
  }
  console.log('✅ Registro exitoso!');
  console.log('   ID de usuario generado:', regData.user?.id);
  console.log('   Metadata enviada:', regData.user?.user_metadata);
  console.log('--------------------------------------------------\n');

  // 2. Probar SCRUM-17: Inicio de sesión
  console.log(`2️⃣ Probando Login para: ${emailPrueba}...`);
  const { data: loginData, error: loginError } = await iniciarSesion(emailPrueba, passwordPrueba);

  if (loginError) {
    console.error('❌ Error en Login:', loginError.message);
    return;
  }
  console.log('✅ Login exitoso!');
  console.log('   Token de sesión JWT recibido:', loginData.session?.access_token ? 'SÍ (Válido)' : 'NO');
  console.log('--------------------------------------------------\n');

  // 3. Probar SCRUM-17: Cierre de sesión
  console.log('3️⃣ Probando Logout...');
  const { error: logoutError } = await cerrarSesion();

  if (logoutError) {
    console.error('❌ Error en Logout:', logoutError.message);
    return;
  }
  console.log('✅ Logout exitoso!');
  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE BACKEND PASARON CORRECTAMENTE!');
}

probarBackend();