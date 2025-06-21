"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/actions/auth" // Importa a Server Action de logout

export function LogoutButton() {
  // useActionState para lidar com o estado de envio do formulário
  const [state, formAction, isPending] = useActionState(logout, null)

  return (
    <form action={formAction}>
      <Button
        type="submit"
        variant="outline"
        className="bg-black text-white" // Exemplo de estilo para o botão de logout
        disabled={isPending}
      >
        {isPending ? "Saindo..." : "Sair"}
      </Button>
    </form>
  )
}
