/**
 * =============================================================================
 * GUÍA DE PROTECCIÓN DE RUTAS EN COMPCELL
 * =============================================================================
 * 
 * Este archivo documenta cómo funciona el sistema de protección de rutas
 * implementado en el proyecto.
 * 
 */

/**
 * =============================================================================
 * 1. ARCHIVOS DE CONFIGURACIÓN
 * =============================================================================
 * 
 * - middleware.ts: Middleware global que ejecuta en el servidor
 *   Ubicación: raíz del proyecto
 *   Función: Verificación inicial de rutas, logging, etc
 * 
 * - lib/route-config.ts: Configuración centralizada de rutas
 *   Define qué rutas son públicas, protegidas, admin-only, etc
 * 
 * - contexts/AuthContext.tsx: Contexto de autenticación
 *   Maneja el estado del usuario y sesión
 * 
 * - hooks/useRouteProtection.ts: Hooks personalizados
 *   Facilitan la protección de rutas en componentes
 * 
 */

/**
 * =============================================================================
 * 2. COMPONENTES DE PROTECCIÓN
 * =============================================================================
 * 
 * ProtectedRoute: Componente de alto orden para proteger contenido
 * ─────────────────────────────────────────────────────────────────
 * 
 * Uso básico (requiere autenticación):
 * 
 *   <ProtectedRoute>
 *     <MiComponente />
 *   </ProtectedRoute>
 * 
 * 
 * Uso para admin:
 * 
 *   <ProtectedRoute requireAdmin>
 *     <AdminPanel />
 *   </ProtectedRoute>
 * 
 * 
 * Uso para vendor/admin:
 * 
 *   <ProtectedRoute requireAdminOrVendor>
 *     <ProductManagement />
 *   </ProtectedRoute>
 * 
 */

/**
 * =============================================================================
 * 3. HOOKS PERSONALIZADOS
 * =============================================================================
 * 
 * useRouteProtection: Protección genérica de rutas
 * ────────────────────────────────────────────────
 * 
 * const { isAuthorized, loading } = useRouteProtection({
 *   requireAdmin: true,
 *   redirectTo: '/unauthorized'
 * });
 * 
 * if (loading) return <Loader />;
 * if (!isAuthorized) return <AccessDenied />;
 * 
 * return <AdminContent />;
 * 
 * 
 * useIsAdmin: Verifica si el usuario es admin
 * ───────────────────────────────────────────
 * 
 * const { isAdmin, loading } = useIsAdmin();
 * if (isAdmin) {
 *   return <AdminButton />;
 * }
 * 
 * 
 * useIsVendor: Verifica si es vendor o admin
 * ──────────────────────────────────────────
 * 
 * const { isVendor, loading } = useIsVendor();
 * 
 * 
 * useIsAuthenticated: Verifica si está logueado
 * ──────────────────────────────────────────────
 * 
 * const { isAuthenticated, loading } = useIsAuthenticated();
 * 
 */

/**
 * =============================================================================
 * 4. EJEMPLO COMPLETO: PÁGINA DE ADMIN PROTEGIDA
 * =============================================================================
 * 
 * File: app/admin/page.tsx
 * 
 *   "use client";
 *   
 *   import ProtectedRoute from '@/components/ProtectedRoute';
 *   import AdminPanel from '@/components/AdminPanel';
 *   
 *   export default function AdminPage() {
 *     return (
 *       <ProtectedRoute requireAdmin>
 *         <AdminPanel />
 *       </ProtectedRoute>
 *     );
 *   }
 * 
 */

/**
 * =============================================================================
 * 5. EJEMPLO: HEADER CON BOTONES CONDICIONALES
 * =============================================================================
 * 
 * "use client";
 * 
 * import { useIsAdmin } from '@/hooks/useRouteProtection';
 * 
 * export function Header() {
 *   const { isAdmin, loading } = useIsAdmin();
 * 
 *   if (loading) return <HeaderSkeleton />;
 * 
 *   return (
 *     <header>
 *       <nav>
 *         <a href="/products">Productos</a>
 *         {isAdmin && <a href="/admin">Admin</a>}
 *       </nav>
 *     </header>
 *   );
 * }
 * 
 */

/**
 * =============================================================================
 * 6. FLUJO DE AUTENTICACIÓN
 * =============================================================================
 * 
 * Usuario accede a /admin
 *        ↓
 * Middleware.ts verifica pathname
 *        ↓
 * Permite que la página cargue (ProtectedRoute en cliente)
 *        ↓
 * ProtectedRoute verifica si user existe
 *        ↓
 * Si no existe: redirige a /auth/login
 * Si existe pero no es admin: redirige a /
 * Si es admin: renderiza contenido
 * 
 */

/**
 * =============================================================================
 * 7. ESTADO DE CARGA Y FLASH
 * =============================================================================
 * 
 * Durante la carga del contexto de autenticación:
 * - loading = true
 * - Se muestra un spinner
 * - Evita que se vea el contenido sin permiso por un instante (flash)
 * 
 */

/**
 * =============================================================================
 * 8. MEJORES PRÁCTICAS
 * =============================================================================
 * 
 * ✓ Siempre mostrar estado de loading
 * ✓ Usar ProtectedRoute para páginas completas
 * ✓ Usar hooks para elementos condicionales dentro de páginas públicas
 * ✓ Manejar errores de autenticación gracefully
 * ✓ Guardar la URL original para redirigir después de login
 * ✓ Auditar cambios en rutas protegidas
 * 
 */

/**
 * =============================================================================
 * 9. TROUBLESHOOTING
 * =============================================================================
 * 
 * Problema: Usuario ve la página protegida por un segundo
 * Solución: Asegúrate de mostrar loading mientras se verifica AuthContext
 * 
 * Problema: Usuario no puede acceder a su página de perfil
 * Solución: Verifica que el user exista en AuthContext (login exitoso)
 * 
 * Problema: Admin ve mensajes de no autorizado
 * Solución: Verifica que userProfile.role === 'admin' en Firestore
 * 
 */

// Fin de comentarios
