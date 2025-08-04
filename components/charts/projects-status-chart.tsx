"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ObrasData } from "@/services/dashboard-service"

interface ProjectsStatusChartProps {
  data: ObrasData
  height?: number
}

const STATUS_COLORS = {
  'Em Andamento': 'hsl(var(--chart-3))',
  'Concluída': 'hsl(var(--chart-1))',
  'Pausada': 'hsl(var(--chart-4))',
  'Cancelada': 'hsl(var(--chart-2))',
  'Planejamento': 'hsl(var(--chart-5))',
  'Aprovação': '#8884d8',
  'default': '#82ca9d'
}

export function ProjectsStatusChart({ data, height = 300 }: ProjectsStatusChartProps) {
  const chartData = data.distribuicao.distribuicaoPorStatus.map(item => ({
    name: item.status,
    value: item.quantidade,
    percentual: item.percentual,
    valorTotal: item.valorTotal,
    color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default
  }))

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Não mostrar labels para fatias muito pequenas
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            <span className="text-blue-600">Quantidade: {data.value} obras</span>
          </p>
          <p className="text-sm">Percentual: {data.percentual.toFixed(1)}%</p>
          <p className="text-sm">
            Valor total: R$ {data.valorTotal.toLocaleString('pt-BR')}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Status</CardTitle>
        <CardDescription>
          Total de {data.distribuicao.totalObras} obras | 
          Status mais comum: {data.distribuicao.statusMaisComum}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2">
          {data.distribuicao.distribuicaoPorStatus.map((status) => (
            <div key={status.status} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ 
                    backgroundColor: STATUS_COLORS[status.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default 
                  }}
                />
                <span className="text-sm">{status.status}</span>
              </div>
              <span className="text-sm">
                {status.quantidade} ({status.percentual.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}