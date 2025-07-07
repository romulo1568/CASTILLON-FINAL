import sql from 'mssql';

async function testServerConfig() {
  console.log('Probando configuración del servidor...\n');

  // Usar exactamente la misma configuración que lib/db.ts
  const config: sql.config = {
    server: '26.139.230.239',
    database: 'db_econo',
    user: 'romulo',
    password: '123123',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        port: 1433,
        connectTimeout: 30000,
        requestTimeout: 30000
    }
  };

  try {
    console.log('Intentando conectar a la base de datos con configuración:', {
      server: config.server,
      database: config.database,
      user: config.user,
      port: config.options?.port
    });
    
    const pool = await sql.connect(config);
    console.log('Conexión exitosa a la base de datos');

    // Probar la misma consulta que usa el servidor
    const result = await pool.request()
      .input('usuario', sql.VarChar, 'test')
      .input('pass', sql.VarChar, 'test')
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

    console.log('✅ Consulta de autenticación ejecutada correctamente');
    console.log(`📊 Resultados: ${result.recordset.length} registros encontrados`);

    await pool.close();
    console.log('\n🎉 Configuración del servidor funciona correctamente');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.log('   Código de error:', error.code);
    }
  }
}

testServerConfig().catch(console.error); 