export const databaseConfig = {
    server: process.env.DB_SERVER || '26.139.230.239',
    database: process.env.DB_DATABASE || 'db_econo',
    user: process.env.DB_USER || 'romulo',
    password: process.env.DB_PASSWORD || '123123',
    port: Number(process.env.DB_PORT) || 1433,
    encrypt: process.env.DB_ENCRYPT === 'true' || false
}; 