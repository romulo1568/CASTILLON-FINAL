import { NextResponse } from 'next/server';

export async function GET() {
  // Catálogos hardcodeados según códigos de la BD y ejemplos previos
  const catalogos = {
    TipoReq: [
      { codigo: '001', label: 'Compra' },
      { codigo: '002', label: 'Transferencia' },
      { codigo: '003', label: 'Donación' },
      { codigo: '004', label: 'Reposición' },
      { codigo: '005', label: 'Devolución' },
      { codigo: '006', label: 'Otro' },
    ],
    MotivoReq: [
      { codigo: '001', label: 'Stock mínimo' },
      { codigo: '002', label: 'Proyecto' },
      { codigo: '003', label: 'Mantenimiento' },
      { codigo: '004', label: 'Emergencia' },
      { codigo: '005', label: 'Producción' },
      { codigo: '006', label: 'Obsolescencia' },
      { codigo: '007', label: 'Otro' },
      { codigo: '018', label: 'Motivo especial' }, // ejemplo, agregar todos los que falten
    ],
    OrigenReq: [
      { codigo: '001', label: 'Almacén' },
      { codigo: '002', label: 'Área usuaria' },
      { codigo: '003', label: 'Proyecto' },
    ],
    EstadoReq: [
      { codigo: '099', label: 'Pendiente' },
      { codigo: '002', label: 'En revisión' },
      { codigo: '003', label: 'En revisión' }, // Si hay otro código anterior de pendiente, renombrar
      { codigo: '004', label: 'Observado' },
      { codigo: '005', label: 'Rechazado' },
      { codigo: '006', label: 'Registrado' },
      { codigo: '007', label: 'Aprobado (antiguo)' },
      { codigo: '008', label: 'Atendido' },
      { codigo: '009', label: 'Anulado' },
      { codigo: '100', label: 'Aprobado' },
      // Si aparece un código desconocido, el frontend mostrará 'Desconocido (código)'
    ],
    ModalidadAtencion: [
      { codigo: '001', label: 'Compra' },
      { codigo: '002', label: 'Transferencia' },
      { codigo: '003', label: 'Donación' },
    ],
    EstadoDetReq: [
      { codigo: '001', label: 'Pendiente' },
      { codigo: '002', label: 'Atendido' },
      { codigo: '003', label: 'Anulado' },
    ],
    CodMoneda: [
      { codigo: '001', label: 'PEN' },
      { codigo: '002', label: 'USD' },
    ],
  };
  return NextResponse.json(catalogos);
} 