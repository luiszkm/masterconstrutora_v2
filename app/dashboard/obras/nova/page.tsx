import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function NovaObraPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/obras">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Nova Obra</h2>
      </div>
      <Tabs defaultValue="informacoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="informacoes">Informações Gerais</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>
        <TabsContent value="informacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomeObra">Nome da Obra</Label>
                  <Input id="nomeObra" placeholder="Nome da obra" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoObra">Tipo de Obra</Label>
                  <Select>
                    <SelectTrigger id="tipoObra">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residencial">Residencial</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="reforma">Reforma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select>
                    <SelectTrigger id="cliente">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="roberto">Roberto Mendes</SelectItem>
                      <SelectItem value="carla">Carla Oliveira</SelectItem>
                      <SelectItem value="fernando">Fernando Almeida</SelectItem>
                      <SelectItem value="juliana">Juliana Martins</SelectItem>
                      <SelectItem value="ricardo">Ricardo Souza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável Técnico</Label>
                  <Select>
                    <SelectTrigger id="responsavel">
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joao">João Silva</SelectItem>
                      <SelectItem value="maria">Maria Oliveira</SelectItem>
                      <SelectItem value="pedro">Pedro Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço da Obra</Label>
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" placeholder="00000-000" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="areaTotal">Área Total (m²)</Label>
                  <Input id="areaTotal" type="number" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaConstruida">Área Construída (m²)</Label>
                  <Input id="areaConstruida" type="number" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numPavimentos">Número de Pavimentos</Label>
                  <Input id="numPavimentos" type="number" min="1" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input id="dataInicio" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataPrevisaoFim">Previsão de Conclusão</Label>
                  <Input id="dataPrevisaoFim" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição da Obra</Label>
                <Textarea id="descricao" placeholder="Descreva os detalhes da obra" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="equipe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipe da Obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecione os Funcionários</Label>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input type="checkbox" className="h-4 w-4" />
                        </TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Departamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: 1, nome: "João Silva", cargo: "Engenheiro Civil", departamento: "Projetos" },
                        { id: 2, nome: "Maria Oliveira", cargo: "Arquiteta", departamento: "Design" },
                        { id: 3, nome: "Pedro Santos", cargo: "Mestre de Obras", departamento: "Construção" },
                        { id: 4, nome: "Ana Costa", cargo: "Gerente de Projetos", departamento: "Administração" },
                        { id: 5, nome: "Carlos Ferreira", cargo: "Técnico em Segurança", departamento: "Segurança" },
                      ].map((funcionario) => (
                        <TableRow key={funcionario.id}>
                          <TableCell>
                            <input type="checkbox" className="h-4 w-4" />
                          </TableCell>
                          <TableCell>{funcionario.nome}</TableCell>
                          <TableCell>{funcionario.cargo}</TableCell>
                          <TableCell>{funcionario.departamento}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cronograma" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma da Obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Etapas da Obra</Label>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Etapa
                  </Button>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 1, etapa: "Fundação", inicio: "", fim: "", progresso: 0 },
                    { id: 2, etapa: "Estrutura", inicio: "", fim: "", progresso: 0 },
                    { id: 3, etapa: "Alvenaria", inicio: "", fim: "", progresso: 0 },
                    { id: 4, etapa: "Instalações", inicio: "", fim: "", progresso: 0 },
                    { id: 5, etapa: "Acabamentos", inicio: "", fim: "", progresso: 0 },
                  ].map((etapa) => (
                    <div key={etapa.id} className="grid grid-cols-1 gap-4 md:grid-cols-4 items-end border-b pb-4">
                      <div className="space-y-2">
                        <Label htmlFor={`etapa-${etapa.id}`}>Etapa</Label>
                        <Input id={`etapa-${etapa.id}`} defaultValue={etapa.etapa} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`inicio-${etapa.id}`}>Data de Início</Label>
                        <Input id={`inicio-${etapa.id}`} type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`fim-${etapa.id}`}>Data de Conclusão</Label>
                        <Input id={`fim-${etapa.id}`} type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`progresso-${etapa.id}`}>Progresso (%)</Label>
                        <Input id={`progresso-${etapa.id}`} type="number" min="0" max="100" defaultValue="0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="financeiro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Financeiras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orcamentoTotal">Orçamento Total</Label>
                  <Input id="orcamentoTotal" type="number" min="0" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorContrato">Valor do Contrato</Label>
                  <Input id="valorContrato" type="number" min="0" step="0.01" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avista">À Vista</SelectItem>
                    <SelectItem value="parcelado">Parcelado</SelectItem>
                    <SelectItem value="medicao">Por Medição</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observações Financeiras</Label>
                <Textarea placeholder="Observações sobre o financeiro da obra" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" asChild>
          <Link href="/dashboard/obras">Cancelar</Link>
        </Button>
        <Button type="submit">Salvar Obra</Button>
      </div>
    </div>
  )
}
