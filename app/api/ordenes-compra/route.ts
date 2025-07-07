import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';
import { getRedis } from '@/lib/redis';

// GET /api/ordenes-compra?page=1&pageSize=10
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSizeParam = searchParams.get('pageSize') || '10';
    const pageSize = pageSizeParam.toLowerCase() === 'all' || pageSizeParam.toLowerCase() === 'todos' ? null : parseInt(pageSizeParam, 10);
    const offset = pageSize ? (page - 1) * pageSize : 0;
    const redis = await getRedis();
    const cacheKey = `ordenes-compra:page=${page}:size=${pageSize}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }
    const pool = await getConnection();

    // Contar total de registros
    const totalResult = await pool.request().query('SELECT COUNT(*) as total FROM [dbo].[OrdenCompra]');
    const total = totalResult.recordset[0].total;

    // Consulta principal con joins a Proveedor, Almacen, Usuario (MiCable)
    let query = `
      SELECT OC.IdOC, OC.FechaOC, OC.EstadoOC, OC.TotalOC, OC.Observaciones,
             P.RazonSocial as Proveedor, A.NombreAlmacen as Almacen, U.nombres as UsuarioCreador
      FROM [dbo].[OrdenCompra] OC
      LEFT JOIN [dbo].[Proveedor] P ON OC.idProveedor = P.IdProveedor
      LEFT JOIN [dbo].[Almacen] A ON OC.IdAlmacenDestino = A.IdAlmacen
      LEFT JOIN [MiCable].[Usuario] U ON OC.IdUsuarioIng = U.id
      ORDER BY OC.IdOC DESC
    `;
    if (pageSize) {
      query += ` OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
    }
    const result = await pool.request().query(query);
    const response = {
      data: result.recordset,
      total,
      page,
      pageSize: pageSize || 'All',
    };
    await redis.set(cacheKey, JSON.stringify(response), { EX: 60 });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al listar ordenes de compra:', error);
    return NextResponse.json({ message: 'Error al obtener las órdenes de compra' }, { status: 500 });
  }
}

// POST /api/ordenes-compra
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const pool = await getConnection();
    // Obtener el id del usuario autenticado (debe venir en el body o en el contexto de sesión)
    // Aquí asumimos que viene en data.IdUsuarioIng
    // En producción, deberías obtenerlo del contexto de sesión/token
    const userId = data.IdUsuarioIng;
    const fechaEntrega = data.FechaEntrega ? new Date(data.FechaEntrega) : null;
    // Insertar cabecera
    const cabeceraRequest = pool.request()
      .input('idFilial', sql.Int, data.idFilial)
      .input('IdAlmacenDestino', sql.Int, data.IdAlmacenDestino)
      .input('idProveedor', sql.Int, data.idProveedor)
      .input('EstadoOC', sql.VarChar, data.EstadoOC)
      .input('FechaOC', sql.DateTime, data.FechaOC)
      .input('Observaciones', sql.VarChar, data.Observaciones)
      .input('CodMoneda', sql.VarChar, data.CodMoneda)
      .input('BaseImponible', sql.Decimal(15,4), data.BaseImponible)
      .input('Impuesto', sql.Decimal(15,4), data.Impuesto)
      .input('TotalOC', sql.Decimal(15,4), data.TotalOC)
      .input('IdUsuarioIng', sql.Int, userId)
      .input('FechaIng', sql.DateTime, new Date());
    if (fechaEntrega) {
      cabeceraRequest.input('FechaEntrega', sql.DateTime, fechaEntrega);
    }
    const cabeceraResult = await cabeceraRequest.query(`
      INSERT INTO [dbo].[OrdenCompra]
        (idFilial, IdAlmacenDestino, idProveedor, EstadoOC, FechaOC, Observaciones, CodMoneda, ${fechaEntrega ? 'FechaEntrega,' : ''} BaseImponible, Impuesto, TotalOC, IdUsuarioIng, FechaIng)
      OUTPUT INSERTED.IdOC
      VALUES (@idFilial, @IdAlmacenDestino, @idProveedor, @EstadoOC, @FechaOC, @Observaciones, @CodMoneda, ${fechaEntrega ? '@FechaEntrega,' : ''} @BaseImponible, @Impuesto, @TotalOC, @IdUsuarioIng, @FechaIng)
    `);
    const newIdOC = cabeceraResult.recordset[0].IdOC;
    // Insertar detalles
    for (const det of data.detalles) {
      await pool.request()
        .input('IdOC', sql.Int, newIdOC)
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
    // Limpiar cache de listados
    const redis = await getRedis();
    await redis.del('ordenes-compra:*');
    return NextResponse.json({ message: 'Orden de compra creada', IdOC: newIdOC });
  } catch (error) {
    console.error('Error al crear orden de compra:', error);
    return NextResponse.json({ message: 'Error al crear la orden de compra' }, { status: 500 });
  }
} 