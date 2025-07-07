"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, UserCheck, Filter, MapPin, History } from "lucide-react"
import { AbonadoForm } from "@/components/abonados/abonado-form"
import { getAbonados, deleteAbonado, type Abonado } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function AbonadosPage() {
  const [abonados, setAbonados] = useState<Abonado[]>([])
  const [filteredAbonados, setFilteredAbonados] = useState<Abonado[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("all")
  const [filterFilial, setFilterFilial] = useState("all")
  const [selectedAbonado, setSelectedAbonado] = useState<Abonado | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()

  useEffect(() => {
    loadAbonados()
  }, [])

  useEffect(() => {
    filterAbonados()
  }, [abonados, searchTerm, filterEstado, filterFilial])

  const loadAbonados = async () => {
    try {
      const data = await getAbonados()
      setAbonados(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los abonados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAbonados = () => {
    let filtered = abonados

    if (searchTerm) {
      filtered = filtered.filter(
        (abonado) =>
          abonado.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          abonado.telefono.includes(searchTerm) ||
          abonado.direccion.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterEstado !== "all") {
      filtered = filtered.filter((abonado) => abonado.estado === filterEstado)
    }

    if (filterFilial !== "all") {
      filtered = filtered.filter((abonado) => abonado.filialNombre === filterFilial)
    }

    setFilteredAbonados(filtered)
    setCurrentPage(1)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de eliminar este abonado?")) {
      try {
        await deleteAbonado(id)
        await loadAbonados()
        toast({
          title: "Éxito",
          description: "Abonado eliminado correctamente",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el abonado",
          variant: "destructive",
        })
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedAbonado(null)
    loadAbonados()
  }

  const getEstadoBadge = (estado: string) => {
    const variants = {
      ACT: { variant: "default" as const, label: "Activo" },
      SUS: { variant: "secondary" as const, label: "Suspendido" },
      COR: { variant: "destructive" as const, label: "Cortado" },
      INA: { variant: "outline" as const, label: "Inactivo" },
    }
    return variants[estado as keyof typeof variants] || variants.INA
  }

  const paginatedAbonados = filteredAbonados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredAbonados.length / itemsPerPage)
  const filiales = [...new Set(abonados.map((abonado) => abonado.filialNombre))]

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
            <UserCheck className="h-8 w-8 mr-3 text-green-600" />
            Gestión de Abonados
          </h1>
          <p className="text-gray-600">Administre los abonados del sistema</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Abonado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedAbonado ? "Editar Abonado" : "Nuevo Abonado"}</DialogTitle>
            </DialogHeader>
            <AbonadoForm
              abonado={selectedAbonado}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setIsFormOpen(false)
                setSelectedAbonado(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar abonados..."
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
                <SelectItem value="SUS">Suspendido</SelectItem>
                <SelectItem value="COR">Cortado</SelectItem>
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
                {filteredAbonados.length} de {abonados.length} abonados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Abonados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Filial</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAbonados.map((abonado) => {
                const estadoBadge = getEstadoBadge(abonado.estado)
                return (
                  <TableRow key={abonado.idAbonado}>
                    <TableCell className="font-medium">{abonado.nombreCompleto}</TableCell>
                    <TableCell>{abonado.telefono}</TableCell>
                    <TableCell className="max-w-xs truncate">{abonado.direccion}</TableCell>
                    <TableCell>{abonado.filialNombre}</TableCell>
                    <TableCell>{abonado.rutaNombre}</TableCell>
                    <TableCell>
                      <Badge variant={estadoBadge.variant}>{estadoBadge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAbonado(abonado)
                            setIsFormOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(abonado.idAbonado)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" title="Ver ubicación">
                          <MapPin className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" title="Historial">
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
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
