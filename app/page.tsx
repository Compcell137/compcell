"use client";

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import ParticlesBackground from '../components/ParticlesBackground';
import TechBackground from '../components/TechBackground';
import OffersCarousel from '../components/OffersCarousel';
import OffersCarouselMobile from '../components/OffersCarouselMobile';
import FlashSalesCarousel from '../components/FlashSalesCarousel';
import SpecialOffersCarousel from '../components/SpecialOffersCarousel';
import { useAuth } from '../contexts/AuthContext';
import { fetchCategoriesWithProductCount, Category } from './categories/firebase-categories';
import { fetchActiveFlashSales, FlashSale } from './offers/firebase-offers';
import CategoriesCarousel from '../components/CategoriesCarousel';
import BrandsSection from '../components/BrandsSection';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loadingFlashSales, setLoadingFlashSales] = useState(true);
  const [quickActionImages, setQuickActionImages] = useState<string[]>(['', '', '', '']);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const { user, isGuest, setGuestMode, userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  const router = useRouter();

  useEffect(() => {
    fetchCategoriesWithProductCount()
      .then(data => {
        setCategories(data);
        setLoadingCategories(false);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setLoadingCategories(false);
      });
  }, []);

  useEffect(() => {
    fetchActiveFlashSales()
      .then(data => {
        setFlashSales(data);
        setLoadingFlashSales(false);
      })
      .catch(err => {
        console.error('Error fetching flash sales:', err);
        setLoadingFlashSales(false);
      });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('quickActionImages');
    if (saved) {
      setQuickActionImages(JSON.parse(saved));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
    setLoading(false);
  };

  const handleImageUpload = async (index: number, file: File) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const storageRef = ref(storage, `quick-actions/${index}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      const newImages = [...quickActionImages];
      newImages[index] = downloadURL;
      setQuickActionImages(newImages);
      localStorage.setItem('quickActionImages', JSON.stringify(newImages));
      alert('Imagen subida correctamente');
    } catch (error) {
      alert('Error al subir la imagen');
      console.error(error);
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <TechBackground />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5"></div>
      {/* Carrusel como Hero Principal - Responsive */}
      {/* Solo móvil */}
      <div className="block sm:hidden">
        <OffersCarouselMobile />
      </div>
      {/* Solo tablets, laptops y monitores */}
      <div className="hidden sm:block">
        <OffersCarousel />
      </div>
      {/* Carrusel de Categorías */}
      <div className="mb-8 sm:mb-12 md:mb-16 animate-fade-in-up animation-delay-1000 px-2 sm:px-4 md:px-8">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400 mb-2">Categorías Disponibles</h2>
          <p className="text-gray-400 text-sm md:text-base">Explora todos nuestros productos por categoría</p>
        </div>
        <CategoriesCarousel categories={categories} loading={loadingCategories} />
      </div>
      {/* Carrusel de Ofertas Especiales */}
      <div className="mb-8 sm:mb-12 md:mb-16 animate-fade-in-up animation-delay-900 px-2 sm:px-4 md:px-8">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-400 mb-2">Ofertas Especiales</h2>
          <p className="text-gray-400 text-sm md:text-base">Descubre nuestras ofertas destacadas</p>
        </div>
        <SpecialOffersCarousel sales={flashSales} loading={loadingFlashSales} isAdmin={isAdmin} />
      </div>
      {/* Sección Mejorada: ¿Necesitas Servicio Técnico? */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center mb-6 sm:mb-8 md:mb-12 animate-fade-in-up animation-delay-1100 px-2 sm:px-4 md:px-8">
        {/* León centrado arriba en móvil, izquierda en laptop, con glow */}
        <div className="flex justify-center md:justify-end w-full md:w-auto mb-4 md:mb-0 md:mr-8 relative">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-blue-500/30 via-cyan-400/20 to-blue-300/10 blur-2xl opacity-80 animate-pulse-slow z-0"></span>
          <img
            src="/leon_servicio.jpg"
            alt="León Servicio Técnico"
            className="h-32 w-auto sm:h-40 md:h-56 object-contain animate-bounce-slow relative z-10"
            style={{ minWidth: '90px' }}
          />
        </div>
        {/* Card de contenido */}
        <div className="w-full md:w-auto max-w-xl bg-gradient-to-br from-blue-900/80 via-cyan-900/70 to-blue-800/80 rounded-2xl shadow-xl border border-blue-500/30 px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 flex flex-col items-center md:items-start gap-2 sm:gap-3 md:gap-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-200 bg-clip-text text-transparent font-gaming drop-shadow-xl tracking-wide animate-pulse-slow text-center md:text-left leading-tight">
            ¿Necesitas Servicio Técnico?
          </h2>
          <p className="text-gray-100 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-center md:text-left">
            ¡Déjanos tu equipo y despreocúpate! Diagnósticos, atención personalizada, repuestos originales y garantía real.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4 items-center md:items-start justify-center md:justify-start w-full">
            <span className="flex items-center gap-1 text-blue-200 text-xs sm:text-sm md:text-base bg-blue-800/40 px-2 sm:px-3 py-1 rounded-lg"><span>📞</span> 931 765 538</span>
            <span className="flex items-center gap-1 text-blue-200 text-xs sm:text-sm md:text-base bg-blue-800/40 px-2 sm:px-3 py-1 rounded-lg"><span>📧</span> comcellperu@gmail.com</span>
            <span className="flex items-center gap-1 text-blue-200 text-xs sm:text-sm md:text-base bg-blue-800/40 px-2 sm:px-3 py-1 rounded-lg"><span>📍</span> Trujillo, Jr.F. Pizarro 137 - Local 101-108</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4 mt-2 w-full justify-center md:justify-start">
            <a
              href="https://wa.me/51931765538?text=Hola,%20quiero%20solicitar%20un%20servicio%20técnico%20para%20mi%20equipo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base shadow-lg hover:scale-105 hover:shadow-green-400/40 transition-all duration-300 flex items-center gap-2 justify-center min-h-[44px]"
            >
              <span>💬</span> WhatsApp 
            </a>
            <a
              href="tel:+51931765338"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base shadow-lg hover:scale-105 hover:shadow-blue-400/40 transition-all duration-300 flex items-center gap-2 justify-center min-h-[44px] block md:hidden"
            >
              <span>📞</span> Llamar Ahora
            </a>
            <Link
              href="/service"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base shadow-lg hover:scale-105 hover:shadow-cyan-400/40 transition-all duration-300 flex items-center gap-2 justify-center min-h-[44px]"
            >
              <span>🛠️</span>Ver Servicios
            </Link>
          </div>
        </div>
      </div>
      {/* Sección de Marcas */}
      <BrandsSection />
      {/* Resto del contenido */}
      {/* Se eliminó la sección 'CompCell en Números' y CTA de ayuda */}
     </div>
  );
}
