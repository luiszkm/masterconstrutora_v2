"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FinanceiroData } from "@/services/dashboard-service"

interface ExpensesChartProps {
  data: FinanceiroData
  height?: number
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

export function ExpensesChart({ data, height = 300 }: ExpensesChartProps) {
  // Verificação de segurança para dados nulos ou undefined
  const distribuicao = data?.distribuicaoDespesas?.distribuicao || []
  
  const chartData = distribuicao.map((item, index) => ({
    name: item.categoria,
    value: item.valor,
    percentual: item.percentual,
    quantidadeItens: item.quantidadeItens,
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            <span className="text-green-600">Valor: R$ {data.value.toLocaleString('pt-BR')}</span>
          </p>
          <p className="text-sm">Percentual: {data.percentual.toFixed(1)}%</p>
          <p className="text-sm">Itens: {data.quantidadeItens}</p>
        </div>
      )
    }
    return null
  }

  // Verificar se há dados para exibir
  const hasData = distribuicao.length > 0
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Despesas</CardTitle>
        <CardDescription>
          Total: R$ {(data?.distribuicaoDespesas?.totalGasto || 0).toLocaleString("pt-BR")} | 
          Maior categoria: {data?.distribuicaoDespesas?.maiorCategoria || 'N/A'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <>
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
              {distribuicao.slice(0, 5).map((item, index) => (
            <div key={item.categoria} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">{item.categoria}</span>
              </div>
              <span className="text-sm">
                R$ {item.valor.toLocaleString("pt-BR")} ({item.percentual.toFixed(1)}%)
              </span>
            </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <p>Nenhum dado de despesas disponível</p>
              <p className="text-sm mt-1">Os dados serão exibidos quando houver despesas registradas</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}