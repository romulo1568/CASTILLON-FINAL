"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Building2, Lock, User, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function Login() {
  const [usuario, setUsuario] = useState("")
  const [clave, setClave] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const success = await login(usuario, clave)
      if (success) {
        setSuccess(true)
        // Mostrar alerta de éxito por 2 segundos antes de redirigir
        setTimeout(() => {
        router.push("/")
        }, 2000)
      } else {
        setError("Usuario o contraseña incorrectos")
      }
    } catch (err) {
      setError("Error al iniciar sesión. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestión</h1>
          <p className="text-gray-600 mt-2">Ingrese sus credenciales para continuar</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">Acceda a su cuenta empresarial</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ¡Inicio de sesión exitoso! Redirigiendo al dashboard...
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="usuario">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="usuario"
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading || success}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clave">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="clave"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={loading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={loading || success}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading || success}>
                {loading ? "Iniciando sesión..." : success ? "¡Éxito! Redirigiendo..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Conectado a: 26.139.230.239</p>
              <p>Base de datos: db_econo</p>
              <p>Esquema: MiCable</p>
              <p className="mt-2">Ingrese sus credenciales del sistema</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
