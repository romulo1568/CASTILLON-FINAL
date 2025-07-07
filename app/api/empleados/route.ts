import { NextResponse } from "next/server";

// Datos simulados (reemplazar con la conexión a la base de datos)
const empleados = [
  {
    idEmpleado: 1,
    usuario: "jerez",
    paterno: "Perez",
    materno: "Gomez",
    pnombre: "Juan",
    snombre: "Carlos",
    idFilial: 1,
    idEmpresa: 1,
    estado: "ACT",
    nombreCompleto: "Juan Carlos Perez Gomez",
    email: "juan.perez@example.com",
    telefono: "123456789",
    direccion: "Calle Falsa 123",
    filialNombre: "Filial Principal",
  },
  {
    idEmpleado: 2,
    usuario: "mgomez",
    paterno: "Gomez",
    materno: "Lopez",
    pnombre: "Maria",
    snombre: "",
    idFilial: 2,
    idEmpresa: 1,
    estado: "INA",
    nombreCompleto: "Maria Gomez Lopez",
    email: "maria.gomez@example.com",
    telefono: "987654321",
    direccion: "Avenida Siempre Viva 742",
    filialNombre: "Filial Secundaria",
  },
];

const filiales = [
    {
        idFilial: 1,
        descripcion: "Filial Principal",
        estado: "ACT"
    },
    {
        idFilial: 2,
        descripcion: "Filial Secundaria",
        estado: "ACT"
    }
]

export async function GET() {
  // Simular un retraso de la red
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return NextResponse.json(empleados);
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const newEmpleado = {
            idEmpleado: Math.max(...empleados.map(e => e.idEmpleado)) + 1, // Simular autoincremento
            ...data,
            nombreCompleto: `${data.pnombre} ${data.snombre} ${data.paterno} ${data.materno}`.replace(/\s+/g, ' ').trim(),
            filialNombre: filiales.find(f => f.idFilial === data.idFilial)?.descripcion || ""
        };

        empleados.push(newEmpleado);

        return NextResponse.json(newEmpleado, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Error al crear el empleado", error }, { status: 500 });
    }
}