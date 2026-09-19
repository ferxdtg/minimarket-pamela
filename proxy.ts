import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (ex-middleware) de protección de rutas admin.
 * Intercepta todas las rutas /admin/* excepto /admin/login.
 * Verifica la existencia de una cookie de sesión de Firebase.
 * Si no existe, redirige al login.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acceso libre al login
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Verificar cookie de sesión seteada en admin/login tras autenticación exitosa
  const sessionCookie = request.cookies.get("admin_session");

  if (!sessionCookie || !sessionCookie.value) {
    // No autenticado → redirigir al login con parámetro de retorno
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Autenticado → continuar
  return NextResponse.next();
}

export const config = {
  // Aplicar solo a rutas /admin/* excepto recursos estáticos
  matcher: ["/admin/:path*"],
};
