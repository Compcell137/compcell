/**
 * Configuración de rutas protegidas
 * Define cuáles rutas requieren autenticación y qué rol
 */

export const ROUTE_CONFIG = {
  // Rutas públicas (sin autenticación requerida)
  public: [
    '/',
    '/products',
    '/categories',
    '/service',
    '/auth/login',
    '/auth/register',
    '/firebase-test',
  ],

  // Rutas que requieren autenticación simple (cualquier usuario)
  protected: ['/profile', '/orders'],

  // Rutas que requieren ser admin
  adminOnly: ['/admin'],

  // Rutas que requieren ser vendor o admin
  vendorOrAdmin: ['/products/add', '/products/edit'],
};

/**
 * Verifica si una ruta requiere autenticación
 */
export function isRouteProtected(pathname: string): boolean {
  return (
    ROUTE_CONFIG.protected.some(route => pathname.startsWith(route)) ||
    ROUTE_CONFIG.adminOnly.some(route => pathname.startsWith(route)) ||
    ROUTE_CONFIG.vendorOrAdmin.some(route => pathname.startsWith(route))
  );
}

/**
 * Obtiene el tipo de protección de una ruta
 */
export type RouteProtectionType = 'public' | 'protected' | 'admin' | 'vendor';

export function getRouteProtectionType(pathname: string): RouteProtectionType {
  if (ROUTE_CONFIG.adminOnly.some(route => pathname.startsWith(route))) {
    return 'admin';
  }
  if (ROUTE_CONFIG.vendorOrAdmin.some(route => pathname.startsWith(route))) {
    return 'vendor';
  }
  if (ROUTE_CONFIG.protected.some(route => pathname.startsWith(route))) {
    return 'protected';
  }
  return 'public';
}
