"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, UserCheck, Building2, TrendingUp, DollarSign, Activity, Calendar } from "lucide-react"
import { Bar, Doughnut, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js"
import { useAuth } from "@/lib/auth-context"
import { getDashboardMetrics, getEmpleadosPorFilial, getAbonadosPorEstado, getEvolucionMensual } from "@/lib/api"
import { ProtectedRoute } from "@/components/auth/protected-route"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

interface DashboardMetrics {
  totalEmpleados: number
  empleadosActivos: number
  totalAbonados: number
  abonadosActivos: number
  totalFiliales: number
  serviciosActivos: number
  facturacionMensual: number
  crecimientoMensual: number
}

function DashboardContent() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [empleadosData, setEmpleadosData] = useState<any>(null)
  const [abonadosData, setAbonadosData] = useState<any>(null)
  const [evolucionData, setEvolucionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [metricsData, empleados, abonados, evolucion] = await Promise.all([
          getDashboardMetrics(),
          getEmpleadosPorFilial(),
          getAbonadosPorEstado(),
          getEvolucionMensual(),
        ])

        setMetrics(metricsData)
        setEmpleadosData(empleados)
        setAbonadosData(abonados)
        setEvolucionData(evolucion)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Empleados por Filial",
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "Abonados por Estado",
      },
    },
  }

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Evolución Mensual de Altas",
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bienvenido, {user?.nombreCompleto}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalEmpleados}</div>
            <p className="text-xs text-blue-100">{metrics?.empleadosActivos} activos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Abonados</CardTitle>
            <UserCheck className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalAbonados}</div>
            <p className="text-xs text-green-100">{metrics?.abonadosActivos} activos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filiales Activas</CardTitle>
            <Building2 className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalFiliales}</div>
            <p className="text-xs text-purple-100">En operación</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturación Mensual</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.facturacionMensual?.toLocaleString()}</div>
            <p className="text-xs text-orange-100 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />+{metrics?.crecimientoMensual}% vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Empleados por Filial
            </CardTitle>
          </CardHeader>
          <CardContent>{empleadosData && <Bar data={empleadosData} options={barOptions} />}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Distribución de Abonados
            </CardTitle>
          </CardHeader>
          <CardContent>{abonadosData && <Doughnut data={abonadosData} options={doughnutOptions} />}</CardContent>
        </Card>
      </div>

      {/* Gráfico de evolución */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Evolución Mensual
          </CardTitle>
        </CardHeader>
        <CardContent>{evolucionData && <Line data={evolucionData} options={lineOptions} />}</CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
