import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';
import { getRedis } from '@/lib/redis';

// GET /api/reqmaterial?page=1&pageSize=10
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSizeParam = searchParams.get('pageSize') || '10';
    const pageSize = pageSizeParam.toLowerCase() === 'all' || pageSizeParam.toLowerCase() === 'todos' ? null : parseInt(pageSizeParam, 10);
    const offset = pageSize ? (page - 1) * pageSize : 0;
    const redis = await getRedis();
    const cacheKey = `reqmaterial:page=${page}:size=${pageSize}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }
    const pool = await getConnection();
    const totalResult = await pool.request().query('SELECT COUNT(*) as total FROM [dbo].[ReqMaterial]');
    const total = totalResult.recordset[0].total;
    let query = `
      SELECT R.idReqMaterial, R.idFilial, F.DescripcionFilial, R.FechaReq, R.FechaAcepta, R.FechaAproba,
             R.TipoReq, R.MotivoReq, R.OrigenReq, R.EstadoReq, R.idUsuarioIng, U.nombres as UsuarioIng,
             R.FechaIng, R.IdUsuarioUltMod, U2.nombres as UsuarioUltMod, R.FechaUltMod, R.LugarCompra, R.IdReqMaterialOrigen, R.NumEnvio
      FROM [dbo].[ReqMaterial] R
      LEFT JOIN [dbo].[Filial] F ON R.idFilial = F.idFilial
      LEFT JOIN [MiCable].[Usuario] U ON R.idUsuarioIng = U.id
      LEFT JOIN [MiCable].[Usuario] U2 ON R.IdUsuarioUltMod = U2.id
      ORDER BY R.idReqMaterial DESC
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
    console.error('Error al listar solicitudes de material:', error);
    return NextResponse.json({ message: 'Error al obtener las solicitudes de material' }, { status: 500 });
  }
}

// POST /api/reqmaterial
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const pool = await getConnection();
    const userId = data.idUsuarioIng;
    const cabeceraResult = await pool.request()
      .input('idFilial', sql.Int, data.idFilial)
      .input('FechaReq', sql.DateTime, data.FechaReq)
      .input('FechaAcepta', sql.DateTime, data.FechaAcepta)
      .input('FechaAproba', sql.DateTime, data.FechaAproba)
      .input('TipoReq', sql.VarChar, data.TipoReq)
      .input('MotivoReq', sql.VarChar, data.MotivoReq)
      .input('OrigenReq', sql.VarChar, data.OrigenReq)
      .input('EstadoReq', sql.VarChar, data.EstadoReq)
      .input('idUsuarioIng', sql.Int, userId)
      .input('FechaIng', sql.DateTime, new Date())
      .input('IdUsuarioUltMod', sql.Int, data.IdUsuarioUltMod)
      .input('FechaUltMod', sql.DateTime, data.FechaUltMod ? new Date(data.FechaUltMod) : null)
      .input('LugarCompra', sql.VarChar, data.LugarCompra)
      .input('IdReqMaterialOrigen', sql.Int, data.IdReqMaterialOrigen)
      .input('NumEnvio', sql.Int, data.NumEnvio)
      .query(`
        INSERT INTO [dbo].[ReqMaterial]
          (idFilial, FechaReq, FechaAcepta, FechaAproba, TipoReq, MotivoReq, OrigenReq, EstadoReq, idUsuarioIng, FechaIng, IdUsuarioUltMod, FechaUltMod, LugarCompra, IdReqMaterialOrigen, NumEnvio)
        OUTPUT INSERTED.idReqMaterial
        VALUES (@idFilial, @FechaReq, @FechaAcepta, @FechaAproba, @TipoReq, @MotivoReq, @OrigenReq, @EstadoReq, @idUsuarioIng, @FechaIng, @IdUsuarioUltMod, @FechaUltMod, @LugarCompra, @IdReqMaterialOrigen, @NumEnvio)
      `);
    const newId = cabeceraResult.recordset[0].idReqMaterial;
    // Insertar detalles si existen
    if (Array.isArray(data.detalles) && data.detalles.length > 0) {
      for (const detalle of data.detalles) {
        await pool.request()
          .input('idReqMaterial', sql.Int, newId)
          .input('CodMaterial', sql.VarChar, detalle.CodMaterial)
          .input('idMarca', sql.Int, detalle.idMarca)
          .input('idModelo', sql.Int, detalle.idModelo)
          .input('CantSolicitada', sql.Decimal(15,4), detalle.Cantidad || detalle.CantSolicitada || 0)
          .input('PrecioMat', sql.Decimal(15,4), detalle.Precio || detalle.PrecioMat || 0)
          .input('EstadoDetReq', sql.VarChar, detalle.Estado || '001')
          .input('idProveedor', sql.Int, detalle.idProveedor || null)
          .input('ModalidadAtencion', sql.VarChar, detalle.ModalidadAtencion || null)
          .input('CodMoneda', sql.VarChar, detalle.CodMoneda || null)
          .query(`
            INSERT INTO [dbo].[DetReqMaterial]
              (idReqMaterial, CodMaterial, idMarca, idModelo, CantSolicitada, PrecioMat, EstadoDetReq, idProveedor, ModalidadAtencion, CodMoneda)
            VALUES (@idReqMaterial, @CodMaterial, @idMarca, @idModelo, @CantSolicitada, @PrecioMat, @EstadoDetReq, @idProveedor, @ModalidadAtencion, @CodMoneda)
          `);
      }
    }
    // Limpiar cache de listados
    const redis = await getRedis();
    await redis.del('reqmaterial:*');
    return NextResponse.json({ message: 'Solicitud de material creada', idReqMaterial: newId });
  } catch (error) {
    console.error('Error al crear solicitud de material:', error);
    return NextResponse.json({ message: 'Error al crear la solicitud de material' }, { status: 500 });
  }
} 