import { getFornecedores } from "@/app/actions/fornecedor"
import { getJWTToken } from "@/app/actions/common"
import { redirect } from "next/navigation"
import { FornecedoresPageClient } from "@/app/dashboard/fornecedores/components/fornecedores-page-client"

export default async function FornecedoresPage() {
  // Verificar autenticação no Server Component
  const jwtToken = await getJWTToken()
  if (!jwtToken) {
    redirect("/auth/login")
  }

  // Fetch data on the server side
  const fornecedoresResult = await getFornecedores()

  // Handle error if fetching fails
  if ("error" in fornecedoresResult) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Erro ao buscar Fornecedores</h2>
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500 text-lg">{fornecedoresResult.error}</p>
        </div>
      </div>
    )
  }

  return <FornecedoresPageClient initialFornecedores={fornecedoresResult} />
}
