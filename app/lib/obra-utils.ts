import type { EtapaObra } from "@/app/actions/obra"

// Função para calcular percentual de evolução (cada etapa = 20%)
export function calcularEvolucao(etapas: EtapaObra[]): number {
  const etapasConcluidas = etapas.filter((etapa) => etapa.concluida).length
  return etapasConcluidas * 20
}

// Função para obter etapa atual
export function obterEtapaAtual(etapas: EtapaObra[]): string {
  const etapaAtual = etapas.find((etapa) => !etapa.concluida)
  return etapaAtual ? etapaAtual.nome : "Concluída"
}

// Função para obter próxima etapa disponível para conclusão
export function obterProximaEtapa(etapas: EtapaObra[]): EtapaObra | null {
  // Encontra a primeira etapa não concluída
  for (let i = 0; i < etapas.length; i++) {
    const etapa = etapas[i]

    if (!etapa.concluida) {
      // Verifica se todas as etapas anteriores estão concluídas
      const etapasAnteriores = etapas.slice(0, i)
      const todasAnterioresConcluidas = etapasAnteriores.every((e) => e.concluida)

      if (todasAnterioresConcluidas) {
        return etapa
      }
    }
  }

  return null
}

// Função para verificar se pode concluir uma etapa
export function podeConclurEtapa(etapas: EtapaObra[], etapaId: string): boolean {
  const etapaIndex = etapas.findIndex((e) => e.id === etapaId)

  if (etapaIndex === -1) return false

  // Primeira etapa sempre pode ser concluída
  if (etapaIndex === 0) return true

  // Verifica se todas as etapas anteriores estão concluídas
  const etapasAnteriores = etapas.slice(0, etapaIndex)
  return etapasAnteriores.every((e) => e.concluida)
}

// Função para obter cor do progresso
export function getProgressColor(percentual: number): string {
  if (percentual < 20) return "bg-red-500"
  if (percentual < 40) return "bg-orange-500"
  if (percentual < 60) return "bg-yellow-500"
  if (percentual < 80) return "bg-blue-500"
  return "bg-green-500"
}

// Função para formatar status da obra
export function formatarStatusObra(status: string): {
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
  className?: string
} {
  switch (status) {
    case "Concluída":
      return { label: "Concluída", variant: "default", className: "bg-green-500" }
    case "Em andamento":
      return { label: "Em andamento", variant: "secondary", className: "bg-blue-500" }
    case "Pausada":
      return { label: "Pausada", variant: "outline", className: "bg-yellow-500" }
    default:
      return { label: status, variant: "outline" }
  }
}
