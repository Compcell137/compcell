import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative w-full bg-black overflow-hidden mt-8 border-t border-blue-900">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8 md:gap-12">
        {/* Logo y descripción */}
        <div className="flex flex-col items-start w-full md:w-auto">
          <div className="flex items-center mb-2">
            <img src="/logo.png" alt="Compcell Logo" width={64} height={64} className="mr-2" />
            <span className="text-lg sm:text-xl font-bold text-blue-400 tracking-widest">COMPCELL</span>
          </div>
          <span className="text-blue-300 font-semibold mb-2 text-sm sm:text-base">Tecnología & Servicio</span>
          <p className="text-gray-300 text-xs sm:text-sm mb-4">Tu tienda especializada en productos tecnológicos con servicio técnico profesional.</p>
          <div className="flex gap-4">
            <a href="https://facebook.com/compcell" target="_blank" rel="noopener" aria-label="Facebook">
              <img src="/fb.webp" alt="Facebook" width={28} height={28} />
            </a>
            <a href="https://instagram.com/compcell" target="_blank" rel="noopener" aria-label="Instagram">
              <img src="/instagram.webp" alt="Instagram" width={28} height={28} />
            </a>
            <a href="https://www.tiktok.com/@compcellperu" target="_blank" rel="noopener" aria-label="TikTok">
              <img src="/tktk.webp" alt="TikTok" width={28} height={28} />
            </a>
          </div>
        </div>
        {/* Productos */}
        <div className="w-full sm:w-auto">
          <div className="text-blue-400 font-bold mb-2 text-sm sm:text-base">PRODUCTOS</div>
          <ul className="text-gray-200 text-xs sm:text-sm space-y-1"> 
            <li><a href="/categories" className="hover:text-blue-300">Categorías</a></li>
            <li><a href="/offers" className="hover:text-blue-300">Ofertas Especiales</a></li>
          </ul>
        </div>
        {/* Servicio */}
        <div className="w-full sm:w-auto">
          <div className="text-blue-400 font-bold mb-2 text-sm sm:text-base">SERVICIO</div>
          <ul className="text-gray-200 text-xs sm:text-sm space-y-1">
            <li><a href="/service" className="hover:text-blue-300">Reparación</a></li>
          </ul>
        </div>
        {/* Contacto */}
        <div className="w-full sm:w-auto">
          <div className="text-blue-400 font-bold mb-2 text-sm sm:text-base">CONTACTO</div>
          <ul className="text-gray-200 text-xs sm:text-sm space-y-2">
            <li className="flex items-center gap-2"><Phone size={16} className="text-blue-400 flex-shrink-0" /> <span>+51 931 765 538</span></li>
            <li className="flex items-center gap-2"><MapPin size={16} className="text-blue-400 flex-shrink-0" /> <span>jr F.pizarro 137, local 101-105 y 108</span></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 pb-4 border-t border-blue-900">
        <p>&copy; {new Date().getFullYear()} Compcell. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}