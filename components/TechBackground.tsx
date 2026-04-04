"use client";

export default function TechBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Fondo base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-900"></div>

      {/* Grid animado */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(168, 85, 247, 0.5)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Líneas de circuitos animadas */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Línea 1 */}
        <path
          d="M 0 100 Q 250 50 500 150 T 1000 100"
          stroke="url(#gradientLine1)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
        />
        {/* Línea 2 */}
        <path
          d="M 1000 200 Q 750 250 500 200 T 0 300"
          stroke="url(#gradientLine2)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
        {/* Línea 3 */}
        <path
          d="M 200 400 L 500 300 L 800 450 L 1000 350"
          stroke="url(#gradientLine3)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
          style={{ animationDelay: '1s' }}
        />

        <defs>
          <linearGradient id="gradientLine1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.8)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
          </linearGradient>
          <linearGradient id="gradientLine2" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.8)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
          </linearGradient>
          <linearGradient id="gradientLine3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.8)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.2)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Puntos/Nodos interconectados */}
      <div className="absolute inset-0">
        {/* Nodo 1 */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-purple-500 rounded-full blur-sm animate-pulse shadow-lg shadow-purple-500/50"></div>
        
        {/* Nodo 2 */}
        <div className="absolute top-40 right-32 w-2 h-2 bg-blue-500 rounded-full blur-sm animate-pulse shadow-lg shadow-blue-500/50" style={{ animationDelay: '0.3s' }}></div>
        
        {/* Nodo 3 */}
        <div className="absolute bottom-32 left-40 w-3 h-3 bg-green-500 rounded-full blur-sm animate-pulse shadow-lg shadow-green-500/50" style={{ animationDelay: '0.6s' }}></div>
        
        {/* Nodo 4 */}
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-amber-500 rounded-full blur-sm animate-pulse shadow-lg shadow-amber-500/50" style={{ animationDelay: '0.9s' }}></div>
        
        {/* Nodo 5 */}
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-pink-500 rounded-full blur-sm animate-pulse shadow-lg shadow-pink-500/50" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Orbs flotantes con blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-green-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>

      {/* Líneas de luz flotantes diagonales */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent animate-pulse" style={{ left: '25%', animationDelay: '0.2s' }}></div>
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-purple-500/30 to-transparent animate-pulse" style={{ left: '50%', animationDelay: '0.4s' }}></div>
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-pink-500/30 to-transparent animate-pulse" style={{ left: '75%', animationDelay: '0.6s' }}></div>
    </div>
  );
}
