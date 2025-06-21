"use client" // Marca o componente como Client Component

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionState } from "react" // Importa o hook useActionState
import { login } from "@/app/actions/auth" // Importa a Server Action de login

export default function LoginPage() {
  // Inicializa useActionState com a Server Action 'login'
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
        <Link href="/" className="mb-8 flex items-center gap-2">
          {/* Usando placeholder.svg para a imagem */}
          <Image
            src="/placeholder.svg?height=40&width=40&text=Logo"
            alt="Master Construtora Logo"
            width={40}
            height={40}
            className="rounded"
          />
          <span className="text-xl font-bold">Master Construtora</span>
        </Link>
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
            <CardDescription>Digite suas credenciais para acessar o sistema de gestão</CardDescription>
          </CardHeader>
          <CardContent>
            {/* O atributo 'action' do formulário agora aponta para a Server Action */}
            <form action={formAction}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {/* Adicionado o atributo 'name' para que o FormData possa capturar o valor */}
                  <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  {/* Adicionado o atributo 'name' para que o FormData possa capturar o valor */}
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {/* O botão é desabilitado enquanto a ação está pendente */}
                  {isPending ? "Entrando..." : "Entrar"}
                </Button>
              </div>
            </form>
            {/* Exibe mensagens de feedback (sucesso/erro) da Server Action */}
            {state?.message && (
              <div className={`mt-4 text-center ${state.success ? "text-green-600" : "text-red-600"}`}>
                {state.message}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              Não tem uma conta?{" "}
              <Link href="#" className="text-primary hover:underline">
                Entre em contato com o administrador
              </Link>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Voltar para o site</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
