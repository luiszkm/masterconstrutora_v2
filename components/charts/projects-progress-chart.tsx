"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { ObrasData } from "@/services/dashboard-service"

interface ProjectsProgressChartProps {
  data: ObrasData
  height?: number
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'em andamento':
      return 'hsl(var(--chart-3))'
    case 'concluída':
      return 'hsl(var(--chart-1))'
    case 'pausada':
      return 'hsl(var(--chart-4))'
    case 'cancelada':
      return 'hsl(var(--chart-2))'
    default:
      return 'hsl(var(--chart-5))'
  }
}

export function ProjectsProgressChart({ data, height = 300 }: ProjectsProgressChartProps) {
  const chartData = data.progresso.progressoPorObra
    .filter(obra => obra.status === 'Em Andamento')
    .slice(0, 8) // Mostrar apenas as 8 primeiras para melhor visualização
    .map(obra => ({
      nome: obra.nomeObra.length > 15 ? obra.nomeObra.substring(0, 15) + '...' : obra.nomeObra,
      nomeCompleto: obra.nomeObra,
      progresso: obra.percentualConcluido,
      etapasConcluidas: obra.etapasConcluidas,
      etapasTotal: obra.etapasTotal,
      status: obra.status,
      obraId: obra.obraId
    }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.nomeCompleto}</p>
          <p className="text-sm">
            <span className="text-blue-600">Progresso: {data.progresso}%</span>
          </p>
          <p className="text-sm">
            Etapas: {data.etapasConcluidas}/{data.etapasTotal}
          </p>
          <p className="text-sm">Status: {data.status}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso das Obras</CardTitle>
        <CardDescription>
          {data.progresso.obrasEmAndamento} obras em andamento | 
          Progresso médio: {data.progresso.progressoMedio.toFixed(1)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="nome" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="progresso" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Lista detalhada das obras */}
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium">Obras em Andamento</h4>
          {data.progresso.progressoPorObra
            .filter(obra => obra.status === 'Em Andamento')
            .slice(0, 6)
            .map((obra) => (
              <div key={obra.obraId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{obra.nomeObra}</span>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {obra.etapasConcluidas}/{obra.etapasTotal} etapas
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {obra.status}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{obra.percentualConcluido}%</span>
                </div>
                <Progress value={obra.percentualConcluido} className="h-2" />
              </div>
            ))
          }
        </div>
      </CardContent>
    </Card>
  )
}