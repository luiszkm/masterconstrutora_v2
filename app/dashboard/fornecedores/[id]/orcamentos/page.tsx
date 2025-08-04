import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Eye, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getFornecedorById } from "@/app/actions/fornecedor"
import { getOrcamentosByFornecedor } from "@/app/actions/orcamento"
import { notFound } from "next/navigation"
import { OrcamentosFornecedorClient } from "./orcamentos-fornecedor-client"


export default async function OrcamentosFornecedorPage({ params }: { params: { id: string } }) {
  // Buscar dados do fornecedor
  const fornecedor = await getFornecedorById(params.id)

  console.log('Fornecedor:',  fornecedor )
  
  if (!fornecedor) {
    notFound()
  }
  // Buscar orçamentos do fornecedor
  const orcamentosResult = await getOrcamentosByFornecedor(params.id)

  console.log('Orçamentos:', orcamentosResult)
  
  if ('error' in orcamentosResult) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/fornecedores">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Orçamentos - {fornecedor.nome}</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">{orcamentosResult.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/fornecedores">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Orçamentos - {fornecedor.nome}</h2>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Lista de orçamentos relacionados a este fornecedor</p>
        <Button asChild>
          <Link href="/dashboard/orcamentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Link>
        </Button>
      </div>

      <OrcamentosFornecedorClient 
        fornecedor={fornecedor}
        initialData={orcamentosResult}
      />
    </div>
  )
}
