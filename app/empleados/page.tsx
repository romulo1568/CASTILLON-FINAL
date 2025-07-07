"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Users, Filter, Download } from "lucide-react"
import { EmpleadoForm } from "@/components/empleados/empleado-form"
import { getEmpleados, deleteEmpleado, type Empleado } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("all")
  const [filterFilial, setFilterFilial] = useState("all")
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()

  useEffect(() => {
    loadEmpleados()
  }, [])

  useEffect(() => {
    filterEmpleados()
  }, [empleados, searchTerm, filterEstado, filterFilial])

  const loadEmpleados = async () => {
    try {
      const data = await getEmpleados()
      setEmpleados(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterEmpleados = () => {
    let filtered = empleados

    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterEstado !== "all") {
      filtered = filtered.filter((emp) => emp.estado === filterEstado)
    }

    if (filterFilial !== "all") {
      filtered = filtered.filter((emp) => emp.filialNombre === filterFilial)
    }

    setFilteredEmpleados(filtered)
    setCurrentPage(1)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de eliminar este empleado?")) {
      try {
        await deleteEmpleado(id)
        await loadEmpleados()
        toast({
          title: "Éxito",
          description: "Empleado eliminado correctamente",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el empleado",
          variant: "destructive",
        })
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedEmpleado(null)
    loadEmpleados()
  }

  const exportToExcel = () => {
    // Simulación de exportación
    toast({
      title: "Exportando",
      description: "Los datos se están exportando a Excel...",
    })
  }

  const paginatedEmpleados = filteredEmpleados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredEmpleados.length / itemsPerPage)

  const filiales = [...new Set(empleados.map((emp) => emp.filialNombre))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Gestión de Empleados
          </h1>
          <p className="text-gray-600">Administre los empleados del sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedEmpleado ? "Editar Empleado" : "Nuevo Empleado"}</DialogTitle>
              </DialogHeader>
              <EmpleadoForm
                empleado={selectedEmpleado}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsFormOpen(false)
                  setSelectedEmpleado(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACT">Activo</SelectItem>
                <SelectItem value="INA">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterFilial} onValueChange={setFilterFilial}>
              <SelectTrigger>
                <SelectValue placeholder="Filial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las filiales</SelectItem>
                {filiales.map((filial) => (
                  <SelectItem key={filial} value={filial}>
                    {filial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredEmpleados.length} de {empleados.length} empleados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Filial</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmpleados.map((empleado) => (
                <TableRow key={empleado.idEmpleado}>
                  <TableCell className="font-medium">{empleado.nombreCompleto}</TableCell>
                  <TableCell>{empleado.usuario}</TableCell>
                  <TableCell>{empleado.email}</TableCell>
                  <TableCell>{empleado.filialNombre}</TableCell>
                  <TableCell>
                    <Badge variant={empleado.estado === "ACT" ? "default" : "secondary"}>
                      {empleado.estado === "ACT" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEmpleado(empleado)
                          setIsFormOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(empleado.idEmpleado)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
