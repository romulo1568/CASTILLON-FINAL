import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';

// GET /api/reqmaterial/:id
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const pool = await getConnection();
    const cabeceraResult = await pool.request()
      .input('idReqMaterial', sql.Int, id)
      .query(`
        SELECT R.*, F.DescripcionFilial, U.nombres as UsuarioIng, U2.nombres as UsuarioUltMod
        FROM [dbo].[ReqMaterial] R
        LEFT JOIN [dbo].[Filial] F ON R.idFilial = F.idFilial
        LEFT JOIN [MiCable].[Usuario] U ON R.idUsuarioIng = U.id
        LEFT JOIN [MiCable].[Usuario] U2 ON R.IdUsuarioUltMod = U2.id
        WHERE R.idReqMaterial = @idReqMaterial
      `);
    if (cabeceraResult.recordset.length === 0) {
      return NextResponse.json({ message: 'Solicitud de material no encontrada' }, { status: 404 });
    }
    const cabecera = cabeceraResult.recordset[0];
    return NextResponse.json(cabecera);
  } catch (error) {
    console.error('Error al obtener solicitud de material:', error);
    return NextResponse.json({ message: 'Error al obtener la solicitud de material' }, { status: 500 });
  }
}

// PUT /api/reqmaterial/:id
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const data = await request.json();
    const pool = await getConnection();
    await pool.request()
      .input('idReqMaterial', sql.Int, id)
      .input('idFilial', sql.Int, data.idFilial)
      .input('FechaReq', sql.DateTime, data.FechaReq)
      .input('FechaAcepta', sql.DateTime, data.FechaAcepta)
      .input('FechaAproba', sql.DateTime, data.FechaAproba)
      .input('TipoReq', sql.VarChar, data.TipoReq)
      .input('MotivoReq', sql.VarChar, data.MotivoReq)
      .input('OrigenReq', sql.VarChar, data.OrigenReq)
      .input('EstadoReq', sql.VarChar, data.EstadoReq)
      .input('idUsuarioIng', sql.Int, data.idUsuarioIng)
      .input('FechaIng', sql.DateTime, data.FechaIng)
      .input('IdUsuarioUltMod', sql.Int, data.IdUsuarioUltMod)
      .input('FechaUltMod', sql.DateTime, data.FechaUltMod ? new Date(data.FechaUltMod) : null)
      .input('LugarCompra', sql.VarChar, data.LugarCompra)
      .input('IdReqMaterialOrigen', sql.Int, data.IdReqMaterialOrigen)
      .input('NumEnvio', sql.Int, data.NumEnvio)
      .query(`
        UPDATE [dbo].[ReqMaterial]
        SET idFilial = @idFilial, FechaReq = @FechaReq, FechaAcepta = @FechaAcepta, FechaAproba = @FechaAproba,
            TipoReq = @TipoReq, MotivoReq = @MotivoReq, OrigenReq = @OrigenReq, EstadoReq = @EstadoReq,
            idUsuarioIng = @idUsuarioIng, FechaIng = @FechaIng, IdUsuarioUltMod = @IdUsuarioUltMod, FechaUltMod = @FechaUltMod,
            LugarCompra = @LugarCompra, IdReqMaterialOrigen = @IdReqMaterialOrigen, NumEnvio = @NumEnvio
        WHERE idReqMaterial = @idReqMaterial
      `);
    return NextResponse.json({ message: 'Solicitud de material actualizada' });
  } catch (error) {
    console.error('Error al actualizar solicitud de material:', error);
    return NextResponse.json({ message: 'Error al actualizar la solicitud de material' }, { status: 500 });
  }
}

// DELETE /api/reqmaterial/:id
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const pool = await getConnection();
    await pool.request().input('idReqMaterial', sql.Int, id).query('DELETE FROM [dbo].[DetReqMaterial] WHERE idReqMaterial = @idReqMaterial');
    await pool.request().input('idReqMaterial', sql.Int, id).query('DELETE FROM [dbo].[ReqMaterial] WHERE idReqMaterial = @idReqMaterial');
    return NextResponse.json({ message: 'Solicitud de material eliminada' });
  } catch (error) {
    console.error('Error al eliminar solicitud de material:', error);
    return NextResponse.json({ message: 'Error al eliminar la solicitud de material' }, { status: 500 });
  }
}

// PATCH /api/reqmaterial/:id/aprobar
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const { IdUsuarioUltMod } = await request.json();
    const pool = await getConnection();
    await pool.request()
      .input('idReqMaterial', sql.Int, id)
      .input('EstadoReq', sql.VarChar, '100')
      .input('FechaAproba', sql.DateTime, new Date())
      .input('FechaUltMod', sql.DateTime, new Date())
      .input('IdUsuarioUltMod', sql.Int, IdUsuarioUltMod)
      .query(`
        UPDATE [dbo].[ReqMaterial]
        SET EstadoReq = @EstadoReq,
            FechaAproba = @FechaAproba,
            FechaUltMod = @FechaUltMod,
            IdUsuarioUltMod = @IdUsuarioUltMod
        WHERE idReqMaterial = @idReqMaterial
      `);
    return NextResponse.json({ message: 'Requerimiento aprobado' });
  } catch (error) {
    console.error('Error al aprobar requerimiento:', error);
    return NextResponse.json({ message: 'Error al aprobar el requerimiento' }, { status: 500 });
  }
} 