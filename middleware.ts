import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "@/app/lib/session" // Importa a função decrypt da sua lib de sessão

// Rotas que são acessíveis publicamente (não exigem autenticação)
const publicPaths = ["/", "/login"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicPath = publicPaths.includes(path)

  // Obtém o cookie de sessão
  const session = request.cookies.get("session")?.value
  // Descriptografa a sessão para verificar se o usuário está logado
  const payload = await decrypt(session)

  // Cenário 1: Usuário está logado (payload existe)
  if (payload) {
    // Se o usuário logado tentar acessar uma rota pública (como login), redireciona para o dashboard
    if (isPublicPath) {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl))
    }
    // Se o usuário logado tentar acessar uma rota protegida, permite o acesso
    return NextResponse.next()
  }

  // Cenário 2: Usuário NÃO está logado (payload é null)
  if (!payload) {
    // Se o usuário não logado tentar acessar uma rota protegida, redireciona para a página de login
    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/login", request.nextUrl))
    }
    // Se o usuário não logado tentar acessar uma rota pública, permite o acesso
    return NextResponse.next()
  }

  // Caso padrão, permite a requisição (deve ser alcançado raramente com a lógica acima)
  return NextResponse.next()
}

// Configuração do matcher para o middleware
// Isso especifica quais caminhos o middleware deve interceptar.
// Excluímos arquivos estáticos (_next/static, _next/image, favicon.ico) e a API de login em si,
// embora a lógica acima já trate o /auth/login.
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de solicitação, exceto aqueles que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico (arquivo de favicon)
     * - Qualquer caminho que contenha um ponto (.), indicando um arquivo estático (e.g., .png, .jpg, .svg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
