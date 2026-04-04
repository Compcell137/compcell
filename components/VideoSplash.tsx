"use client";

import { useEffect, useRef } from 'react';

export default function VideoSplash({ src = '/logo_presentacion.mp4', onEnd }: { src?: string; onEnd?: () => void }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => {});
    const handleEnded = () => {
      if (onEnd) onEnd();
    };
    v.addEventListener('ended', handleEnded);
    return () => v.removeEventListener('ended', handleEnded);
  }, [onEnd]);

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black">
      <video ref={ref} className="w-full h-full object-cover" src={src} muted playsInline />
    </div>
  );
}
