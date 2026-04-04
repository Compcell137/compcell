"use client";

import Link from 'next/link';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative hero-responsive bg-black overflow-hidden flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[5%] w-[25vw] max-w-[240px] h-[25vw] max-h-[240px] bg-gradient-to-r from-blue-500/20 to-cyan-500/10 rounded-full blur-3xl opacity-18 animate-pulse hidden sm:block"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[35vw] max-w-[360px] h-[35vw] max-h-[360px] bg-gradient-to-r from-cyan-500/20 to-blue-500/10 rounded-full blur-3xl opacity-12 animate-blob hidden md:block"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-20 responsive-padding">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-block">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/40 rounded-full px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2 justify-center">
                <Zap className="w-4 h-4" />
                🚀 Tecnología & Servicio Profesional
              </span>
            </div>
          </div>

          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
                Bienvenido a CompCell
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              La tienda especializada en <span className="text-blue-400 font-bold">tecnología de vanguardia</span> con <span className="text-cyan-400 font-bold">servicio técnico profesional</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/products"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-black font-bold rounded-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Ver Productos
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/service"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gray-800/50 hover:bg-gray-800 border border-blue-400/40 text-white font-bold rounded-lg transition-all duration-300 backdrop-blur-sm text-center"
            >
              Servicios Técnicos
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 md:pt-12 max-w-4xl mx-auto">
            <div className="bg-gray-900/50 border border-blue-400/20 rounded-lg p-6 backdrop-blur-sm hover:border-blue-400/60 transition-all">
              <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">100% Confiable</h3>
              <p className="text-gray-400 text-sm">Productos auténticos garantizados</p>
            </div>
            <div className="bg-gray-900/50 border border-blue-400/20 rounded-lg p-6 backdrop-blur-sm hover:border-blue-400/60 transition-all">
              <Truck className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Envío Rápido</h3>
              <p className="text-gray-400 text-sm">Entrega en 24-48 horas</p>
            </div>
            <div className="bg-gray-900/50 border border-blue-400/20 rounded-lg p-6 backdrop-blur-sm hover:border-blue-400/60 transition-all">
              <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Soporte 24/7</h3>
              <p className="text-gray-400 text-sm">Equipo técnico disponible siempre</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="text-blue-400 flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase">Desplázate</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
