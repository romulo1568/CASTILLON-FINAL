import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT idMarca, Marca FROM [dbo].[Marca] WHERE Marca IS NOT NULL ORDER BY Marca');
    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener marcas' }, { status: 500 });
  }
} 