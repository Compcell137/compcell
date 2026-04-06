"use client";

import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import Breadcrumb from './Breadcrumb';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isGuest } = useAuth();
  const pathname = usePathname();
  const [hideWhatsApp, setHideWhatsApp] = useState(false);
  const [hideLayoutParts, setHideLayoutParts] = useState(false);

  useEffect(() => {
    // Fallback robusto: usa usePathname() cuando esté disponible, si no usa window.location
    const p = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
    setHideWhatsApp(p.startsWith('/auth') || p.startsWith('/admin'));
    setHideLayoutParts(p.startsWith('/auth'));
  }, [pathname]);

  return (
    <>
      {!hideLayoutParts && <Navbar />}
      {!hideLayoutParts && <Breadcrumb />}
      <main>
        {children}
      </main>
      {!hideLayoutParts && <Footer />}
      {!hideLayoutParts && !hideWhatsApp && <WhatsAppButton />}
    </>
  );
}