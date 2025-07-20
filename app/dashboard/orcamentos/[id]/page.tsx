import { redirect } from "next/navigation"
import { getJWTToken } from "@/app/actions/common"
import { getOrcamentoById } from "@/app/actions/orcamento"
import { OrcamentoDetalhesClient } from "./orcamento-detalhes-client"

export default async function OrcamentoDetalhesPage({ params }: { params: { id: string } }) {
  // Verificar autenticação no Server Component
  const jwtToken = await getJWTToken()
  if (!jwtToken) {
    redirect("/auth/login")
  }

  // Fetch data on the server side
  const orcamentoResult = await getOrcamentoById(params.id)

  console.log("Orçamento Detalhado:", orcamentoResult)

  // Handle error if fetching fails
  if ("error" in orcamentoResult) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Erro ao buscar Orçamento</h2>
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500 text-lg">{orcamentoResult.error}</p>
        </div>
      </div>
    )
  }

  return <OrcamentoDetalhesClient orcamento={orcamentoResult} />
}
