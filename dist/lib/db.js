"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = void 0;
exports.getConnection = getConnection;
const mssql_1 = __importDefault(require("mssql"));
exports.sql = mssql_1.default;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    server: process.env.DB_INSTANCE ? `${process.env.DB_SERVER}\\${process.env.DB_INSTANCE}` : process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true, // Necessary for local development with self-signed certs
        trustedConnection: true // Use Windows Authentication
    },
    port: Number(process.env.DB_PORT) || 1433
};
let pool = null;
async function getConnection() {
    if (pool) {
        return pool;
    }
    try {
        pool = await mssql_1.default.connect(config);
        return pool;
    }
    catch (err) {
        console.error('Database connection failed:', err);
        pool = null; // Reset pool on connection failure
        throw err; // Rethrow error to be handled by the caller
    }
}
