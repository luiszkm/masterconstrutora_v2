"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DashboardErrorProps {
  error: string
  onRetry?: () => void
}

export function DashboardError({ error, onRetry }: DashboardErrorProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Erro ao carregar dashboard
          </CardTitle>
          <CardDescription>Ocorreu um problema ao buscar os dados do dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Detalhes do erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            )}
            <Button variant="outline" onClick={() => window.location.reload()}>
              Recarregar página
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Possíveis causas:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Problema de conexão com o servidor</li>
              <li>Token de autenticação expirado</li>
              <li>Permissões insuficientes</li>
              <li>Servidor temporariamente indisponível</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
