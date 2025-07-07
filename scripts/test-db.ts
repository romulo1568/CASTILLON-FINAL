import { getConnection, sql } from '../lib/db';

async function testConnection() {
  console.log('Intentando conectar a la base de datos...');
  console.log('Host: 26.139.230.239');
  console.log('Base de datos: db_econo');
  console.log('Usuario: romulo');
  
  try {
    const pool = await getConnection();
    console.log('¡Conexión exitosa!');

    console.log('Ejecutando una consulta de prueba...');
    const result = await pool.request().query('SELECT 1 AS number');
    console.log('Resultado de la consulta básica:', result.recordset);

    console.log('Probando consulta a la tabla Usuario...');
    const usuariosResult = await pool.request().query(`
      SELECT TOP 5 id, usuario, nombres, indactivo 
      FROM [MiCable].[Usuario] 
      WHERE indactivo = 1
    `);
    console.log('Usuarios activos encontrados:', usuariosResult.recordset.length);
    console.log('Primeros 5 usuarios:', usuariosResult.recordset);

    console.log('Cerrando la conexión...');
    await pool.close();
    console.log('Conexión cerrada.');

  } catch (error) {
    console.error('Error al conectar o consultar la base de datos:', error);
    process.exit(1);
  }
}

testConnection();