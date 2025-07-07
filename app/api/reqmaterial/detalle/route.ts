import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';

// GET /api/reqmaterial/detalle?idReqMaterial=123
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idReqMaterial = parseInt(searchParams.get('idReqMaterial') || '0', 10);
    if (!idReqMaterial) return NextResponse.json([]);
    const pool = await getConnection();
    const result = await pool.request()
      .input('idReqMaterial', sql.Int, idReqMaterial)
      .query(`
        SELECT D.*, M.DscMaterial, Ma.Marca, Mo.Modelo, P.RazonSocial as Proveedor
        FROM [dbo].[DetReqMaterial] D
        LEFT JOIN [dbo].[Material] M ON D.CodMaterial = M.CodMaterial
        LEFT JOIN [dbo].[Marca] Ma ON D.idMarca = Ma.idMarca
        LEFT JOIN [dbo].[Modelo] Mo ON D.idModelo = Mo.idModelo
        LEFT JOIN [dbo].[Proveedor] P ON D.idProveedor = P.idProveedor
        WHERE D.idReqMaterial = @idReqMaterial
      `);
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error al listar detalles de solicitud de material:', error);
    return NextResponse.json({ message: 'Error al obtener los detalles' }, { status: 500 });
  }
}

// POST /api/reqmaterial/detalle
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const pool = await getConnection();
    const userId = data.idUsuarioIng;
    const result = await pool.request()
      .input('idReqMaterial', sql.Int, data.idReqMaterial)
      .input('CodMaterial', sql.VarChar, data.CodMaterial)
      .input('idMarca', sql.Int, data.idMarca)
      .input('idModelo', sql.Int, data.idModelo)
      .input('EspAdicionales', sql.VarChar, data.EspAdicionales)
      .input('CantSolicitada', sql.Decimal(15,4), data.CantSolicitada)
      .input('CantTransferir', sql.Decimal(15,4), data.CantTransferir)
      .input('ModalidadAtencion', sql.VarChar, data.ModalidadAtencion)
      .input('PrecioMat', sql.Decimal(15,4), data.PrecioMat)
      .input('EstadoDetReq', sql.VarChar, data.EstadoDetReq)
      .input('idProveedor', sql.Int, data.idProveedor)
      .input('idUsuarioIng', sql.Int, userId)
      .input('FechaIng', sql.DateTime, new Date())
      .input('IdUsuarioUltMod', sql.Int, data.IdUsuarioUltMod)
      .input('FechaUltMod', sql.DateTime, data.FechaUltMod ? new Date(data.FechaUltMod) : null)
      .input('CodMoneda', sql.VarChar, data.CodMoneda)
      .input('CantAtendida', sql.Decimal(15,4), data.CantAtendida)
      .query(`
        INSERT INTO [dbo].[DetReqMaterial]
          (idReqMaterial, CodMaterial, idMarca, idModelo, EspAdicionales, CantSolicitada, CantTransferir, ModalidadAtencion, PrecioMat, EstadoDetReq, idProveedor, idUsuarioIng, FechaIng, IdUsuarioUltMod, FechaUltMod, CodMoneda, CantAtendida)
        VALUES (@idReqMaterial, @CodMaterial, @idMarca, @idModelo, @EspAdicionales, @CantSolicitada, @CantTransferir, @ModalidadAtencion, @PrecioMat, @EstadoDetReq, @idProveedor, @idUsuarioIng, @FechaIng, @IdUsuarioUltMod, @FechaUltMod, @CodMoneda, @CantAtendida)
      `);
    return NextResponse.json({ message: 'Detalle creado' });
  } catch (error) {
    console.error('Error al crear detalle de solicitud de material:', error);
    return NextResponse.json({ message: 'Error al crear el detalle' }, { status: 500 });
  }
}

// PUT /api/reqmaterial/detalle/:id
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const data = await request.json();
    const pool = await getConnection();
    await pool.request()
      .input('IdDetReqMaterial', sql.Int, id)
      .input('CodMaterial', sql.VarChar, data.CodMaterial)
      .input('idMarca', sql.Int, data.idMarca)
      .input('idModelo', sql.Int, data.idModelo)
      .input('EspAdicionales', sql.VarChar, data.EspAdicionales)
      .input('CantSolicitada', sql.Decimal(15,4), data.CantSolicitada)
      .input('CantTransferir', sql.Decimal(15,4), data.CantTransferir)
      .input('ModalidadAtencion', sql.VarChar, data.ModalidadAtencion)
      .input('PrecioMat', sql.Decimal(15,4), data.PrecioMat)
      .input('EstadoDetReq', sql.VarChar, data.EstadoDetReq)
      .input('idProveedor', sql.Int, data.idProveedor)
      .input('idUsuarioIng', sql.Int, data.idUsuarioIng)
      .input('FechaIng', sql.DateTime, data.FechaIng)
      .input('IdUsuarioUltMod', sql.Int, data.IdUsuarioUltMod)
      .input('FechaUltMod', sql.DateTime, data.FechaUltMod ? new Date(data.FechaUltMod) : null)
      .input('CodMoneda', sql.VarChar, data.CodMoneda)
      .input('CantAtendida', sql.Decimal(15,4), data.CantAtendida)
      .query(`
        UPDATE [dbo].[DetReqMaterial]
        SET CodMaterial = @CodMaterial, idMarca = @idMarca, idModelo = @idModelo, EspAdicionales = @EspAdicionales,
            CantSolicitada = @CantSolicitada, CantTransferir = @CantTransferir, ModalidadAtencion = @ModalidadAtencion,
            PrecioMat = @PrecioMat, EstadoDetReq = @EstadoDetReq, idProveedor = @idProveedor, idUsuarioIng = @idUsuarioIng,
            FechaIng = @FechaIng, IdUsuarioUltMod = @IdUsuarioUltMod, FechaUltMod = @FechaUltMod, CodMoneda = @CodMoneda, CantAtendida = @CantAtendida
        WHERE IdDetReqMaterial = @IdDetReqMaterial
      `);
    return NextResponse.json({ message: 'Detalle actualizado' });
  } catch (error) {
    console.error('Error al actualizar detalle de solicitud de material:', error);
    return NextResponse.json({ message: 'Error al actualizar el detalle' }, { status: 500 });
  }
}

// DELETE /api/reqmaterial/detalle/:id
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const pool = await getConnection();
    await pool.request().input('IdDetReqMaterial', sql.Int, id).query('DELETE FROM [dbo].[DetReqMaterial] WHERE IdDetReqMaterial = @IdDetReqMaterial');
    return NextResponse.json({ message: 'Detalle eliminado' });
  } catch (error) {
    console.error('Error al eliminar detalle de solicitud de material:', error);
    return NextResponse.json({ message: 'Error al eliminar el detalle' }, { status: 500 });
  }
} 