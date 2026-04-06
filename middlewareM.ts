import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware temporalmente deshabilitado para evitar errores
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
