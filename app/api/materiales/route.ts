import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT CodMaterial, DscMaterial FROM [dbo].[Material] WHERE DscMaterial IS NOT NULL ORDER BY DscMaterial');
    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener materiales' }, { status: 500 });
  }
} 