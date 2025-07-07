export interface Empleado {
  idEmpleado: number
  usuario: string
  paterno: string
  materno: string
  pnombre: string
  snombre: string
  nombreCompleto: string
  email: string
  telefono: string
  direccion: string
  idFilial: number
  filialNombre: string
  estado: "ACT" | "INA"
}

export interface Filial {
  idFilial: number;
  descripcion: string;
  estado: string;
}

const API_BASE_URL = '/api';

export async function getEmpleados(): Promise<Empleado[]> {
  const response = await fetch(`${API_BASE_URL}/empleados`);
  if (!response.ok) {
    throw new Error('Error al obtener los empleados');
  }
  return response.json();
}

export async function getEmpleado(id: number): Promise<Empleado | undefined> {
  const response = await fetch(`${API_BASE_URL}/empleados/${id}`);
  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error('Error al obtener el empleado');
  }
  return response.json();
}

export async function createEmpleado(empleadoData: Omit<Empleado, 'idEmpleado' | 'nombreCompleto' | 'filialNombre'>): Promise<Empleado> {
  const response = await fetch(`${API_BASE_URL}/empleados`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(empleadoData),
  });
  if (!response.ok) {
    throw new Error('Error al crear el empleado');
  }
  return response.json();
}

export async function updateEmpleado(id: number, empleadoData: Partial<Empleado>): Promise<Empleado> {
  const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(empleadoData),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar el empleado');
  }
  return response.json();
}

export async function deleteEmpleado(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar el empleado');
  }
}

export async function getFiliales(): Promise<Filial[]> {
    const response = await fetch(`${API_BASE_URL}/filiales`);
    if (!response.ok) {
        throw new Error('Error al obtener las filiales');
    }
    return response.json();
}

// TODO: The following interfaces and functions use simulated data and should be replaced
// with API calls to their corresponding endpoints.

export interface Abonado {
  idAbonado: number;
  idFilial: number;
  filialNombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  primerNombre: string;
  segundoNombre: string;
  nombreCompleto: string;
  direccion: string;
  telefono: string;
  email: string;
  estado: "ACT" | "SUS" | "COR" | "INA";
  fechaAlta: Date;
  idRuta: number;
  rutaNombre: string;
  observaciones?: string;
  indEliminacion: boolean;
}

export interface Ruta {
  idRuta: number;
  descripcionRuta: string;
  idFilial: number;
  estado: string;
}

// Simulated data (should be removed once backend is fully connected)
const filialesData: Filial[] = [
    { idFilial: 1, descripcion: "Filial Central", estado: "ACT" },
    { idFilial: 2, descripcion: "Filial Norte", estado: "ACT" },
    { idFilial: 3, descripcion: "Filial Sur", estado: "INA" },
];

const empleadosData: any[] = [];
const abonadosData: any[] = [];
const rutasData: any[] = [];

// Funciones de API simuladas
export const getDashboardMetrics = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    totalEmpleados: empleadosData.length,
    empleadosActivos: empleadosData.filter((e) => e.estado === "ACT").length,
    totalAbonados: abonadosData.length,
    abonadosActivos: abonadosData.filter((a) => a.estado === "ACT").length,
    totalFiliales: filialesData.filter((f) => f.estado === "ACT").length,
    serviciosActivos: 156,
    facturacionMensual: 125000,
    crecimientoMensual: 12.5,
  }
}

export const getEmpleadosPorFilial = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const data = filialesData.map((filial) => ({
    filial: filial.descripcion,
    empleados: empleadosData.filter((e) => e.idFilial === filial.idFilial).length,
  }))

  return {
    labels: data.map((d) => d.filial),
    datasets: [
      {
        label: "Empleados",
        data: data.map((d) => d.empleados),
        backgroundColor: "rgba(37, 99, 235, 0.8)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 1,
      },
    ],
  }
}

export const getAbonadosPorEstado = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const estados = {
    ACT: { label: "Activos", color: "rgba(16, 185, 129, 0.8)" },
    SUS: { label: "Suspendidos", color: "rgba(245, 158, 11, 0.8)" },
    COR: { label: "Cortados", color: "rgba(239, 68, 68, 0.8)" },
    INA: { label: "Inactivos", color: "rgba(107, 114, 128, 0.8)" },
  }

  const data = Object.entries(estados).map(([estado, config]) => ({
    estado,
    label: config.label,
    count: abonadosData.filter((a) => a.estado === estado).length,
    color: config.color,
  }))

  return {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) => d.color),
        borderWidth: 2,
      },
    ],
  }
}

export const getEvolucionMensual = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
  const altas = [15, 22, 18, 25, 30, 28]

  return {
    labels: meses,
    datasets: [
      {
        label: "Nuevos Abonados",
        data: altas,
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  }
}

export const getAbonados = async (): Promise<Abonado[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return abonadosData.filter((a) => !a.indEliminacion)
}

export const createAbonado = async (abonado: Partial<Abonado>): Promise<Abonado> => {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const newAbonado: Abonado = {
    idAbonado: Math.max(...abonadosData.map((a) => a.idAbonado)) + 1,
    idFilial: abonado.idFilial!,
    filialNombre: filialesData.find((f) => f.idFilial === abonado.idFilial)?.descripcion || "",
    apellidoPaterno: abonado.apellidoPaterno!,
    apellidoMaterno: abonado.apellidoMaterno || "",
    primerNombre: abonado.primerNombre!,
    segundoNombre: abonado.segundoNombre || "",
    nombreCompleto:
      `${abonado.primerNombre} ${abonado.segundoNombre || ""} ${abonado.apellidoPaterno} ${abonado.apellidoMaterno || ""}`.trim(),
    direccion: abonado.direccion!,
    telefono: abonado.telefono!,
    email: abonado.email || "",
    estado: (abonado.estado as "ACT" | "SUS" | "COR" | "INA") || "ACT",
    fechaAlta: new Date(),
    idRuta: abonado.idRuta!,
    rutaNombre: rutasData.find((r) => r.idRuta === abonado.idRuta)?.descripcionRuta || "",
    observaciones: abonado.observaciones,
    indEliminacion: false,
  }

  abonadosData.push(newAbonado)
  return newAbonado
}

export const updateAbonado = async (id: number, abonado: Partial<Abonado>): Promise<Abonado> => {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const index = abonadosData.findIndex((a) => a.idAbonado === id)
  if (index === -1) throw new Error("Abonado no encontrado")

  const updatedAbonado = {
    ...abonadosData[index],
    ...abonado,
    nombreCompleto:
      `${abonado.primerNombre || abonadosData[index].primerNombre} ${abonado.segundoNombre || abonadosData[index].segundoNombre || ""} ${abonado.apellidoPaterno || abonadosData[index].apellidoPaterno} ${abonado.apellidoMaterno || abonadosData[index].apellidoMaterno || ""}`.trim(),
    filialNombre: abonado.idFilial
      ? filialesData.find((f) => f.idFilial === abonado.idFilial)?.descripcion || ""
      : abonadosData[index].filialNombre,
    rutaNombre: abonado.idRuta
      ? rutasData.find((r) => r.idRuta === abonado.idRuta)?.descripcionRuta || ""
      : abonadosData[index].rutaNombre,
  }

  abonadosData[index] = updatedAbonado
  return updatedAbonado
}

export const deleteAbonado = async (id: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = abonadosData.findIndex((a) => a.idAbonado === id)
  if (index === -1) throw new Error("Abonado no encontrado")

  abonadosData[index].indEliminacion = true
}


export const getRutas = async (): Promise<Ruta[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return rutasData
}
