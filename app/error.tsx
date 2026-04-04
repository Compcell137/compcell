"use client";
// Archivo de error global para Next.js App Router
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <h2 style={{ color: '#dc2626', fontSize: 24, marginBottom: 16 }}>¡Ocurrió un error!</h2>
      <p style={{ color: '#334155', marginBottom: 24 }}>{error.message || 'Algo salió mal.'}</p>
      <button onClick={reset} style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: 4, border: 'none', cursor: 'pointer' }}>
        Reintentar
      </button>
    </div>
  );
}
