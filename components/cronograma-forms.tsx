'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { Plus, Trash2 } from 'lucide-react'

import {
  criarCronogramaAction,
  criarCronogramaLoteAction
} from '@/app/actions/cronograma'

// Schemas de validação
const cronogramaIndividualSchema = z.object({
  numeroEtapa: z.number().min(1, 'Número da etapa deve ser maior que 0'),
  descricaoEtapa: z.string().min(1, 'Descrição é obrigatória'),
  valorPrevisto: z.number().min(0.01, 'Valor deve ser maior que 0'),
  dataVencimento: z
    .string()
    .min(1, 'Data de vencimento é obrigatória')
    .refine(date => !isNaN(new Date(date).getTime()), {
      message: 'Data inválida'
    })
})

const cronogramaLoteSchema = z.object({
  substituirExistente: z.boolean(),
  cronogramas: z
    .array(
      z.object({
        numeroEtapa: z.number().min(1, 'Número da etapa deve ser maior que 0'),
        descricaoEtapa: z.string().min(1, 'Descrição é obrigatória'),
        valorPrevisto: z.number().min(0.01, 'Valor deve ser maior que 0'),
        dataVencimento: z
          .string()
          .min(1, 'Data de vencimento é obrigatória')
          .refine(date => !isNaN(new Date(date).getTime()), {
            message: 'Data inválida'
          })
      })
    )
    .min(1, 'Pelo menos um cronograma deve ser adicionado')
})

type CronogramaIndividualForm = z.infer<typeof cronogramaIndividualSchema>
type CronogramaLoteForm = z.infer<typeof cronogramaLoteSchema>

interface CronogramaFormsProps {
  obraId: string
  onSuccess: () => void
}

// Componente para criar cronograma individual
export function CriarCronogramaIndividual({
  open,
  onOpenChange,
  obraId,
  onSuccess
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  obraId: string
  onSuccess: () => void
}>) {
  const [loading, setLoading] = useState(false)

  const form = useForm<CronogramaIndividualForm>({
    resolver: zodResolver(cronogramaIndividualSchema),
    defaultValues: {
      numeroEtapa: 1,
      descricaoEtapa: '',
      valorPrevisto: 0,
      dataVencimento: ''
    }
  })

  const onSubmit = async (data: CronogramaIndividualForm) => {
    setLoading(true)
    try {
      const result = await criarCronogramaAction({
        ...data,
        dataVencimento: new Date(data.dataVencimento).toISOString(),
        obraId
      })

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Cronograma criado com sucesso!'
        })

        form.reset()
        onOpenChange(false)
        onSuccess()
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao criar cronograma',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar cronograma',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Cronograma</DialogTitle>
          <DialogDescription>
            Crie uma nova etapa do cronograma de recebimento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroEtapa">Número da Etapa</Label>
              <Input
                id="numeroEtapa"
                type="number"
                {...form.register('numeroEtapa', { valueAsNumber: true })}
              />
              {form.formState.errors.numeroEtapa && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.numeroEtapa.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorPrevisto">Valor Previsto</Label>
              <Input
                id="valorPrevisto"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...form.register('valorPrevisto', { valueAsNumber: true })}
              />
              {form.formState.errors.valorPrevisto && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.valorPrevisto.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricaoEtapa">Descrição da Etapa</Label>
            <Textarea
              id="descricaoEtapa"
              placeholder="Ex: Fundações Concluídas"
              {...form.register('descricaoEtapa')}
            />
            {form.formState.errors.descricaoEtapa && (
              <p className="text-sm text-red-500">
                {form.formState.errors.descricaoEtapa.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataVencimento">Data de Vencimento</Label>
            <Input
              id="dataVencimento"
              type="date"
              {...form.register('dataVencimento')}
            />
            {form.formState.errors.dataVencimento && (
              <p className="text-sm text-red-500">
                {form.formState.errors.dataVencimento.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Cronograma'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente para criar cronograma em lote
export function CriarCronogramaLote({
  open,
  onOpenChange,
  obraId,
  onSuccess
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  obraId: string
  onSuccess: () => void
}>) {
  const [loading, setLoading] = useState(false)

  const form = useForm<CronogramaLoteForm>({
    resolver: zodResolver(cronogramaLoteSchema),
    defaultValues: {
      substituirExistente: false,
      cronogramas: [
        {
          numeroEtapa: 1,
          descricaoEtapa: '',
          valorPrevisto: 0,
          dataVencimento: ''
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'cronogramas'
  })

  const onSubmit = async (data: CronogramaLoteForm) => {
    setLoading(true)
    try {
      const result = await criarCronogramaLoteAction({
        ...data,
        obraId
      })

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: `${data.cronogramas.length} cronogramas criados com sucesso!`
        })

        form.reset()
        onOpenChange(false)
        onSuccess()
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao criar cronogramas',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar cronogramas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const adicionarCronograma = () => {
    const ultimoNumero = Math.max(
      ...form.getValues('cronogramas').map(c => c.numeroEtapa),
      0
    )
    append({
      numeroEtapa: ultimoNumero + 1,
      descricaoEtapa: '',
      valorPrevisto: 0,
      dataVencimento: ''
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cronograma em Lote</DialogTitle>
          <DialogDescription>
            Crie múltiplas etapas do cronograma de recebimento de uma vez.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="substituirExistente"
              {...form.register('substituirExistente')}
            />
            <Label htmlFor="substituirExistente">
              Substituir cronograma existente
            </Label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Etapas do Cronograma</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={adicionarCronograma}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Etapa
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Etapa {index + 1}</h5>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Número da Etapa</Label>
                    <Input
                      type="number"
                      {...form.register(`cronogramas.${index}.numeroEtapa`, {
                        valueAsNumber: true
                      })}
                    />
                    {form.formState.errors.cronogramas?.[index]
                      ?.numeroEtapa && (
                      <p className="text-sm text-red-500">
                        {
                          form.formState.errors.cronogramas[index]?.numeroEtapa
                            ?.message
                        }
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>Valor Previsto</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      {...form.register(`cronogramas.${index}.valorPrevisto`, {
                        valueAsNumber: true
                      })}
                    />
                    {form.formState.errors.cronogramas?.[index]
                      ?.valorPrevisto && (
                      <p className="text-sm text-red-500">
                        {
                          form.formState.errors.cronogramas[index]
                            ?.valorPrevisto?.message
                        }
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Descrição da Etapa</Label>
                  <Textarea
                    placeholder="Ex: Fundações Concluídas"
                    {...form.register(`cronogramas.${index}.descricaoEtapa`)}
                  />
                  {form.formState.errors.cronogramas?.[index]
                    ?.descricaoEtapa && (
                    <p className="text-sm text-red-500">
                      {
                        form.formState.errors.cronogramas[index]?.descricaoEtapa
                          ?.message
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Data de Vencimento</Label>
                  <Input
                    type="date"
                    {...form.register(`cronogramas.${index}.dataVencimento`, {
                      setValueAs: value =>
                        value ? new Date(value).toISOString() : null
                    })}
                  />
                  {form.formState.errors.cronogramas?.[index]
                    ?.dataVencimento && (
                    <p className="text-sm text-red-500">
                      {
                        form.formState.errors.cronogramas[index]?.dataVencimento
                          ?.message
                      }
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : `Criar ${fields.length} Cronogramas`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
