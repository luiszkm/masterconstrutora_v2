import { redirect } from "next/navigation"
import { getOrcamentos } from "@/app/actions/orcamento"
import { getJWTToken } from "@/app/actions/common"
import { OrcamentosPageClient } from "./orcamento-client-page"

export default async function OrcamentosPage() {
  // Verificar autenticação no Server Component
  const jwtToken = await getJWTToken()
  if (!jwtToken) {
    redirect("/auth/login")
  }

  // Fetch data on the server side
  const orcamentosResult = await getOrcamentos()

  // Handle error if fetching fails
  if ("error" in orcamentosResult) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Erro ao buscar Orçamentos</h2>
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500 text-lg">{orcamentosResult.error}</p>
        </div>
      </div>
    )
  }

  return <OrcamentosPageClient initialOrcamentos={orcamentosResult} />
}
