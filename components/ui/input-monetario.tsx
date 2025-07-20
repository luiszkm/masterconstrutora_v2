"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/app/lib/utils"

export interface InputMonetarioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number
  onChange?: (value: number) => void
}

const InputMonetario = React.forwardRef<HTMLInputElement, InputMonetarioProps>(
  ({ className, value = 0, onChange, onBlur, onFocus, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")
    const [isFocused, setIsFocused] = React.useState(false)

    // Função para formatar valor para exibição
    const formatarParaExibicao = (valor: number): string => {
      if (valor === 0) return ""
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    }

    // Função para formatar valor durante edição (sem R$)
    const formatarParaEdicao = (valor: number): string => {
      if (valor === 0) return ""
      return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }

    // Função para converter string para número
    const converterParaNumero = (str: string): number => {
      if (!str || str.trim() === "") return 0

      // Remove tudo exceto números, vírgulas e pontos
      let limpo = str.replace(/[^\d,.-]/g, "")

      // Se tem vírgula, assume formato brasileiro (1.234,56)
      if (limpo.includes(",")) {
        // Remove pontos (separadores de milhar) e troca vírgula por ponto
        limpo = limpo.replace(/\./g, "").replace(",", ".")
      }

      const numero = Number.parseFloat(limpo)
      return isNaN(numero) ? 0 : numero
    }

    // Atualizar display quando value prop mudar (apenas quando não focado)
    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatarParaExibicao(value))
      }
    }, [value, isFocused])

    // Inicializar display value
    React.useEffect(() => {
      setDisplayValue(formatarParaExibicao(value))
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      setDisplayValue(inputValue)

      // Converter para número e notificar mudança
      const numeroConvertido = converterParaNumero(inputValue)
      onChange?.(numeroConvertido)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      // Ao focar, mostrar valor formatado para edição (sem R$)
      setDisplayValue(formatarParaEdicao(value))
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      // Ao sair do foco, formatar com R$
      setDisplayValue(formatarParaExibicao(value))
      onBlur?.(e)
    }

    return (
      <Input
        type="text"
        className={cn(className)}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="R$ 0,00"
        ref={ref}
        {...props}
      />
    )
  },
)

InputMonetario.displayName = "InputMonetario"

export { InputMonetario }
