import { NextRequest, NextResponse } from 'next/server';

// Rutas que requieren autenticación
export const protectedRoutes = {
  admin: ['/admin'],
  profile: ['/profile', '/orders'],
  all: ['/admin', '/profile', '/orders'],
};

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/auth/login', '/auth/register', '/', '/products', '/categories', '/service', '/firebase-test'];

// API routes públicas
const publicApiRoutes = ['/api/send-receipt', '/api/shalom/track'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir rutas de API públicas
  if (pathname.startsWith('/api')) {
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }
  }

  // Las rutas públicas pueden accederse siempre
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Rutas protegidas: verificar autenticación en el cliente
  // Este middleware no puede verificar la autenticación completamente porque 
  // Firebase se ejecuta en el cliente. Usamos el componente ProtectedRoute para eso.
  if (protectedRoutes.all.some(route => pathname.startsWith(route))) {
    // Permitir que el componente ProtectedRoute maneje la verificación
    // Solo hacemos una verificación básica de intención
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas las rutas excepto:
     * - _next/static (archivos static)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - archivos estáticos (.webp, .svg, .png, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.webp|.*\\.svg|.*\\.png).*)',
  ],
};
