import { redirect } from "next/navigation"
import {  getApontamentos } from "@/app/actions/funcionario"
import  ApontamentosFuncionariosClient  from "./apontamentos-funcionarios-client"

export default async function ApontamentosFuncionarioPage({ params }: { params: { id: string } }) {
  const { id } = params



  // Buscar apontamentos do funcionário
  const apontamentosResult = await getApontamentos()
  if ("error" in apontamentosResult) {
    if (apontamentosResult.error.includes("Não autorizado")) {
      redirect("/login")
    }
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Erro</h2>
          <p className="text-muted-foreground">{apontamentosResult.error}</p>
        </div>
      </div>
    )
  }

  console.log("apontamentosResult", apontamentosResult)

  return <ApontamentosFuncionariosClient apontamentos={apontamentosResult} />
}
