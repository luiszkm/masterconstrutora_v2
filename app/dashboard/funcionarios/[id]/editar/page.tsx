import { Star } from "lucide-react"
import EditarFuncionarioClient from "./editar-funcionario-client"
import { redirect } from "next/navigation"
import { getFuncionarioById,  } from "@/app/actions/funcionario"
import { getJWTToken } from "@/app/actions/apontamentos"



export default async function EditarFuncionarioPage({ params }: { params: { id: string } }) {
  // Aguardar params se necessário
  const { id } =  params

  // Verificar autenticação
  const token = await getJWTToken()
  if (!token) {
    redirect("/auth/login")
  }

  // Buscar dados do funcionário
  const funcionarioResult = await getFuncionarioById(id)

  if ("error" in funcionarioResult) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Erro: {funcionarioResult.error}</h2>
        </div>
      </div>
    )
  }

  // Passar os dados para o Client Component
  return <EditarFuncionarioClient funcionario={funcionarioResult} funcionarioId={id} />
}
