import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

export default function NovoFornecedorPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/fornecedores">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Novo Fornecedor</h2>
      </div>
      <div className="grid gap-6">
        <form className="space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa</Label>
                <Input id="nome" placeholder="Nome do fornecedor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" placeholder="00.000.000/0000-00" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select>
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="materiais">Materiais de Construção</SelectItem>
                    <SelectItem value="acabamentos">Acabamentos</SelectItem>
                    <SelectItem value="eletrica">Instalações Elétricas</SelectItem>
                    <SelectItem value="hidraulica">Instalações Hidráulicas</SelectItem>
                    <SelectItem value="madeiras">Madeiras</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="www.exemplo.com.br" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" placeholder="Endereço completo" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" placeholder="Cidade" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select>
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">SP</SelectItem>
                    <SelectItem value="RJ">RJ</SelectItem>
                    <SelectItem value="MG">MG</SelectItem>
                    <SelectItem value="ES">ES</SelectItem>
                    <SelectItem value="PR">PR</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="RS">RS</SelectItem>
                    <SelectItem value="MS">MS</SelectItem>
                    <SelectItem value="MT">MT</SelectItem>
                    <SelectItem value="GO">GO</SelectItem>
                    <SelectItem value="DF">DF</SelectItem>
                    <SelectItem value="BA">BA</SelectItem>
                    <SelectItem value="SE">SE</SelectItem>
                    <SelectItem value="AL">AL</SelectItem>
                    <SelectItem value="PE">PE</SelectItem>
                    <SelectItem value="PB">PB</SelectItem>
                    <SelectItem value="RN">RN</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="PI">PI</SelectItem>
                    <SelectItem value="MA">MA</SelectItem>
                    <SelectItem value="PA">PA</SelectItem>
                    <SelectItem value="AP">AP</SelectItem>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="RR">RR</SelectItem>
                    <SelectItem value="RO">RO</SelectItem>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="TO">TO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" placeholder="00000-000" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contato">Nome do Contato</Label>
                <Input id="contato" placeholder="Nome da pessoa de contato" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" placeholder="Cargo do contato" />
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
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" placeholder="Informações adicionais sobre o fornecedor" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" asChild>
              <Link href="/dashboard/fornecedores">Cancelar</Link>
            </Button>
            <Button type="submit">Salvar Fornecedor</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
