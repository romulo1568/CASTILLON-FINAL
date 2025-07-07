import { NextResponse } from "next/server";

// Datos simulados (deberían ser consistentes con el otro archivo de ruta)
let empleados = [
  {
    idEmpleado: 1,
    usuario: "jperez",
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number.parseInt(params.id);
  const empleado = empleados.find((e) => e.idEmpleado === id);

  if (empleado) {
    return NextResponse.json(empleado);
  } else {
    return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
    try {
        const id = Number.parseInt(params.id);
        const data = await request.json();
        const empleadoIndex = empleados.findIndex((e) => e.idEmpleado === id);

        if (empleadoIndex !== -1) {
            const updatedEmpleado = {
                ...empleados[empleadoIndex],
                ...data,
                nombreCompleto: `${data.pnombre} ${data.snombre} ${data.paterno} ${data.materno}`.replace(/\s+/g, ' ').trim(),
                filialNombre: filiales.find(f => f.idFilial === data.idFilial)?.descripcion || ""
            };
            empleados[empleadoIndex] = updatedEmpleado;
            return NextResponse.json(updatedEmpleado);
        } else {
            return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error al actualizar el empleado", error }, { status: 500 });
    }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
    try {
        const id = Number.parseInt(params.id);
        const empleadoIndex = empleados.findIndex((e) => e.idEmpleado === id);

        if (empleadoIndex !== -1) {
            empleados.splice(empleadoIndex, 1);
            return new Response(null, { status: 204 });
        } else {
            return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error al eliminar el empleado", error }, { status: 500 });
    }
}