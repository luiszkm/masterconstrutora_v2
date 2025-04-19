import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

export default function NovoMaterialPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/materiais">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Novo Material</h2>
      </div>
      <div className="grid gap-6">
        <form className="space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input id="codigo" placeholder="Código do material" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" placeholder="Nome do material" />
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
                    <SelectItem value="cimento">Cimento</SelectItem>
                    <SelectItem value="alvenaria">Alvenaria</SelectItem>
                    <SelectItem value="agregados">Agregados</SelectItem>
                    <SelectItem value="aco">Aço</SelectItem>
                    <SelectItem value="acabamentos">Acabamentos</SelectItem>
                    <SelectItem value="pintura">Pintura</SelectItem>
                    <SelectItem value="eletrica">Elétrica</SelectItem>
                    <SelectItem value="hidraulica">Hidráulica</SelectItem>
                    <SelectItem value="madeiras">Madeiras</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade de Medida</Label>
                <Select>
                  <SelectTrigger id="unidade">
                    <SelectValue placeholder="Selecione uma unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="m">Metro (m)</SelectItem>
                    <SelectItem value="m2">Metro Quadrado (m²)</SelectItem>
                    <SelectItem value="m3">Metro Cúbico (m³)</SelectItem>
                    <SelectItem value="l">Litro (L)</SelectItem>
                    <SelectItem value="ml">Mililitro (mL)</SelectItem>
                    <SelectItem value="pct">Pacote (pct)</SelectItem>
                    <SelectItem value="cx">Caixa (cx)</SelectItem>
                    <SelectItem value="barra">Barra</SelectItem>
                    <SelectItem value="rolo">Rolo</SelectItem>
                    <SelectItem value="saco">Saco</SelectItem>
                    <SelectItem value="milheiro">Milheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço Unitário (R$)</Label>
                <Input id="preco" type="number" min="0" step="0.01" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoque">Quantidade em Estoque</Label>
                <Input id="estoque" type="number" min="0" placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Select>
                <SelectTrigger id="fornecedor">
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Materiais Premium Ltda</SelectItem>
                  <SelectItem value="2">Mármores & Granitos SA</SelectItem>
                  <SelectItem value="3">Elétrica Total</SelectItem>
                  <SelectItem value="4">Hidráulica Express</SelectItem>
                  <SelectItem value="5">Madeiras Nobres</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estoque-minimo">Estoque Mínimo</Label>
              <Input id="estoque-minimo" type="number" min="0" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização no Depósito</Label>
              <Input id="localizacao" placeholder="Ex: Prateleira A, Seção 3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" placeholder="Descrição detalhada do material" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" asChild>
              <Link href="/dashboard/materiais">Cancelar</Link>
            </Button>
            <Button type="submit">Salvar Material</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
