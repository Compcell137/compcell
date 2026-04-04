import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { CartProvider } from '../contexts/CartContext'
import { ToastProvider } from '../contexts/ToastContext'
import ClientLayout from '../components/ClientLayout'
import ToastContainer from '../components/ToastContainer'

export const metadata: Metadata = {
  title: 'CompCell - Tecnología & Servicio Técnico',
  description: 'Tienda especializada en productos tecnológicos con servicio técnico profesional',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ClientLayout>{children}</ClientLayout>
              <ToastContainer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}