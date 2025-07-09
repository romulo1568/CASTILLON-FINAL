import sql from 'mssql';

const config: sql.config = {
    server: '0.tcp.sa.ngrok.io',
    database: 'db_econo',
    user: 'romulo',
    password: '123123',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        port: 16342,
        connectTimeout: 30000,
        requestTimeout: 30000
    }
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection() {
    if (pool) {
        return pool;
    }
    try {
        console.log('Intentando conectar a la base de datos con configuración:', {
            server: config.server,
            database: config.database,
            user: config.user,
            port: config.options?.port
        });
        
        pool = await sql.connect(config);
        console.log('Conexión exitosa a la base de datos');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        pool = null; // Reset pool on connection failure
        throw err; // Rethrow error to be handled by the caller
    }
}

export { sql };