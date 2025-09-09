"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { FuncionariosData } from "@/services/dashboard-service"

interface EmployeesProductivityChartProps {
  data: FuncionariosData
  height?: number
  chartType?: 'bar' | 'line'
}

export function EmployeesProductivityChart({ 
  data, 
  height = 300, 
  chartType = 'bar' 
}: EmployeesProductivityChartProps) {
  const top5Produtivos = data?.produtividade?.top5Produtivos || []
  const chartData = top5Produtivos.map(funcionario => ({
    nome: funcionario.nomeFuncionario.split(' ')[0], // Apenas primeiro nome para o gráfico
    nomeCompleto: funcionario.nomeFuncionario,
    cargo: funcionario.cargo,
    produtividade: funcionario.indiceProdutividade,
    diasTrabalhados: funcionario.diasTrabalhados,
    obrasAlocadas: funcionario.obrasAlocadas,
    mediaDias: funcionario.mediaDiasPorPeriodo
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.nomeCompleto}</p>
          <p className="text-sm">Cargo: {data.cargo}</p>
          <p className="text-sm">
            <span className="text-blue-600">Produtividade: {data.produtividade.toFixed(1)}%</span>
          </p>
          <p className="text-sm">Dias trabalhados: {data.diasTrabalhados}</p>
          <p className="text-sm">Obras alocadas: {data.obrasAlocadas}</p>
          <p className="text-sm">Média dias/período: {data.mediaDias.toFixed(1)}</p>
        </div>
      )
    }
    return null
  }

  const Chart = chartType === 'line' ? (
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="nome" 
        fontSize={12}
        tickLine={false}
        axisLine={false}
      />
      <YAxis 
        fontSize={12}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => `${value}%`}
      />
      <Tooltip content={<CustomTooltip />} />
      <Line 
        type="monotone" 
        dataKey="produtividade" 
        stroke="hsl(var(--chart-1))" 
        strokeWidth={3}
        dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 6 }}
      />
    </LineChart>
  ) : (
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="nome" 
        fontSize={12}
        tickLine={false}
        axisLine={false}
      />
      <YAxis 
        fontSize={12}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => `${value}%`}
      />
      <Tooltip content={<CustomTooltip />} />
      <Bar 
        dataKey="produtividade" 
        fill="hsl(var(--chart-1))" 
        radius={[4, 4, 0, 0]}
      />
    </BarChart>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtividade dos Funcionários</CardTitle>
        <CardDescription>
          Média geral: {data.produtividade.mediaGeralProdutividade.toFixed(1)}% | 
          {data.produtividade.funcionariosAtivos} funcionários ativos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {Chart}
        </ResponsiveContainer>

        {/* Estatísticas adicionais */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{data.produtividade.totalFuncionarios}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.produtividade.funcionariosAtivos}</div>
            <div className="text-sm text-muted-foreground">Ativos</div>
          </div>
        </div>

        {/* Lista detalhada dos top 5 */}
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium">Top 5 Mais Produtivos</h4>
          {top5Produtivos.map((funcionario, index) => (
            <div key={funcionario.funcionarioId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{funcionario.nomeFuncionario}</span>
                    <div className="text-xs text-muted-foreground">
                      {funcionario.cargo} • {funcionario.obrasAlocadas} obras
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium">{funcionario.indiceProdutividade.toFixed(1)}%</span>
              </div>
              <Progress value={funcionario.indiceProdutividade} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}