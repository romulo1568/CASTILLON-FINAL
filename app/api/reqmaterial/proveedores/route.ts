import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT IdProveedor,
        CASE
          WHEN (RazonSocial IS NOT NULL AND LTRIM(RTRIM(RazonSocial)) <> '') THEN RazonSocial
          ELSE LTRIM(RTRIM(ISNULL(Nombres, ''))) + ' ' + LTRIM(RTRIM(ISNULL(Paterno, ''))) + ' ' + LTRIM(RTRIM(ISNULL(Materno, '')))
        END AS RazonSocial
      FROM [dbo].[Proveedor]
      WHERE (RazonSocial IS NOT NULL AND LTRIM(RTRIM(RazonSocial)) <> '')
         OR (Nombres IS NOT NULL AND LTRIM(RTRIM(Nombres)) <> '')
      ORDER BY RazonSocial
    `);
    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener proveedores' }, { status: 500 });
  }
} 