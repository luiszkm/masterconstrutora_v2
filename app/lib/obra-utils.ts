import type { EtapaObra } from "@/app/actions/obra"

// Calcular evolução da obra baseado nas etapas concluídas
export function calcularEvolucao(etapas: EtapaObra[]): number {
  if (etapas.length === 0) return 0

  const etapasConcluidas = etapas.filter((etapa) => etapa.status === "Completa").length
  return Math.round((etapasConcluidas / etapas.length) * 100)
}

// Obter etapa atual (primeira não concluída ou última se todas concluídas)
export function obterEtapaAtual(etapas: EtapaObra[]): string {
  const etapaAtual = etapas.find((etapa) => etapa.status !== "Completa")
  return etapaAtual ? etapaAtual.nome : etapas[etapas.length - 1]?.nome || "N/A"
}

// Obter próxima etapa a ser concluída
export function obterProximaEtapa(etapas: EtapaObra[]): EtapaObra | null {
  return etapas.find((etapa) => etapa.status !== "Completa") || null
}

// Verificar se pode concluir uma etapa (etapas anteriores devem estar concluídas)
export function podeConclurEtapa(etapas: EtapaObra[], etapaId: string): boolean {
  const etapaIndex = etapas.findIndex((e) => e.id === etapaId)
  if (etapaIndex === -1) return false

  // Verificar se todas as etapas anteriores estão concluídas
  for (let i = 0; i < etapaIndex; i++) {
    if (etapas[i].status !== "Completa") {
      return false
    }
  }

  return true
}

// Formatar status da obra para exibição
export function formatarStatusObra(status: string) {
  const statusMap = {
    "Em andamento": {
      label: "Em Andamento",
      variant: "default" as const,
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    Concluída: {
      label: "Concluída",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    Pausada: {
      label: "Pausada",
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
  }

  return (
    statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: "outline" as const,
      className: "",
    }
  )
}

// Obter cor da barra de progresso baseada na evolução
export function getProgressColor(evolucao: number): string {
  if (evolucao >= 80) return "bg-green-500"
  if (evolucao >= 60) return "bg-blue-500"
  if (evolucao >= 40) return "bg-yellow-500"
  if (evolucao >= 20) return "bg-orange-500"
  return "bg-red-500"
}

// Calcular dias restantes para conclusão
export function calcularDiasRestantes(dataFim: string): number {
  const hoje = new Date()
  const fim = new Date(dataFim)
  const diffTime = fim.getTime() - hoje.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Verificar se obra está atrasada
export function obraAtrasada(etapas: EtapaObra[]): boolean {
  const hoje = new Date().toISOString().split("T")[0]

  return etapas.some((etapa) => {
    if (etapa.status !== "Completa" && etapa.dataFimPrevista) {
      return etapa.dataFimPrevista < hoje
    }
    return false
  })
}

// Obter cor do status da etapa para exibição
export function getEtapaStatusColor(status: "Completa" | "Em Andamento" | "Pendente"): string {
  switch (status) {
    case "Completa":
      return "bg-green-500 text-white"
    case "Em Andamento":
      return "bg-blue-500 text-white"
    case "Pendente":
      return "bg-gray-300 text-gray-700"
    default:
      return "bg-gray-300 text-gray-700"
  }
}

// Verificar se etapa pode ser iniciada (etapas anteriores completas)
export function podeIniciarEtapa(etapas: EtapaObra[], etapaId: string): boolean {
  const etapaIndex = etapas.findIndex((e) => e.id === etapaId)
  if (etapaIndex === -1) return false

  // Primeira etapa sempre pode ser iniciada
  if (etapaIndex === 0) return true

  // Verificar se etapa anterior está completa
  return etapas[etapaIndex - 1].status === "Completa"
}
