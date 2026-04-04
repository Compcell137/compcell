"use client";

import { useEffect, useState } from 'react';
import styles from './SplashScreen.module.css';

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Tiempo total: mostrar 2500ms, luego animación de salida 1200ms
    const t = setTimeout(() => setHidden(true), 2500);
    const t2 = setTimeout(() => onFinish && onFinish(), 3700);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [onFinish]);

  // usar la ruta pública estática
  const src = '/logo.png';

  return (
    <div className={`${styles.wrapper} ${hidden ? styles.hide : ''}`}>
      {/* Atmospheric Glow */}
      <div className={styles.atmosphericGlow}></div>
      {/* Lightning bolts */}
      <div className={styles.lightningBolt1}></div>
      <div className={styles.lightningBolt2}></div>
      <div className={styles.lightningBolt3}></div>
      {/* Lens flare */}
      <div className={styles.lensFlare}></div>
      <div className={styles.center}>
        <div className={styles.logoContainer}>
          <img src={src} alt="CompCell Logo" className={styles.logo} />
          {/* Light sweep */}
          <div className={styles.lightSweep}></div>
        </div>
      </div>
    </div>
  );
}
