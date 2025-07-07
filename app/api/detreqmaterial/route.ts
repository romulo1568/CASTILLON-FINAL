import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT IdDetReqMaterial, CodMaterial, CantSolicitada FROM [dbo].[DetReqMaterial] WHERE EstadoDetReq = 1 ORDER BY IdDetReqMaterial DESC');
    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener detalles de requerimiento de material' }, { status: 500 });
  }
} 