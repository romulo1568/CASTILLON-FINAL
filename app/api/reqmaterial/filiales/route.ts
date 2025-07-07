import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT idFilial, DescripcionFilial FROM [dbo].[Filial] WHERE DescripcionFilial IS NOT NULL ORDER BY DescripcionFilial');
    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener filiales' }, { status: 500 });
  }
} 