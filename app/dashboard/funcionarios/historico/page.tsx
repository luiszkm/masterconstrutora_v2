import { redirect } from "next/navigation"
import { getFuncionarios } from "@/app/actions/funcionario"
import { getJWTToken } from "@/app/lib/session"
import HistoricoFuncionariosClientPage from "./historico-funcionario-page-client"

// Server Component - handles data fetching and authentication
export default async function FuncionariosPage({
  searchParams,
}: {
  searchParams: { page?: string; pageSize?: string }
}) {
  // 1. Verificar autenticação no Server Component antes de qualquer outra coisa
  const jwtToken = await getJWTToken()
  if (!jwtToken) {
    redirect("/auth/login") // Redireciona para a página de login se não houver token
  }

  // Parse pagination parameters
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams.pageSize) || 20

  // Fetch data on the server side (basic funcionarios data)
  const funcionariosResult = await getFuncionarios()

  // Handle error if fetching fails
  if ("error" in funcionariosResult) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Funcionários - Histórico</h2>
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500 text-lg">{funcionariosResult.error}</p>
        </div>
      </div>
    )
  }

  // Simulate pagination structure for now
  const paginatedData = {
    dados: funcionariosResult,
    paginacao: {
      totalItens: funcionariosResult.length,
      totalPages: Math.ceil(funcionariosResult.length / pageSize),
      currentPage: page,
      pageSize: pageSize
    }
  }

  return <HistoricoFuncionariosClientPage initialData={paginatedData} />
}
