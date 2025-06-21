import { redirect } from "next/navigation"
import { getFuncionarios, getJWTToken } from "@/app/actions/funcionario"
import ApontamentoFuncionariosClientPage from "./apontamento-client-page"

// Server Component - handles data fetching and authentication
export default async function ApontamentosPage() {
  // 1. Verificar autenticação no Server Component antes de qualquer outra coisa
  const jwtToken = await getJWTToken()
  if (!jwtToken) {
    redirect("/auth/login") // Redireciona para a página de login se não houver token
  }

  // Fetch data on the server side
  const funcionariosApontamentosResult = await getFuncionarios()


  // Handle error if fetching fails
  if ("error" in funcionariosApontamentosResult) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Funcionários</h2>
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500 text-lg">{funcionariosApontamentosResult.error}</p>
        </div>
      </div>
    )
  }

  const initialFuncionarios = funcionariosApontamentosResult

  return <ApontamentoFuncionariosClientPage initialFuncionarios={initialFuncionarios} />
}
