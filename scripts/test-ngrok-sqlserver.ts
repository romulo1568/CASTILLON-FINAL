import sql from 'mssql';

const config: sql.config = {
  server: '0.tcp.sa.ngrok.io',
  port: 16342,
  database: 'CASTILLONV2',
  user: 'romulo',
  password: '123123',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 5,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

async function testConnection() {
  try {
    console.log('Intentando conectar a SQL Server por ngrok...');
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT GETDATE() as fecha_actual');
    console.log('¡Conexión exitosa! Fecha actual en SQL Server:', result.recordset[0].fecha_actual);
    await pool.close();
  } catch (err) {
    console.error('Error al conectar:', err);
  }
}

testConnection(); 