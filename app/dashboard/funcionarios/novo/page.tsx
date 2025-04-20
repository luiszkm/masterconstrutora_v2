import Link from "next/link"

import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Modificar o componente para adicionar os novos campos
export default function NovoFuncionarioPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/funcionarios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Novo Funcionário</h2>
      </div>
      <div className="grid gap-6">
        <form className="space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" placeholder="Nome do funcionário" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" placeholder="000.000.000-00" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" placeholder="Cargo do funcionário" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Select>
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
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dataContratacao">Data de Contratação</Label>
                <Input id="dataContratacao" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chavePix">Chave PIX</Label>
                <Input id="chavePix" placeholder="CPF, email, telefone ou chave aleatória" />
              </div>
            </div>

            {/* Seção de Pagamentos */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Informações de Pagamento</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="diaria">Valor da Diária (R$)</Label>
                  <Input id="diaria" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diasTrabalhados">Dias Trabalhados</Label>
                  <Input id="diasTrabalhados" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorAdicional">Valor Adicional (R$)</Label>
                  <Input id="valorAdicional" type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="descontos">Descontos (R$)</Label>
                  <Input id="descontos" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adiantamento">Adiantamento (R$)</Label>
                  <Input id="adiantamento" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorTotal">Valor Total (R$)</Label>
                  <Input id="valorTotal" type="number" step="0.01" placeholder="0.00" disabled className="bg-muted" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" placeholder="Informações adicionais sobre o funcionário" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" asChild>
              <Link href="/dashboard/funcionarios">Cancelar</Link>
            </Button>
            <Button type="submit">Salvar Funcionário</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
