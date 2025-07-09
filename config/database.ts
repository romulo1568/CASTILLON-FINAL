export const databaseConfig = {
    server: process.env.DB_SERVER || '0.tcp.sa.ngrok.io',
    database: process.env.DB_DATABASE || 'db_econo',
    user: process.env.DB_USER || 'romulo',
    password: process.env.DB_PASSWORD || '123123',
    port: Number(process.env.DB_PORT) || 16342,
    encrypt: process.env.DB_ENCRYPT === 'true' || false
}; 