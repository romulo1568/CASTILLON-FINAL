"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { createAbonado, updateAbonado, getFiliales, getRutas, type Abonado, type Filial, type Ruta } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AbonadoFormProps {
  abonado?: Abonado | null
  onSuccess: () => void
  onCancel: () => void
}

export function AbonadoForm({ abonado, onSuccess, onCancel }: AbonadoFormProps) {
  const [formData, setFormData] = useState({
    apellidoPaterno: "",
    apellidoMaterno: "",
    primerNombre: "",
    segundoNombre: "",
    direccion: "",
    telefono: "",
    email: "",
    idFilial: "",
    idRuta: "",
    estado: "ACT",
    observaciones: "",
  })
  const [filiales, setFiliales] = useState<Filial[]>([])
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    loadFiliales()
    loadRutas()
    if (abonado) {
      setFormData({
        apellidoPaterno: abonado.apellidoPaterno,
        apellidoMaterno: abonado.apellidoMaterno,
        primerNombre: abonado.primerNombre,
        segundoNombre: abonado.segundoNombre,
        direccion: abonado.direccion,
        telefono: abonado.telefono,
        email: abonado.email,
        idFilial: abonado.idFilial.toString(),
        idRuta: abonado.idRuta.toString(),
        estado: abonado.estado,
        observaciones: abonado.observaciones || "",
      })
    }
  }, [abonado])

  const loadFiliales = async () => {
    try {
      const data = await getFiliales()
      setFiliales(data)
    } catch (error) {
      console.error("Error loading filiales:", error)
    }
  }

  const loadRutas = async () => {
    try {
      const data = await getRutas()
      setRutas(data)
    } catch (error) {
      console.error("Error loading rutas:", error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.primerNombre.trim()) newErrors.primerNombre = "Primer nombre es requerido"
    if (!formData.apellidoPaterno.trim()) newErrors.apellidoPaterno = "Apellido paterno es requerido"
    if (!formData.direccion.trim()) newErrors.direccion = "Dirección es requerida"
    if (!formData.telefono.trim()) newErrors.telefono = "Teléfono es requerido"
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email no válido"
    if (!formData.idFilial) newErrors.idFilial = "Filial es requerida"
    if (!formData.idRuta) newErrors.idRuta = "Ruta es requerida"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const abonadoData = {
        ...formData,
        idFilial: Number.parseInt(formData.idFilial),
        idRuta: Number.parseInt(formData.idRuta),
      }

      if (abonado) {
        await updateAbonado(abonado.idAbonado, abonadoData)
        toast({
          title: "Éxito",
          description: "Abonado actualizado correctamente",
        })
      } else {
        await createAbonado(abonadoData)
        toast({
          title: "Éxito",
          description: "Abonado creado correctamente",
        })
      }

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el abonado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primerNombre">Primer Nombre *</Label>
              <Input
                id="primerNombre"
                value={formData.primerNombre}
                onChange={(e) => handleChange("primerNombre", e.target.value)}
                className={errors.primerNombre ? "border-red-500" : ""}
              />
              {errors.primerNombre && <p className="text-sm text-red-500">{errors.primerNombre}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="segundoNombre">Segundo Nombre</Label>
              <Input
                id="segundoNombre"
                value={formData.segundoNombre}
                onChange={(e) => handleChange("segundoNombre", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
              <Input
                id="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={(e) => handleChange("apellidoPaterno", e.target.value)}
                className={errors.apellidoPaterno ? "border-red-500" : ""}
              />
              {errors.apellidoPaterno && <p className="text-sm text-red-500">{errors.apellidoPaterno}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
              <Input
                id="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={(e) => handleChange("apellidoMaterno", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                className={errors.telefono ? "border-red-500" : ""}
              />
              {errors.telefono && <p className="text-sm text-red-500">{errors.telefono}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idFilial">Filial *</Label>
              <Select value={formData.idFilial} onValueChange={(value) => handleChange("idFilial", value)}>
                <SelectTrigger className={errors.idFilial ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccione una filial" />
                </SelectTrigger>
                <SelectContent>
                  {filiales.map((filial) => (
                    <SelectItem key={filial.idFilial} value={filial.idFilial.toString()}>
                      {filial.descripcionFilial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idFilial && <p className="text-sm text-red-500">{errors.idFilial}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idRuta">Ruta *</Label>
              <Select value={formData.idRuta} onValueChange={(value) => handleChange("idRuta", value)}>
                <SelectTrigger className={errors.idRuta ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccione una ruta" />
                </SelectTrigger>
                <SelectContent>
                  {rutas.map((ruta) => (
                    <SelectItem key={ruta.idRuta} value={ruta.idRuta.toString()}>
                      {ruta.descripcionRuta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.idRuta && <p className="text-sm text-red-500">{errors.idRuta}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => handleChange("estado", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACT">Activo</SelectItem>
                  <SelectItem value="SUS">Suspendido</SelectItem>
                  <SelectItem value="COR">Cortado</SelectItem>
                  <SelectItem value="INA">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección *</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
              className={errors.direccion ? "border-red-500" : ""}
            />
            {errors.direccion && <p className="text-sm text-red-500">{errors.direccion}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleChange("observaciones", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : abonado ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
