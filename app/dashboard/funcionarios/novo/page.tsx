'use client'

import { useActionState, useState, useEffect } from 'react'
import { criarFuncionarioAction } from '@/app/actions/funcionarios'
import { getObrasList, type ObraListItem } from '@/app/actions/obra'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { NumericFormat } from 'react-number-format'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function NovoFuncionarioPage() {
  const { toast } = useToast() // Inicializar useToast
  const { push } = useRouter()

  const [basicFormState, basicFormAction, isBasicFormPending] = useActionState(
    criarFuncionarioAction,
    null
  )

  useEffect(() => {
    if (basicFormState?.success && basicFormState.data?.id) {
      toast({
        title: 'Sucesso!',
        description: basicFormState.message,
        variant: 'default'
      })
      // Redirect to funcionarios list after successful creation
      push('/dashboard/funcionarios')
    } else if (basicFormState?.success === false) {
      toast({
        title: 'Erro',
        description: basicFormState.message,
        variant: 'destructive'
      })
    }
  }, [basicFormState, toast, push])

  const [departamento, setDepartamento] = useState('')

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/funcionarios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Novo Funcionário
        </h2>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Dados Básicos do Funcionário</CardTitle>
          <CardDescription>
            Preencha as informações pessoais e de cargo do novo funcionário.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form action={basicFormAction} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Nome do funcionário"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  placeholder="000.000.000-00"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  name="cargo"
                  placeholder="Cargo do funcionário"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       
              <div>
                <Label htmlFor="dataContratacao">Data de Contratação</Label>
                <Input
                  id="dataContratacao"
                  name="dataContratacao"
                  type="date"
                  required
                />
              </div>
              <div>
              <Label htmlFor="departamento">Departamento</Label>
              <Select onValueChange={setDepartamento} value={departamento}>
                <SelectTrigger id="departamento">
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="projetos">Projetos</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="construcao">Construção</SelectItem>
                  <SelectItem value="administracao">Administração</SelectItem>
                  <SelectItem value="seguranca">Segurança</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="departamento" value={departamento} />
            </div>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chavePix">Chave Pix</Label>
                <Input
                  id="chavePix"
                  name="chavePix"
                  placeholder="CPF, email, telefone ou chave aleatória"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                placeholder="Informações adicionais sobre o funcionário"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/dashboard/funcionarios">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                disabled={isBasicFormPending}
                className="w-full sm:w-auto"
              >
                {isBasicFormPending ? 'Criando Funcionário...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
