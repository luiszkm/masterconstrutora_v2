import { redirect } from "next/navigation"
import { getJWTToken } from "@/app/actions/common"
import { ObrasPageClient } from "./obra-page-client"
import { getObrasList } from "@/app/actions/obra"
import { getFuncionarios } from "@/app/actions/funcionario"

// Server Component - handles data fetching and authentication
export default async function ObrasPage() {
  // 1. Verificar autenticação no Server Component antes de qualquer outra coisa
  const jwtToken = await getJWTToken()
  if (!jwtToken) {
    redirect("/auth/login") // Redireciona para a página de login se não houver token
  }

  // Fetch data on the server side
  const obrasListResult = await getObrasList()

  const funcionariosListResult = await getFuncionarios()

  // Handle error if fetching fails
  if ("error" in obrasListResult) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Obras</h2>
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500 text-lg">{obrasListResult.error}</p>
        </div>
      </div>
    )
  }


  // Handle backwards compatibility - if API returns old format, convert to new format
  let formattedData = obrasListResult.data
  if (!formattedData || (!formattedData.dados && !formattedData.paginacao)) {
    // If data doesn't have the expected structure, create it
    const obrasList = Array.isArray(formattedData) ? formattedData : (formattedData ? [formattedData] : [])
    formattedData = {
      dados: obrasList,
      paginacao: {
        totalItens: obrasList.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: obrasList.length || 20
      }
    }
  }

  return <ObrasPageClient 
    funcionariosDisponiveis={Array.isArray(funcionariosListResult) ? funcionariosListResult : ("error" in funcionariosListResult ? [] : funcionariosListResult)}
    initialData={formattedData} />
}
