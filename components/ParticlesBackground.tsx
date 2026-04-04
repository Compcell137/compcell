"use client";

import { useEffect } from 'react';

export default function ParticlesBackground() {
  useEffect(() => {
    const particlesContainer = document.querySelector('.particles-bg');
    if (!particlesContainer) return;

    // Crear partículas
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 10 + 's';
      particlesContainer.appendChild(particle);
    }

    return () => {
      // Limpiar partículas al desmontar
      while (particlesContainer.firstChild) {
        particlesContainer.removeChild(particlesContainer.firstChild);
      }
    };
  }, []);

  return <div className="particles-bg" />;
}