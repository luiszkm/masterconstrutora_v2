"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FinanceiroData } from "@/services/dashboard-service"

interface RevenueChartProps {
  data: FinanceiroData
  height?: number
}

export function RevenueChart({ data, height = 300 }: RevenueChartProps) {
  const fluxoPorPeriodo = data?.fluxoCaixa?.fluxoPorPeriodo || []
  const chartData = fluxoPorPeriodo.map(item => ({
    periodo: item.periodo,
    entradas: item.entradas,
    saidas: item.saidas,
    saldoLiquido: item.saldoLiquido
  }))

  const formatCurrency = (value: number, name: string, props: any) => {
    return [`R$ ${value.toLocaleString('pt-BR')}`, name]
  }

  const formatLabel = (label: string) => {
    return `Período: ${label}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
        <CardDescription>
          Saldo atual: R$ {data.fluxoCaixa.saldoAtual.toLocaleString("pt-BR")} | 
          Tendência: {data.fluxoCaixa.tendenciaMensal}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="periodo" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip 
              formatter={formatCurrency}
              labelFormatter={formatLabel}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="entradas" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              name="Entradas"
              dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="saidas" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              name="Saídas"
              dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="saldoLiquido" 
              stroke="hsl(var(--chart-3))" 
              strokeWidth={2}
              name="Saldo Líquido"
              dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              R$ {data.fluxoCaixa.totalEntradas.toLocaleString("pt-BR")}
            </div>
            <div className="text-sm text-muted-foreground">Entradas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              R$ {data.fluxoCaixa.totalSaidas.toLocaleString("pt-BR")}
            </div>
            <div className="text-sm text-muted-foreground">Saídas</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              R$ {data.fluxoCaixa.saldoAtual.toLocaleString("pt-BR")}
            </div>
            <div className="text-sm text-muted-foreground">Saldo</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}