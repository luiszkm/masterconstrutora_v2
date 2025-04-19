"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

/**
 * Hook para revalidar o cache do Next.js
 */
export function useRevalidate() {
  const router = useRouter()

  /**
   * Revalida o cache para as tags especificadas
   */
  const revalidateTags = useCallback(
    async (tags: string[]) => {
      try {
        // Chama a API de revalidação do Next.js
        const response = await fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tags }),
        })

        if (!response.ok) {
          throw new Error("Falha ao revalidar o cache")
        }

        // Atualiza a página atual
        router.refresh()

        return true
      } catch (error) {
        console.error("Erro ao revalidar o cache:", error)
        return false
      }
    },
    [router],
  )

  /**
   * Revalida o cache para uma entidade específica
   */
  const revalidateEntity = useCallback(
    (entity: string, id?: string) => {
      const tags = [entity]
      if (id) {
        tags.push(`${entity}-${id}`)
      }
      return revalidateTags(tags)
    },
    [revalidateTags],
  )

  return {
    revalidateTags,
    revalidateEntity,
  }
}
