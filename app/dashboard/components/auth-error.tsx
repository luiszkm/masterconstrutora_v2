"use client"

import { useRouter } from "next/navigation"
import { AlertTriangle, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AuthErrorProps {
  error: string
  onRetry?: () => void
}

export function AuthError({ error, onRetry }: AuthErrorProps) {
  const router = useRouter()

  const handleLogin = () => {
    // Redirecionar para a página de login
    router.push("/login")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Erro de Autenticação
          </CardTitle>
          <CardDescription>Você precisa estar logado para acessar o dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Acesso negado</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleLogin} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Fazer Login
            </Button>
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                Tentar Novamente
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Possíveis causas:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Sessão expirada</li>
              <li>Token de autenticação inválido</li>
              <li>Você não está logado no sistema</li>
              <li>Permissões insuficientes para acessar o dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
