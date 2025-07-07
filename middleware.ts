import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login"
  const isApiRoute = request.nextUrl.pathname.startsWith("/api")

  // Permitir todas las rutas de API
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Para páginas que no son login, permitir el acceso
  // La autenticación se maneja en el lado del cliente con localStorage
  if (!isLoginPage) {
    return NextResponse.next()
  }

  // Para la página de login, permitir el acceso
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
