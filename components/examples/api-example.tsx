"use client"

import { useState } from "react"
import { api } from "@/services"
import { useRevalidate } from "@/hooks/use-revalidate"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export function ApiExample() {
  const [loading, setLoading] = useState(false)
  const { revalidateEntity } = useRevalidate()

  const handleFetchFuncionarios = async () => {
    setLoading(true)
    try {
      const result = await api.funcionarios.listarFuncionarios({
        page: 1,
        limit: 10,
        sort: "nome",
        order: "asc",
      })

      toast({
        title: "Funcionários carregados",
        description: `Total de ${result.total} funcionários encontrados`,
      })

    } catch (error: any) {
      toast({
        title: "Erro ao carregar funcionários",
        description: error.message || "Ocorreu um erro ao carregar os funcionários",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRevalidateCache = async () => {
    const success = await revalidateEntity("funcionarios")

    if (success) {
      toast({
        title: "Cache revalidado",
        description: "O cache de funcionários foi revalidado com sucesso",
      })
    } else {
      toast({
        title: "Erro ao revalidar cache",
        description: "Ocorreu um erro ao revalidar o cache",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemplo de uso da API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={handleFetchFuncionarios} disabled={loading}>
            {loading ? "Carregando..." : "Carregar Funcionários"}
          </Button>

          <Button variant="outline" onClick={handleRevalidateCache}>
            Revalidar Cache
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">Verifique o console para ver os resultados das chamadas de API.</p>
      </CardContent>
    </Card>
  )
}
