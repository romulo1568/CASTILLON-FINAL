"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../lib/db");
async function testConnection() {
    console.log('Intentando conectar a la base de datos...');
    try {
        const pool = await (0, db_1.getConnection)();
        console.log('¡Conexión exitosa!');
        console.log('Ejecutando una consulta de prueba...');
        const result = await pool.request().query('SELECT 1 AS number');
        console.log('Resultado de la consulta:', result.recordset);
        console.log('Cerrando la conexión...');
        await pool.close();
        console.log('Conexión cerrada.');
    }
    catch (error) {
        console.error('Error al conectar o consultar la base de datos:', error);
        process.exit(1);
    }
}
testConnection();
