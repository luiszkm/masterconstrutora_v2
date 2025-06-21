"use server"

import { revalidateTag } from "next/cache"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Dados mockados para demonstração
const orcamentosMockados: Orcamento[] = [
  {
    id: "1",
    vinculoObra: "Obra A",
    etapaObra: "Fundação",
    dataEmissao: "2024-01-15",
    fornecedorPrincipal: "Materiais Premium Ltda",
    itens: [
      {
        id: "1",
        descricao: "Cimento",
        quantidade: 50,
        valorUnitario: 32.5,
        valorTotal: 1625.0,
        fornecedor: "Materiais Premium Ltda",
        unidade: "Saco 50kg",
      },
      {
        id: "2",
        descricao: "Areia",
        quantidade: 10,
        valorUnitario: 45.0,
        valorTotal: 450.0,
        fornecedor: "Materiais Premium Ltda",
        unidade: "m³",
      },
      {
        id: "3",
        descricao: "Brita",
        quantidade: 8,
        valorUnitario: 55.0,
        valorTotal: 440.0,
        fornecedor: "Materiais Premium Ltda",
        unidade: "m³",
      },
    ],
    condicoesPagamento: "30dias",
    observacoes: "Orçamento para fundação da obra A. Materiais de primeira qualidade.",
    subtotal: 2515.0,
    impostos: 251.5,
    total: 2766.5,
    status: "Rascunho",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    vinculoObra: "Obra B",
    etapaObra: "Acabamento",
    dataEmissao: "2024-01-20",
    fornecedorPrincipal: "Mármores & Granitos SA",
    itens: [
      {
        id: "4",
        descricao: "Porcelanatos",
        quantidade: 120,
        valorUnitario: 89.9,
        valorTotal: 10788.0,
        fornecedor: "Mármores & Granitos SA",
        unidade: "m²",
      },
      {
        id: "5",
        descricao: "Granitos",
        quantidade: 25,
        valorUnitario: 180.0,
        valorTotal: 4500.0,
        fornecedor: "Mármores & Granitos SA",
        unidade: "m²",
      },
    ],
    condicoesPagamento: "parcelado",
    observacoes: "Materiais para acabamento premium. Entrega em 15 dias.",
    subtotal: 15288.0,
    impostos: 1528.8,
    total: 16816.8,
    status: "Enviado",
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
]

// Tipos para orçamento
export type ItemOrcamento = {
  id: string
  descricao: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  fornecedor: string
  unidade: string
}

export type Orcamento = {
  id?: string
  vinculoObra: string
  etapaObra: string
  dataEmissao: string
  fornecedorPrincipal: string
  itens: ItemOrcamento[]
  condicoesPagamento: string
  observacoes?: string
  subtotal: number
  impostos: number
  total: number
  status: "Rascunho" | "Enviado" | "Aprovado" | "Rejeitado"
  createdAt?: string
  updatedAt?: string
}

/**
 * Cria um novo orçamento
 */
export async function createOrcamento(prevState: any, formData: FormData) {
  const itensJson = formData.get("itens") as string

  if (!itensJson) {
    return { success: false, message: "Itens do orçamento são obrigatórios." }
  }

  let itens: ItemOrcamento[]
  try {
    itens = JSON.parse(itensJson)
  } catch (error) {
    return { success: false, message: "Formato de itens inválido." }
  }

  const subtotal = itens.reduce((total, item) => total + item.valorTotal, 0)
  const impostos = subtotal * 0.1
  const total = subtotal + impostos

  const orcamentoData: Orcamento = {
    vinculoObra: formData.get("vinculoObra") as string,
    etapaObra: formData.get("etapaObra") as string,
    dataEmissao: formData.get("dataEmissao") as string,
    fornecedorPrincipal: formData.get("fornecedorPrincipal") as string,
    itens,
    condicoesPagamento: formData.get("condicoesPagamento") as string,
    observacoes: formData.get("observacoes") as string,
    subtotal,
    impostos,
    total,
    status: "Rascunho",
  }

  if (!orcamentoData.vinculoObra || !orcamentoData.dataEmissao || !orcamentoData.fornecedorPrincipal) {
    return { success: false, message: "Vínculo de obra, data de emissão e fornecedor principal são obrigatórios." }
  }

  try {
    const response = await fetch(`${API_URL}/orcamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orcamentoData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, message: errorData.message || "Erro ao criar orçamento." }
    }

    revalidateTag("orcamentos")

    const result = await response.json()
    return { success: true, message: "Orçamento criado com sucesso!", orcamentoId: result.id }
  } catch (error) {
    console.error("Erro ao criar orçamento:", error)
    return { success: false, message: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * Busca todos os orçamentos
 */
export async function getOrcamentos(): Promise<Orcamento[] | { error: string }> {
  try {
    const response = await fetch(`${API_URL}/orcamentos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { tags: ["orcamentos"] },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Erro ao buscar orçamentos." }
    }

    const data: Orcamento[] = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * Busca um orçamento pelo ID
 */
export async function getOrcamentoById(id: string): Promise<Orcamento | { error: string }> {
  try {
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Buscar nos dados mockados
    const orcamento = orcamentosMockados.find((o) => o.id === id)

    if (!orcamento) {
      return { error: `Orçamento com ID ${id} não encontrado.` }
    }

    return orcamento
  } catch (error) {
    console.error(`Erro ao buscar orçamento com ID ${id}:`, error)
    return { error: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * Atualiza um orçamento existente
 */
export async function updateOrcamento(id: string, prevState: any, formData: FormData) {
  const itensJson = formData.get("itens") as string

  if (!itensJson) {
    return { success: false, message: "Itens do orçamento são obrigatórios." }
  }

  let itens: ItemOrcamento[]
  try {
    itens = JSON.parse(itensJson)
  } catch (error) {
    return { success: false, message: "Formato de itens inválido." }
  }

  const subtotal = itens.reduce((total, item) => total + item.valorTotal, 0)
  const impostos = subtotal * 0.1
  const total = subtotal + impostos

  try {
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simular atualização nos dados mockados
    const orcamentoIndex = orcamentosMockados.findIndex((o) => o.id === id)

    if (orcamentoIndex === -1) {
      return { success: false, message: "Orçamento não encontrado." }
    }

    // Atualizar dados mockados
    orcamentosMockados[orcamentoIndex] = {
      ...orcamentosMockados[orcamentoIndex],
      vinculoObra: formData.get("vinculoObra") as string,
      etapaObra: formData.get("etapaObra") as string,
      dataEmissao: formData.get("dataEmissao") as string,
      fornecedorPrincipal: formData.get("fornecedorPrincipal") as string,
      itens,
      condicoesPagamento: formData.get("condicoesPagamento") as string,
      observacoes: formData.get("observacoes") as string,
      subtotal,
      impostos,
      total,
      updatedAt: new Date().toISOString(),
    }

    return { success: true, message: "Orçamento atualizado com sucesso!" }
  } catch (error) {
    console.error(`Erro ao atualizar orçamento com ID ${id}:`, error)
    return { success: false, message: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * Exclui um orçamento
 */
export async function deleteOrcamento(id: string) {
  if (!id) {
    return { success: false, message: "ID do orçamento é obrigatório para exclusão." }
  }

  try {
    const response = await fetch(`${API_URL}/orcamentos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, message: errorData.message || "Erro ao excluir orçamento." }
    }

    revalidateTag("orcamentos")

    return { success: true, message: "Orçamento excluído com sucesso!" }
  } catch (error) {
    console.error(`Erro ao excluir orçamento com ID ${id}:`, error)
    return { success: false, message: "Erro de conexão com o servidor. Tente novamente." }
  }
}

/**
 * Atualiza o status de um orçamento
 */
export async function updateOrcamentoStatus(id: string, status: Orcamento["status"]) {
  if (!id) {
    return { success: false, message: "ID do orçamento é obrigatório." }
  }

  try {
    const response = await fetch(`${API_URL}/orcamentos/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, message: errorData.message || "Erro ao atualizar status do orçamento." }
    }

    revalidateTag("orcamentos")
    revalidateTag(`orcamento-${id}`)

    return { success: true, message: "Status do orçamento atualizado com sucesso!" }
  } catch (error) {
    console.error(`Erro ao atualizar status do orçamento com ID ${id}:`, error)
    return { success: false, message: "Erro de conexão com o servidor. Tente novamente." }
  }
}
