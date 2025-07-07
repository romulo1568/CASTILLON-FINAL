import sql from 'mssql';

async function testServerConnectivity() {
  console.log('Probando conectividad al servidor SQL...\n');
  console.log('Credenciales:');
  console.log('- Usuario: romulo');
  console.log('- Contraseña: 123123');
  console.log('- Base de datos: db_econo\n');

  // Probar diferentes puertos comunes de SQL Server
  const ports = [1433, 1434, 14330, 14331];
  const databases = ['db_econo', 'MiCable', 'master', 'tempdb'];
  const users = ['romulo', 'sa', 'admin'];

  for (const port of ports) {
    console.log(`\n--- Probando puerto ${port} ---`);
    
    for (const database of databases) {
      console.log(`  Base de datos: ${database}`);
      
      for (const user of users) {
        try {
          const config = {
            server: '26.139.230.239',
            database: database,
            user: user,
            password: '123123',
            options: {
              encrypt: false,
              trustServerCertificate: true,
              enableArithAbort: true,
              port: port,
              connectTimeout: 5000,
              requestTimeout: 5000
            }
          };

          const pool = await sql.connect(config);
          console.log(`    ✅ ${user}@${database}:${port} - CONEXIÓN EXITOSA!`);
          
          // Si conectamos a master, probar listar bases de datos
          if (database === 'master') {
            const result = await pool.request().query(`
              SELECT name FROM sys.databases 
              WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')
              ORDER BY name
            `);
            console.log(`    📋 Bases de datos disponibles:`, result.recordset.map(r => r.name));
          }
          
          // Si conectamos a db_econo, probar la tabla Usuario
          if (database === 'db_econo') {
            const usuariosResult = await pool.request().query(`
              SELECT TOP 5 id, usuario, nombres, indactivo 
              FROM [db_econo].[Usuario]
            `);
            console.log(`    👥 Usuarios en db_econo:`, usuariosResult.recordset.length);
            console.log(`    📊 Datos:`, usuariosResult.recordset);
          }
          
          await pool.close();
          return; // Si llegamos aquí, encontramos una configuración que funciona
          
        } catch (error: any) {
          if (error.code === 'ELOGIN') {
            console.log(`    ❌ ${user}@${database}:${port} - Login falló`);
          } else if (error.code === 'ETIMEOUT') {
            console.log(`    ⏰ ${user}@${database}:${port} - Timeout`);
            break; // Si hay timeout, probar siguiente puerto
          } else {
            console.log(`    ❌ ${user}@${database}:${port} - ${error.message}`);
          }
        }
      }
    }
  }
  
  console.log('\n❌ No se pudo establecer conexión con ninguna configuración');
  console.log('\nPosibles problemas:');
  console.log('1. El servidor no está accesible desde esta red');
  console.log('2. Las credenciales son incorrectas');
  console.log('3. El puerto SQL Server no es el estándar');
  console.log('4. Hay un firewall bloqueando la conexión');
}

testServerConnectivity().catch(console.error); 