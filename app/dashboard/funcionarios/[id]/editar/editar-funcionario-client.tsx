"use client"

import { useState, useActionState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Star } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updateFuncionario, type FuncionarioBase } from "@/app/actions/funcionario"
import { formatDateToInput } from "@/app/lib/masks"

// Componente para editar a avaliação com estrelas
function RatingEditor({ rating, onChange }: { rating: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className="focus:outline-none">
          <Star className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
      <span className="ml-2">{rating.toFixed(1)}</span>
    </div>
  )
}

interface EditarFuncionarioClientProps {
  funcionario: FuncionarioBase
  funcionarioId: string
}

export default function EditarFuncionarioClient({ funcionario, funcionarioId }: EditarFuncionarioClientProps) {
  const router = useRouter()

  // Usar useActionState para gerenciar a atualização
  const [formState, formAction, isPending] = useActionState(updateFuncionario.bind(null, funcionarioId), null)

  // Estados locais para os campos do formulário
  const [departamento, setDepartamento] = useState(funcionario.departamento || "")
  const [status, setStatus] = useState(funcionario.status || "Ativo")
  const [avaliacao, setAvaliacao] = useState(funcionario.avaliacaoDesempenho || 0)

  

  // Efeito para lidar com o resultado da atualização
  useEffect(() => {
    if (formState?.success) {
      toast({
        title: "Funcionário atualizado",
        description: formState.message,
        action: <ToastAction altText="Fechar">Fechar</ToastAction>,
      })
      router.push("/dashboard/funcionarios")
    } else if (formState?.success === false) {
      toast({
        title: "Erro ao atualizar funcionário",
        description: formState.message,
        variant: "destructive",
      })
    }
  }, [formState, router])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/funcionarios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Editar Funcionário</h2>
      </div>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Dados do Funcionário</CardTitle>
          <CardDescription>Edite as informações do funcionário.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form action={formAction} className="space-y-8">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    name="nome"
                    placeholder="Nome do funcionário"
                    defaultValue={funcionario.nome}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" name="cpf" placeholder="000.000.000-00" defaultValue={funcionario.cpf || ""} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    defaultValue={funcionario.email || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    placeholder="(00) 00000-0000"
                    defaultValue={funcionario.telefone || ""}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    name="cargo"
                    placeholder="Cargo do funcionário"
                    defaultValue={funcionario.cargo || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Select value={departamento} onValueChange={setDepartamento}>
                    <SelectTrigger id="departamento">
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Projetos">Projetos</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Construção">Construção</SelectItem>
                      <SelectItem value="Administração">Administração</SelectItem>
                      <SelectItem value="Segurança">Segurança</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="departamento" value={departamento} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dataContratacao">Data de Contratação</Label>
                  <Input
                    id="dataContratacao"
                    name="dataContratacao"
                    type="date"
                    defaultValue={formatDateToInput(funcionario.dataContratacao)}
                  />
                </div>

                <div>
                  <Label htmlFor="dataNascimento">Chave Pix</Label>
                  <Input
                    id="chavePix"
                    name="chavePix"
                    defaultValue={funcionario.chavePix || ""}
                  />
                </div>
                
                
              </div>
           
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Ferias">Férias</SelectItem>
                      <SelectItem value="Licenca">Licença</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="status" value={status} />
                </div>
                <div className="space-y-2">
                  <Label>Avaliação</Label>
                  <RatingEditor rating={Number(avaliacao)} onChange={setAvaliacao} />
                  <input type="hidden" name="avaliacaoDesempenho" value={Number(avaliacao)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  placeholder="Informações adicionais sobre o funcionário"
                  defaultValue={funcionario.observacoes || ""}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button variant="outline" type="button" asChild className="w-full sm:w-auto">
                <Link href="/dashboard/funcionarios">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
