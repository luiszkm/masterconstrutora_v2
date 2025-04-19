import { revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

/**
 * Rota de API para revalidar o cache do Next.js
 */
export async function POST(request: NextRequest) {
  try {
    const { tags } = await request.json()

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: "Tags inválidas" }, { status: 400 })
    }

    // Revalida cada tag
    for (const tag of tags) {
      revalidateTag(tag)
    }

    return NextResponse.json({
      revalidated: true,
      tags,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Erro ao revalidar o cache:", error)
    return NextResponse.json({ error: "Falha ao revalidar o cache" }, { status: 500 })
  }
}
