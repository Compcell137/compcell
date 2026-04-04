"use client";

import { useState } from "react";

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const phoneNumber = "51931765538";
  const message = encodeURIComponent("¡Hola CompCell! 👋 Quiero solicitar una consulta sobre sus productos y servicios.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 left-8 z-40"
      title="Contactar por WhatsApp"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-center gap-3 transition-all duration-300 ${isHovered ? "scale-110" : "scale-100"}`}>
        {/* Logo WhatsApp imagen - sin fondo verde */}
        <img
          src="/logo_whatsaap.png"
          alt="WhatsApp"
          className="w-20 h-20 object-contain drop-shadow-lg cursor-pointer hover:drop-shadow-[0_0_20px_rgba(37,211,102,0.8)] transition-all duration-300"
        />

        {/* Texto que aparece al pasar el mouse */}
        {isHovered && (
          <div className="bg-gradient-to-r from-[#25D366] to-[#20BA5A] text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap text-sm font-bold animate-fadeIn">
            Contáctanos
          </div>
        )}
      </div>

      {/* Animaciones */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </a>
  );
}
