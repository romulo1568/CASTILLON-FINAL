import sql from 'mssql';

async function testConnection() {
  console.log('Probando diferentes configuraciones de conexión...\n');

  const configs = [
    {
      name: 'Configuración 1 - SQL Auth',
      config: {
        server: '26.139.230.239',
        database: 'MiCable',
        user: 'romulo',
        password: '123123',
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true
        }
      }
    },
    {
      name: 'Configuración 2 - Windows Auth',
      config: {
        server: '26.139.230.239',
        database: 'MiCable',
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
          trustedConnection: true
        }
      }
    },
    {
      name: 'Configuración 3 - Puerto específico',
      config: {
        server: '26.139.230.239',
        database: 'MiCable',
        user: 'romulo',
        password: '123123',
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
          port: 1433
        }
      }
    }
  ];

  for (const { name, config: sqlConfig } of configs) {
    console.log(`\n--- ${name} ---`);
    try {
      const pool = await sql.connect(sqlConfig);
      console.log('✅ Conexión exitosa!');
      
      // Probar consulta básica
      const result = await pool.request().query('SELECT 1 AS test');
      console.log('✅ Consulta básica exitosa:', result.recordset);
      
      // Probar consulta a la tabla Usuario
      const usuariosResult = await pool.request().query(`
        SELECT TOP 3 id, usuario, nombres, indactivo 
        FROM [MiCable].[Usuario]
      `);
      console.log('✅ Consulta a tabla Usuario exitosa');
      console.log('Usuarios encontrados:', usuariosResult.recordset.length);
      console.log('Datos:', usuariosResult.recordset);
      
      await pool.close();
      console.log('✅ Conexión cerrada correctamente');
      
      // Si llegamos aquí, la configuración funciona
      console.log(`\n🎉 ${name} FUNCIONA CORRECTAMENTE`);
      return;
      
    } catch (error: any) {
      console.log('❌ Error:', error.message);
      if (error.code) {
        console.log('   Código de error:', error.code);
      }
    }
  }
  
  console.log('\n❌ Ninguna configuración funcionó');
}

testConnection().catch(console.error); 