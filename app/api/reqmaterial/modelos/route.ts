import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT idModelo, Modelo FROM [dbo].[Modelo] WHERE Modelo IS NOT NULL ORDER BY Modelo');
    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener modelos' }, { status: 500 });
  }
} 