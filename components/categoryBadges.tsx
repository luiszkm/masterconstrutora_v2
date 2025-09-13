import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

interface CategoriaBadgesProps {
  categorias?: string[]
  limit?: number
}

export function CategoryBadges({
  categorias = [],
  limit = 3
}: Readonly<CategoriaBadgesProps>) {
  if (!categorias || categorias.length === 0) {
    return <span className="text-sm text-muted-foreground">Sem categoria</span>
  }

  const visible = categorias.slice(0, limit)
  const hidden = categorias.slice(limit)

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((categoria, index) => (
        <Badge
          key={`${categoria}-${index}`}
          variant="outline"
          className="text-xs"
        >
          {categoria}
        </Badge>
      ))}

      {hidden.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Badge variant="secondary" className="text-xs cursor-pointer">
              +{hidden.length}
            </Badge>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Todas as categorias</DialogTitle>
            </DialogHeader>
            <div className="flex flex-wrap gap-2">
              {categorias.map((categoria, index) => (
                <Badge
                  key={`${categoria}-${index}`}
                  variant="outline"
                  className="text-xs"
                >
                  {categoria}
                </Badge>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
