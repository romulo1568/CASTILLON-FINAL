import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT IdAlmacen, NombreAlmacen FROM [dbo].[Almacen] WHERE NombreAlmacen IS NOT NULL ORDER BY NombreAlmacen');
    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener almacenes' }, { status: 500 });
  }
} 