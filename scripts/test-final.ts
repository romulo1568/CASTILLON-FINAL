import sql from 'mssql';

async function testFinalConnection() {
  console.log('Prueba final de conexión...\n');
  console.log('Configuración:');
  console.log('- Host: 26.139.230.239');
  console.log('- Base de datos: db_econo');
  console.log('- Esquema: MiCable');
  console.log('- Tabla: Usuario');
  console.log('- Usuario: romulo');
  console.log('- Contraseña: 123123\n');

  const config = {
    server: '26.139.230.239',
    database: 'db_econo',
    user: 'romulo',
    password: '123123',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };

  try {
    const pool = await sql.connect(config);
    console.log('✅ Conexión exitosa a db_econo');

    // Probar consulta a la tabla MiCable.Usuario
    console.log('\n--- Probando tabla MiCable.Usuario ---');
    const result = await pool.request().query(`
      SELECT TOP 5 
        id,
        usuario,
        nombres,
        telefono,
        notificacion,
        FechaIng,
        indactivo
      FROM [MiCable].[Usuario]
      WHERE indactivo = 1
      ORDER BY id
    `);
    
    console.log(`✅ Encontrados ${result.recordset.length} usuarios activos`);
    console.log('📊 Datos de ejemplo:');
    result.recordset.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}, Usuario: ${user.usuario}, Nombre: ${user.nombres}`);
    });

    // Probar autenticación simulada
    if (result.recordset.length > 0) {
      const testUser = result.recordset[0];
      console.log(`\n--- Probando autenticación con usuario: ${testUser.usuario} ---`);
      
      const authResult = await pool.request()
        .input('usuario', sql.VarChar, testUser.usuario)
        .input('pass', sql.VarChar, 'test_password') // Contraseña de prueba
        .query(`
          SELECT 
            id,
            usuario,
            nombres,
            telefono,
            notificacion,
            FechaIng,
            indactivo
          FROM [MiCable].[Usuario] 
          WHERE usuario = @usuario 
          AND pass = @pass 
          AND indactivo = 1
        `);
      
      if (authResult.recordset.length > 0) {
        console.log('✅ Consulta de autenticación funciona correctamente');
      } else {
        console.log('✅ Consulta de autenticación ejecutada (sin coincidencia de contraseña)');
      }
    }

    await pool.close();
    console.log('\n🎉 Prueba completada exitosamente');
    console.log('✅ La configuración está lista para usar');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.log('   Código de error:', error.code);
    }
  }
}

testFinalConnection().catch(console.error); 