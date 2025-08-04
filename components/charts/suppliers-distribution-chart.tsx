"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import type { FornecedoresData } from "@/services/dashboard-service"

interface SuppliersDistributionChartProps {
  data: FornecedoresData
  height?: number
  chartType?: 'pie' | 'bar'
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#8dd1e1'
]

export function SuppliersDistributionChart({ 
  data, 
  height = 300,
  chartType = 'pie' 
}: SuppliersDistributionChartProps) {
  const chartData = data.fornecedoresPorCategoria.distribuicaoPorCategoria.map((item, index) => ({
    name: item.categoriaNome,
    value: item.quantidadeFornecedores,
    percentual: item.percentual,
    avaliacaoMedia: item.avaliacaoMedia,
    color: COLORS[index % COLORS.length]
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            <span className="text-blue-600">Fornecedores: {data.value}</span>
          </p>
          <p className="text-sm">Percentual: {data.percentual.toFixed(1)}%</p>
          <div className="flex items-center text-sm">
            <span className="mr-1">Avaliação:</span>
            <span className="mr-1">{data.avaliacaoMedia.toFixed(1)}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(data.avaliacaoMedia) ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                />
              ))}
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const PieChartComponent = (
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
  )

  const BarChartComponent = (
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="name" 
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
      />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Bar>
    </BarChart>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Categoria</CardTitle>
        <CardDescription>
          {data.fornecedoresPorCategoria.totalFornecedores} fornecedores | 
          Mais popular: {data.fornecedoresPorCategoria.categoriaMaisPopular}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {chartType === 'pie' ? PieChartComponent : BarChartComponent}
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2">
          {data.fornecedoresPorCategoria.distribuicaoPorCategoria.map((categoria, index) => (
            <div key={categoria.categoriaId} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">{categoria.categoriaNome}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {categoria.quantidadeFornecedores} ({categoria.percentual.toFixed(1)}%)
                </span>
                <div className="flex items-center">
                  <span className="text-xs mr-1">{categoria.avaliacaoMedia.toFixed(1)}</span>
                  <Star
                    className="h-3 w-3 text-yellow-400 fill-yellow-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}