import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getObraById } from "@/app/actions/obra"
import { ObraDetalhes } from "./components/obra-detalhes"
import { Skeleton } from "@/components/ui/skeleton"

interface ObraDetalhesPageProps {
  params: {
    id: string
  }
}

async function ObraDetalhesContent({ id }: { id: string }) {
  const result = await getObraById(id)


  if (!result.success || !result.data) {
    notFound()
  }

  return <ObraDetalhes obra={result.data} />
}

function ObraDetalhesSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}

export default function ObraDetalhesPage({ params }: ObraDetalhesPageProps) {
  return (
    <Suspense fallback={<ObraDetalhesSkeleton />}>
      <ObraDetalhesContent id={params.id} />
    </Suspense>
  )
}
