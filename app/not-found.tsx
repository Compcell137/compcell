// Archivo para manejar rutas no encontradas en Next.js App Router
export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <h2 style={{ color: '#dc2626', fontSize: 24, marginBottom: 16 }}>Página no encontrada</h2>
      <p style={{ color: '#334155' }}>La ruta que buscas no existe.</p>
      <a href="/" style={{ marginTop: 24, color: '#2563eb', textDecoration: 'underline' }}>Volver al inicio</a>
    </div>
  );
}
