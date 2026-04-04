# 📚 Ejemplos de Protección de Rutas en CompCell

## Ejemplo 1: Página de Admin Protegida

```tsx
// app/admin/page.tsx
"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

---

## Ejemplo 2: Página de Usuario Protegida

```tsx
// app/profile/page.tsx
"use client";

import ProtectedRoute from '@/components/ProtectedRoute';

function ProfileContent() {
  // Este contenido solo se ve si el usuario está autenticado
  return (
    <div className="p-8">
      <h1>Mi Perfil</h1>
      {/* Formulario de perfil */}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
```

---

## Ejemplo 3: Componente con Elementos Condicionales

```tsx
// components/Navbar.tsx
"use client";

import { useIsAdmin } from '@/hooks/useRouteProtection';
import Link from 'next/link';

export function Navbar() {
  const { isAdmin, loading } = useIsAdmin();

  return (
    <nav className="flex gap-4">
      <Link href="/products">Productos</Link>
      
      {/* Solo mostrar si es admin y no está cargando */}
      {!loading && isAdmin && (
        <Link href="/admin" className="text-red-500">
          📊 Panel Admin
        </Link>
      )}
    </nav>
  );
}
```

---

## Ejemplo 4: Botón Condicional en Checkout

```tsx
// components/CheckoutButton.tsx
"use client";

import { useIsAuthenticated } from '@/hooks/useRouteProtection';
import Link from 'next/link';

export function CheckoutButton() {
  const { isAuthenticated, loading } = useIsAuthenticated();

  if (loading) {
    return <button disabled className="opacity-50">Cargando...</button>;
  }

  if (!isAuthenticated) {
    return (
      <Link href="/auth/login" className="btn-primary">
        Iniciar sesión para comprar
      </Link>
    );
  }

  return (
    <button className="btn-primary">
      Ir a Pagar
    </button>
  );
}
```

---

## Ejemplo 5: Formulario Solo para Vendedores

```tsx
// components/AddProductForm.tsx
"use client";

import { useIsVendor } from '@/hooks/useRouteProtection';
import AccessDenied from './AccessDenied';
import { useState } from 'react';

export function AddProductForm() {
  const { isVendor, loading } = useIsVendor();
  const [formData, setFormData] = useState({});

  if (loading) {
    return <div>Verificando permisos...</div>;
  }

  if (!isVendor) {
    return (
      <AccessDenied 
        title="Solo para Vendedores"
        message="Necesitas ser vendedor para agregar productos"
      />
    );
  }

  return (
    <form className="space-y-4">
      <input type="text" placeholder="Nombre del producto" />
      <input type="number" placeholder="Precio" />
      <button type="submit">Agregar Producto</button>
    </form>
  );
}
```

---

## Ejemplo 6: Protección Genérica con Redirección

```tsx
// app/tickets/page.tsx
"use client";

import { useRouteProtection } from '@/hooks/useRouteProtection';
import LoadingSpinner from '@/components/LoadingSpinner';

function TicketsContent() {
  return (
    <div className="p-8">
      <h1>Mis Tickets de Soporte</h1>
      {/* Contenido de tickets */}
    </div>
  );
}

export default function TicketsPage() {
  const { isAuthorized, loading } = useRouteProtection({
    requireAdmin: false, // Solo requiere estar logueado
    redirectTo: '/auth/login'
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthorized) {
    // Esto generalmente no se muestra porque redirige automáticamente
    return <div>Acceso denegado</div>;
  }

  return <TicketsContent />;
}
```

---

## Ejemplo 7: Header con Menú Dinámico

```tsx
// components/Header.tsx
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useRouteProtection';
import Link from 'next/link';

export function Header() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  
  const loading = authLoading || adminLoading;

  if (loading) {
    return <header className="skeleton h-16" />;
  }

  return (
    <header className="bg-blue-900 p-4">
      <nav className="flex gap-6">
        <Link href="/">Home</Link>
        <Link href="/products">Products</Link>
        
        {user && (
          <>
            <Link href="/profile">Mi Perfil</Link>
            <Link href="/orders">Mis Pedidos</Link>
          </>
        )}
        
        {isAdmin && (
          <Link href="/admin" className="text-yellow-300 font-bold">
            ⚙️ Admin
          </Link>
        )}
        
        {!user && (
          <Link href="/auth/login">Iniciar Sesión</Link>
        )}
      </nav>
    </header>
  );
}
```

---

## Ejemplo 8: Modal Solo para Logueados

```tsx
// components/ShareProductModal.tsx
"use client";

import { useIsAuthenticated } from '@/hooks/useRouteProtection';
import { useState } from 'react';

export function ShareProductModal({ product }) {
  const { isAuthenticated } = useIsAuthenticated();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <button 
        onClick={() => alert('Debes iniciar sesión para compartir')}
        className="btn"
      >
        Compartir
      </button>
    );
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Compartir</button>
      {isOpen && (
        <div className="modal">
          <p>Compartir: {product.name}</p>
          <input type="text" value={window.location.href} readOnly />
          <button onClick={() => setIsOpen(false)}>Cerrar</button>
        </div>
      )}
    </>
  );
}
```

---

## Ejemplo 9: Ruta Protegida con Validación Personalizada

```tsx
// app/vendor-dashboard/page.tsx
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AccessDenied from '@/components/AccessDenied';

export default function VendorDashboard() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();
  const isVendor = userProfile?.role === 'vendor' || userProfile?.role === 'admin';

  useEffect(() => {
    if (!loading && !isVendor) {
      router.push('/');
    }
  }, [isVendor, loading, router]);

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  if (!isVendor) {
    return (
      <AccessDenied 
        title="Acceso de Vendedor Requerido"
        message="Esta página solo está disponible para vendedores"
      />
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Panel de Vendedor</h1>
      {/* Contenido de vendedor */}
    </div>
  );
}
```

---

## Ejemplo 10: Hook Personalizado para Lógica Específica

```tsx
// hooks/useOrderGuard.ts
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useOrderGuard() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/orders');
    }
  }, [user, loading, router]);

  return {
    canViewOrders: !!user,
    user,
    userProfile,
    loading
  };
}

// Uso:
// "use client";
// import { useOrderGuard } from '@/hooks/useOrderGuard';
// 
// export default function OrdersPage() {
//   const { canViewOrders, loading } = useOrderGuard();
//   
//   if (loading) return <Spinner />;
//   if (!canViewOrders) return null; // redirige automáticamente
//   
//   return <Orders />;
// }
```

---

## Flujo de Autenticación Completo

```
Usuario accede a /admin
        ↓
middleware.ts verifica el pathname
        ↓
Permite que la página cargue (Next.js renderiza)
        ↓
ProtectedRoute en cliente se monta
        ↓
ProtectedRoute verifica AuthContext
        
  • Si loading: muestra spinner
  • Si no user: redirige a /auth/login
  • Si user pero no admin: redirige a /
  • Si admin: renderiza el contenido
```
