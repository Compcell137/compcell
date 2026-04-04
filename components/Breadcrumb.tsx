"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const breadcrumbMap: Record<string, string> = {
  '/products': 'Productos',
  '/service': 'Servicios',
  '/orders': 'Mis Pedidos',
  '/admin': 'Administrador',
  '/categories': 'Categorías',
};

export default function Breadcrumb() {
  const pathname = usePathname();

  // No mostrar breadcrumbs en páginas de auth o admin
  if (!pathname || pathname.startsWith('/auth') || pathname === '/') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Inicio', href: '/' }];

  let currentPath = '';
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = breadcrumbMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, href: currentPath });
  });

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border-b border-blue-400/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-blue-400/50" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-blue-400 font-semibold">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
