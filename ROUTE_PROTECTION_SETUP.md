# 🔒 Sistema de Protección de Rutas - CompCell

## ✅ Implementación Completada

Se ha implementado un sistema completo de protección de rutas en tu proyecto. Aquí está lo que se creó:

---

## 📁 Archivos Creados/Modificados

### `middleware.ts` (Raíz del proyecto)
- Middleware de Next.js que se ejecuta en el servidor
- Define rutas públicas y protegidas
- Permite personalizar el comportamiento de acceso

### `hooks/useRouteProtection.ts`
Hooks personalizados para facilitar la protección:
- `useRouteProtection()` - Protección genérica con redirección
- `useIsAdmin()` - Verifica si es administrador
- `useIsVendor()` - Verifica si es vendor o admin
- `useIsAuthenticated()` - Verifica si está logueado

### `components/AccessDenied.tsx`
Componente visual para mostrar acceso denegado con:
- Icono de candado
- Mensajes personalizables
- Botones de acción (Ir a Inicio, Iniciar Sesión)

### `lib/route-config.ts`
Configuración centralizada de rutas:
- Rutas públicas
- Rutas protegidas
- Rutas solo para admin
- Funciones helper para verificar protección

### `docs/ROUTE_PROTECTION_GUIDE.ts`
Documentación completa con ejemplos de uso

---

## 🚀 Cómo Usar

### 1. Proteger una Página Completa

```tsx
// app/admin/page.tsx
"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminPanel />
    </ProtectedRoute>
  );
}
```

### 2. Mostrar Contenido Condicional en Páginas Públicas

```tsx
"use client";

import { useIsAdmin } from '@/hooks/useRouteProtection';

export function Navbar() {
  const { isAdmin, loading } = useIsAdmin();

  return (
    <nav>
      <a href="/products">Productos</a>
      {!loading && isAdmin && <a href="/admin">Admin</a>}
    </nav>
  );
}
```

### 3. Verificar Autenticación sin Redirigir

```tsx
"use client";

import { useIsAuthenticated } from '@/hooks/useRouteProtection';

export function CheckoutButton() {
  const { isAuthenticated, loading } = useIsAuthenticated();

  if (!loading && !isAuthenticated) {
    return <a href="/auth/login">Iniciar Sesión para Comprar</a>;
  }

  return <button>Proceder al Pago</button>;
}
```

### 4. Protección Genérica con Redirección

```tsx
"use client";

import { useRouteProtection } from '@/hooks/useRouteProtection';
import AccessDenied from '@/components/AccessDenied';

export default function ProfilePage() {
  const { isAuthorized, loading } = useRouteProtection({
    requireAdmin: false, // requiere cualquier usuario
    redirectTo: '/auth/login'
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthorized) {
    return <AccessDenied />;
  }

  return <UserProfile />;
}
```

---

## 🔄 Flujo de Autenticación

```
Usuario accede a /admin
        ↓
Middleware verifica pathname
        ↓
ProtectedRoute en cliente verifica AuthContext
        ↓
¿Usuario existe? NO → Redirige a /auth/login
                 SÍ ↓
        ¿Es admin? NO → Redirige a /
                   SÍ ↓
                       Renderiza contenido
```

---

## 🛡️ Niveles de Protección

### Público
- No requiere autenticación
- Accesible para todos
- Ej: `/`, `/products`, `/auth/login`

### Protegido
- Requiere autenticación simple
- Cualquier usuario logueado
- Ej: `/profile`, `/orders`

### Admin Only
- Requiere ser administrador
- Acceso limitado a admins
- Ej: `/admin`

### Vendor Only
- Requiere ser vendor o admin
- Ej: `/products/add`, `/products/edit`

---

## 📋 Checklist de Implementación

- [x] Crear middleware.ts
- [x] Crear hooks de protección
- [x] Crear componente AccessDenied
- [x] Crear configuración de rutas
- [x] Documentación completa
- [ ] **Próximos pasos:**
  - [ ] Actualizar página de perfil con ProtectedRoute
  - [ ] Actualizar página de órdenes con ProtectedRoute
  - [ ] Agregar validación de email para registro
  - [ ] Implementar sesiones persistentes

---

## ⚙️ Configuración Avanzada

### Cambiar Rutas Protegidas

En `lib/route-config.ts`, modifica el objeto `ROUTE_CONFIG`:

```typescript
export const ROUTE_CONFIG = {
  public: ['/'],
  protected: ['/profile'],
  adminOnly: ['/admin'],
  vendorOrAdmin: ['/products/add'],
};
```

### Personalizar Mensaje de Acceso Denegado

```tsx
<AccessDenied 
  title="⚠️ Solo para Administradores"
  message="Necesitas permisos especiales para acceder aquí."
  showLoginButton={false}
/>
```

---

## 🐛 Troubleshooting

### Problema: Usuario ve flash de contenido antes de redirigir
**Solución**: El componente ProtectedRoute muestra un loading spinner. Es normal que haya un delay pequeño mientras se verifica el mismo AuthContext.

### Problema: Admin dice "Acceso Denegado"
**Solución**: Verifica que en Firestore, en `users/{uid}`, el campo `role` sea exactamente `'admin'`.

### Problema: useRouteProtection no redirige
**Solución**: Asegúrate de estar en una página "use client" y que AuthContext esté disponible.

---

## 📚 Resources

- [Next.js Middleware Docs](https://nextjs.org/docs/advanced-features/middleware)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [React Context API](https://react.dev/reference/react/createContext)

---

## ✨ Próximas Mejoras Recomendadas

1. **Roles Dinámicos**: Cargar roles desde Firestore
2. **Session Persistence**: Guardar sesión en localStorage/cookies
3. **Rate Limiting**: Limitar intentos de login fallidos
4. **2FA**: Autenticación de dos factores
5. **Analytics**: Tracking de accesos a rutas protegidas

