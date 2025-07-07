import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';

// GET /api/ordenes-compra/:id
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const pool = await getConnection();

    // Obtener cabecera
    const cabeceraResult = await pool.request()
      .input('IdOC', sql.Int, id)
      .query(`
        SELECT OC.*, P.Nombres as Proveedor, A.NombreAlmacen as Almacen, U.nombres as UsuarioCreador
        FROM [dbo].[OrdenCompra] OC
        LEFT JOIN [dbo].[Proveedor] P ON OC.idProveedor = P.IdProveedor
        LEFT JOIN [dbo].[Almacen] A ON OC.IdAlmacenDestino = A.IdAlmacen
        LEFT JOIN [MiCable].[Usuario] U ON OC.IdUsuarioIng = U.id
        WHERE OC.IdOC = @IdOC
      `);
    if (cabeceraResult.recordset.length === 0) {
      return NextResponse.json({ message: 'Orden de compra no encontrada' }, { status: 404 });
    }
    const cabecera = cabeceraResult.recordset[0];

    // Obtener detalles
    const detallesResult = await pool.request()
      .input('IdOC', sql.Int, id)
      .query(`
        SELECT D.*, M.DscMaterial as Material, Ma.Marca as Marca, Mo.Modelo as Modelo
        FROM [dbo].[DetOrdenCompra] D
        LEFT JOIN [dbo].[Material] M ON D.CodMaterial = M.CodMaterial
        LEFT JOIN [dbo].[Marca] Ma ON D.idMarca = Ma.idMarca
        LEFT JOIN [dbo].[Modelo] Mo ON D.idModelo = Mo.idModelo
        WHERE D.IdOC = @IdOC
      `);

    return NextResponse.json({ ...cabecera, detalles: detallesResult.recordset });
  } catch (error) {
    console.error('Error al obtener detalle de orden de compra:', error);
    return NextResponse.json({ message: 'Error al obtener la orden de compra' }, { status: 500 });
  }
}

// PUT /api/ordenes-compra/:id
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const data = await request.json();
    const pool = await getConnection();
    // Actualizar cabecera
    await pool.request()
      .input('IdOC', sql.Int, id)
      .input('idFilial', sql.Int, data.idFilial)
      .input('IdAlmacenDestino', sql.Int, data.IdAlmacenDestino)
      .input('idProveedor', sql.Int, data.idProveedor)
      .input('EstadoOC', sql.VarChar, data.EstadoOC)
      .input('FechaOC', sql.DateTime, data.FechaOC)
      .input('Observaciones', sql.VarChar, data.Observaciones)
      .input('CodMoneda', sql.VarChar, data.CodMoneda)
      .input('CondicionesPago', sql.VarChar, data.CondicionesPago)
      .input('FechaEntrega', sql.DateTime, data.FechaEntrega)
      .input('LugarEntrega', sql.VarChar, data.LugarEntrega)
      .input('BaseImponible', sql.Decimal(15,4), data.BaseImponible)
      .input('Impuesto', sql.Decimal(15,4), data.Impuesto)
      .input('TotalOC', sql.Decimal(15,4), data.TotalOC)
      .query(`
        UPDATE [dbo].[OrdenCompra]
        SET idFilial = @idFilial, IdAlmacenDestino = @IdAlmacenDestino, idProveedor = @idProveedor,
            EstadoOC = @EstadoOC, FechaOC = @FechaOC, Observaciones = @Observaciones, CodMoneda = @CodMoneda,
            CondicionesPago = @CondicionesPago, FechaEntrega = @FechaEntrega, LugarEntrega = @LugarEntrega,
            BaseImponible = @BaseImponible, Impuesto = @Impuesto, TotalOC = @TotalOC
        WHERE IdOC = @IdOC
      `);
    // Eliminar detalles existentes
    await pool.request().input('IdOC', sql.Int, id).query('DELETE FROM [dbo].[DetOrdenCompra] WHERE IdOC = @IdOC');
    // Insertar nuevos detalles
    for (const det of data.detalles) {
      await pool.request()
        .input('IdOC', sql.Int, id)
        .input('IdDetReqMaterial', sql.Int, det.IdDetReqMaterial)
        .input('Precio', sql.Decimal(15,4), det.Precio)
        .input('Cantidad', sql.Decimal(12,2), det.Cantidad)
        .input('Estado', sql.VarChar, det.Estado)
        .input('CodMaterial', sql.VarChar, det.CodMaterial)
        .input('idMarca', sql.Int, det.idMarca)
        .input('idModelo', sql.Int, det.idModelo)
        .query(`
          INSERT INTO [dbo].[DetOrdenCompra]
            (IdOC, IdDetReqMaterial, Precio, Cantidad, Estado, CodMaterial, idMarca, idModelo)
          VALUES (@IdOC, @IdDetReqMaterial, @Precio, @Cantidad, @Estado, @CodMaterial, @idMarca, @idModelo)
        `);
    }
    return NextResponse.json({ message: 'Orden de compra actualizada' });
  } catch (error) {
    console.error('Error al actualizar orden de compra:', error);
    return NextResponse.json({ message: 'Error al actualizar la orden de compra' }, { status: 500 });
  }
}

// DELETE /api/ordenes-compra/:id
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const pool = await getConnection();
    // Eliminar detalles
    await pool.request().input('IdOC', sql.Int, id).query('DELETE FROM [dbo].[DetOrdenCompra] WHERE IdOC = @IdOC');
    // Eliminar cabecera
    await pool.request().input('IdOC', sql.Int, id).query('DELETE FROM [dbo].[OrdenCompra] WHERE IdOC = @IdOC');
    return NextResponse.json({ message: 'Orden de compra eliminada' });
  } catch (error) {
    console.error('Error al eliminar orden de compra:', error);
    return NextResponse.json({ message: 'Error al eliminar la orden de compra' }, { status: 500 });
  }
} 