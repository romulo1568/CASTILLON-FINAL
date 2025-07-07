import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { usuario, clave } = await request.json();

    if (!usuario || !clave) {
      return NextResponse.json({ message: 'Usuario y clave son requeridos' }, { status: 400 });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .input('pass', sql.VarChar, clave)
      .query(`
        SELECT 
          id,
          usuario,
          nombres,
          telefono,
          notificacion,
          FechaIng,
          indactivo
        FROM [MiCable].[Usuario] 
        WHERE usuario = @usuario 
        AND pass = @pass 
        AND indactivo = 1
      `);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      return NextResponse.json({ 
        user: {
          id: user.id,
          usuario: user.usuario,
          nombreCompleto: user.nombres,
          telefono: user.telefono,
          notificacion: user.notificacion,
          fechaIngreso: user.FechaIng,
          activo: user.indactivo === 1
        }
      });
    } else {
      return NextResponse.json({ message: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'Error en el servidor al intentar autenticar' }, { status: 500 });
  }
}