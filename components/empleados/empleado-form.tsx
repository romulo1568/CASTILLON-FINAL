"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { createEmpleado, updateEmpleado, getFiliales, type Empleado, type Filial } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface EmpleadoFormProps {
  empleado?: Empleado | null
  onSuccess: () => void
  onCancel: () => void
}

export function EmpleadoForm({ empleado, onSuccess, onCancel }: EmpleadoFormProps) {
  const [formData, setFormData] = useState({
    usuario: "",
    clave: "",
    paterno: "",
    materno: "",
    pnombre: "",
    snombre: "",
    email: "",
    telefono: "",
    direccion: "",
    idFilial: "",
    estado: "ACT",
  })
  const [filiales, setFiliales] = useState<Filial[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    loadFiliales()
    if (empleado) {
      setFormData({
        usuario: empleado.usuario,
        clave: "",
        paterno: empleado.paterno,
        materno: empleado.materno,
        pnombre: empleado.pnombre,
        snombre: empleado.snombre,
        email: empleado.email,
        telefono: empleado.telefono,
        direccion: empleado.direccion,
        idFilial: empleado.idFilial.toString(),
        estado: empleado.estado,
      })
    }
  }, [empleado])

  const loadFiliales = async () => {
    try {
      const data = await getFiliales()
      setFiliales(data)
    } catch (error) {
      console.error("Error loading filiales:", error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.usuario.trim()) newErrors.usuario = "Usuario es requerido"
    if (!empleado && !formData.clave.trim()) newErrors.clave = "Contraseña es requerida"
    if (!formData.pnombre.trim()) newErrors.pnombre = "Primer nombre es requerido"
    if (!formData.paterno.trim()) newErrors.paterno = "Apellido paterno es requerido"
    if (!formData.email.trim()) newErrors.email = "Email es requerido"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email no válido"
    if (!formData.idFilial) newErrors.idFilial = "Filial es requerida"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const empleadoData = {
        ...formData,
        idFilial: Number.parseInt(formData.idFilial),
        idEmpresa: 1, // Valor por defecto
      }

      if (empleado) {
        await updateEmpleado(empleado.idEmpleado, empleadoData)
        toast({
          title: "Éxito",
          description: "Empleado actualizado correctamente",
        })
      } else {
        await createEmpleado(empleadoData)
        toast({
          title: "Éxito",
          description: "Empleado creado correctamente",
        })
      }

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el empleado",
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
              <Label htmlFor="usuario">Usuario *</Label>
              <Input
                id="usuario"
                value={formData.usuario}
                onChange={(e) => handleChange("usuario", e.target.value)}
                className={errors.usuario ? "border-red-500" : ""}
              />
              {errors.usuario && <p className="text-sm text-red-500">{errors.usuario}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clave">{empleado ? "Nueva Contraseña (opcional)" : "Contraseña *"}</Label>
              <Input
                id="clave"
                type="password"
                value={formData.clave}
                onChange={(e) => handleChange("clave", e.target.value)}
                className={errors.clave ? "border-red-500" : ""}
              />
              {errors.clave && <p className="text-sm text-red-500">{errors.clave}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pnombre">Primer Nombre *</Label>
              <Input
                id="pnombre"
                value={formData.pnombre}
                onChange={(e) => handleChange("pnombre", e.target.value)}
                className={errors.pnombre ? "border-red-500" : ""}
              />
              {errors.pnombre && <p className="text-sm text-red-500">{errors.pnombre}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="snombre">Segundo Nombre</Label>
              <Input id="snombre" value={formData.snombre} onChange={(e) => handleChange("snombre", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paterno">Apellido Paterno *</Label>
              <Input
                id="paterno"
                value={formData.paterno}
                onChange={(e) => handleChange("paterno", e.target.value)}
                className={errors.paterno ? "border-red-500" : ""}
              />
              {errors.paterno && <p className="text-sm text-red-500">{errors.paterno}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="materno">Apellido Materno</Label>
              <Input id="materno" value={formData.materno} onChange={(e) => handleChange("materno", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
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
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
              />
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
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => handleChange("estado", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACT">Activo</SelectItem>
                  <SelectItem value="INA">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : empleado ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
