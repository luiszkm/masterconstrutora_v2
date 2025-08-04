import "server-only"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secretKey = process.env.AUTH_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Sessão expira em 7 dias
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = ""): Promise<any | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    console.error("Falha ao verificar sessão:", error)
    return null
  }
}

export async function createSession(sessionData: any) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

  // Se sessionData for uma string (userId), converter para objeto
  const data = typeof sessionData === "string" ? { userId: sessionData, expiresAt } : { ...sessionData, expiresAt }

  const session = await encrypt(data)

  ;(await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return null
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Estende por mais 7 dias
  ;(await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession() {
  (await cookies()).delete("session")
}

export async function getJWTToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")?.value
  const payload = await decrypt(sessionCookie)

  if (!payload || !payload.jwtToken) {
    return null
  }

  return payload.jwtToken
}