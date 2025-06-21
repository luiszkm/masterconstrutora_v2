"use client"

import { useState, useActionState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createFornecedor, type MaterialTipo } from "@/app/actions/fornecedor"

// Lista de todos os tipos de materiais disponíveis no sistema
const tiposMateriais = [
  "Cimento",
  "Areia",
  "Brita",
  "Aço",
  "Tintas",
  "Mármores",
  "Granitos",
  "Porcelanatos",
  "Cabos",
  "Disjuntores",
  "Quadros Elétricos",
  "Tubos PVC",
  "Conexões",
  "Registros",
  "Caixas d'água",
  "Madeira Maciça",
  "Compensados",
  "MDF",
  "Portas",
  "Deck",
  "Telhas",
  "Vidros",
  "Ferragens",
  "Impermeabilizantes",
  "Argamassas",
  "Gesso",
  "Drywall",
  "Isolantes",
  "Pisos Laminados",
  "Pisos Vinílicos",
]

export default function NovoFornecedorPage() {
  const router = useRouter()

  // Server Action
  const [state, formAction, isPending] = useActionState(createFornecedor, null)

  // Estados para materiais
  const [materiais, setMateriais] = useState<MaterialTipo[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [novoMaterial, setNovoMaterial] = useState("")
  const [materialPesquisa, setMaterialPesquisa] = useState("")
  const [materialDuplicado, setMaterialDuplicado] = useState(false)

  // Função para adicionar material
  const adicionarMaterial = () => {
    if (!novoMaterial) return

    // Verificar se o material já existe
    const materialExistente = materiais.some((m) => m.nome.toLowerCase() === novoMaterial.toLowerCase())

    if (materialExistente) {
      setMaterialDuplicado(true)
      return
    }

    // Criar novo material
    const novoMaterialObj: MaterialTipo = {
      id: Math.max(...materiais.map((m) => m.id), 0) + 1,
      nome: novoMaterial,
    }

    setMateriais([...materiais, novoMaterialObj])
    setDialogOpen(false)
    setNovoMaterial("")
    setMaterialDuplicado(false)

    toast({
      title: "Material adicionado",
      description: `${novoMaterial} foi adicionado à lista.`,
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  // Função para remover material
  const removerMaterial = (id: number) => {
    setMateriais(materiais.filter((m) => m.id !== id))
    toast({
      title: "Material removido",
      description: "O material foi removido da lista.",
      action: <ToastAction altText="Fechar">Fechar</ToastAction>,
    })
  }

  // Função para submeter o formulário
  const handleSubmit = async (formData: FormData) => {
    // Adicionar materiais como JSON ao FormData
    formData.append("materiais", JSON.stringify(materiais))

    const result = await formAction(formData)

    if (result?.success) {
      toast({
        title: "Fornecedor criado",
        description: result.message,
        action: <ToastAction altText="Fechar">Fechar</ToastAction>,
      })
      router.push("/dashboard/fornecedores")
    }
  }

  // Filtrar materiais disponíveis
  const materiaisDisponiveis = tiposMateriais.filter(
    (material) => !materiais.some((m) => m.nome.toLowerCase() === material.toLowerCase()),
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/fornecedores">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Novo Fornecedor</h2>
            <p className="text-muted-foreground">Cadastre um novo fornecedor no sistema</p>
          </div>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa *</Label>
                <Input id="nome" name="nome" placeholder="Nome do fornecedor" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input id="cnpj" name="cnpj" placeholder="00.000.000/0000-00" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select name="categoria" required>
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Materiais de Construção">Materiais de Construção</SelectItem>
                    <SelectItem value="Acabamentos">Acabamentos</SelectItem>
                    <SelectItem value="Instalações Elétricas">Instalações Elétricas</SelectItem>
                    <SelectItem value="Instalações Hidráulicas">Instalações Hidráulicas</SelectItem>
                    <SelectItem value="Madeiras">Madeiras</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" placeholder="www.exemplo.com.br" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Input id="endereco" name="endereco" placeholder="Rua, número, bairro" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" name="cidade" placeholder="São Paulo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select name="estado">
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                    <SelectItem value="SC">Santa Catarina</SelectItem>
                    {/* Adicione outros estados conforme necessário */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" name="cep" placeholder="00000-000" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              Informações de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contato">Nome do Contato *</Label>
                <Input id="contato" name="contato" placeholder="Nome da pessoa de contato" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" name="cargo" placeholder="Cargo do contato" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" placeholder="email@exemplo.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materiais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-2 md:flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                Materiais Fornecidos
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Material
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {materiais.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-2">Nenhum material adicionado</div>
                <div className="text-sm">Clique em "Adicionar Material" para começar</div>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Material</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materiais.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">{material.nome}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removerMaterial(material.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remover</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações Adicionais</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                placeholder="Informações adicionais sobre o fornecedor, histórico, condições especiais, etc."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/fornecedores">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Fornecedor"
            )}
          </Button>
        </div>

        {/* Mensagem de erro/sucesso */}
        {state?.message && (
          <Alert variant={state.success ? "default" : "destructive"}>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
      </form>

      {/* Diálogo para adicionar material */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {materialDuplicado && (
              <Alert variant="destructive">
                <AlertDescription>Este material já foi adicionado à lista.</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {novoMaterial || "Selecione um material"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Buscar material..."
                      value={materialPesquisa}
                      onValueChange={setMaterialPesquisa}
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>Nenhum material encontrado.</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-auto">
                        {materiaisDisponiveis
                          .filter((material) => material.toLowerCase().includes(materialPesquisa.toLowerCase()))
                          .map((material) => (
                            <CommandItem
                              key={material}
                              value={material}
                              onSelect={() => {
                                setNovoMaterial(material)
                                setMaterialPesquisa("")
                                setMaterialDuplicado(false)
                              }}
                            >
                              {material}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                setNovoMaterial("")
                setMaterialDuplicado(false)
                setMaterialPesquisa("")
              }}
            >
              Cancelar
            </Button>
            <Button onClick={adicionarMaterial} disabled={!novoMaterial || materiaisDisponiveis.length === 0}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
