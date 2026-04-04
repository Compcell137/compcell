"use client";

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface OrderReceiptProps {
  order: {
    id: string;
    paymentMethod?: string | null;
    total: number;
    userEmail?: string | null;
    items: Array<{ id: string; name: string; price: number; quantity: number; imageUrl?: string }>;
    createdAt?: Date | null;
    comprobanteUrl?: string;
  };
  onClose: () => void;
}

export default function OrderReceipt({ order, onClose }: OrderReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [showProofModal, setShowProofModal] = useState(false);

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowHeight: receiptRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth - 10; // Márgenes de 5mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let yPosition = 0;
      let pageNum = 1;

      // Primera página
      pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight);
      
      // Si hay más contenido, agregar páginas
      if (imgHeight > pageHeight - 10) {
        let remainingHeight = imgHeight - (pageHeight - 10);
        yPosition = pageHeight - 10;

        while (remainingHeight > 0) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 5, 5 - yPosition, imgWidth, imgHeight);
          yPosition += pageHeight - 10;
          remainingHeight -= pageHeight - 10;
        }
      }

      pdf.save(`comprobante-${order.id}.pdf`);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      alert('Error al descargar PDF. Por favor intenta con Imprimir.');
    }
  };

  const printReceipt = () => {
    if (!receiptRef.current) return;
    const html = receiptRef.current.innerHTML;
    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (w) {
      w.document.write(`
        <html>
        <head>
          <title>Comprobante ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 20px; background: white }
            .receipt { max-width: 600px; margin: 0 auto }
            h1 { color: #f59e0b; text-align: center; margin-bottom: 20px }
            .header { text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 15px; margin-bottom: 15px }
            .info { margin: 10px 0; font-size: 14px }
            table { width: 100%; border-collapse: collapse; margin: 20px 0 }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left }
            th { background: #f59e0b; color: black; font-weight: bold }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 15px; border-top: 2px solid #f59e0b }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${html}
          </div>
        </body>
        </html>
      `);
      w.document.close();
      w.print();
      setTimeout(() => w.close(), 500);
    }
  };

  const fecha = order.createdAt instanceof Date 
    ? order.createdAt.toLocaleString('es-PE')
    : new Date().toLocaleString('es-PE');

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="bg-black/95 border-2 border-amber-400 rounded-lg w-full max-w-md flex flex-col max-h-[90vh]" style={{ zIndex: 10000 }}>
        {/* Scroll para el contenido */}
        <div className="overflow-y-auto flex-1">
          <div ref={receiptRef} className="p-6 bg-white text-gray-900 space-y-4">
            {/* Header con Logo Real */}
            <div className="text-center border-b-2 border-blue-500 pb-4">
              <div className="flex justify-center items-center gap-2 mb-3">
                <img src="/logo.png" alt="CompCell" className="w-12 h-12 object-contain" />
                <h1 className="text-2xl font-black text-blue-600">COMPCELL</h1>
              </div>
              <p className="text-xs text-gray-600">Tecnología & Servicio Profesional</p>
            </div>

            {/* Título */}
            <div className="text-center bg-blue-100 border border-blue-400 rounded p-2">
              <h2 className="text-sm font-bold text-blue-800">COMPROBANTE DE VENTA</h2>
              <p className="text-xs text-gray-600 font-mono">Orden: {order.id}</p>
            </div>

            {/* Datos principales */}
            <div className="bg-gray-50 border border-gray-300 rounded p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Fecha:</span>
                <span className="text-gray-800 font-mono text-xs">{fecha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Cliente:</span>
                <span className="text-gray-800 truncate text-xs">{order.userEmail || 'Cliente'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Método:</span>
                <span className="text-blue-700 font-bold uppercase text-xs">{order.paymentMethod || 'N/A'}</span>
              </div>
            </div>

            {/* Sección separada para la imagen de la prueba/captura subida por el usuario */}
            {order.comprobanteUrl && (
              <div className="mb-6 flex flex-col items-center justify-center">
                <div className="w-full border-2 border-blue-400 rounded-lg bg-blue-50 p-3 flex flex-col items-center">
                  <span className="block text-xs text-blue-700 font-bold mb-2">Prueba de pago subida por el usuario:</span>
                  <img
                    src={order.comprobanteUrl}
                    alt="Comprobante de pago"
                    className="max-h-60 rounded shadow border border-blue-300 bg-white cursor-zoom-in hover:scale-105 transition"
                    style={{ objectFit: 'contain', maxWidth: '100%' }}
                    onClick={() => setShowProofModal(true)}
                    title="Haz click para ver en grande y descargar"
                  />
                  <button
                    className="mt-2 px-4 py-1 bg-blue-600 text-white rounded font-bold text-xs hover:bg-blue-700 transition"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = order.comprobanteUrl || "";
                      link.download = `prueba_pago_${order.id}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    Descargar prueba de pago
                  </button>
                </div>
                {/* Modal para ver la imagen en grande */}
                {showProofModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShowProofModal(false)}>
                    <img
                      src={order.comprobanteUrl}
                      alt="Comprobante de pago grande"
                      className="max-h-[90vh] max-w-[90vw] rounded-lg border-4 border-blue-400 shadow-2xl bg-white"
                      style={{ objectFit: 'contain' }}
                    />
                    <button
                      className="absolute top-6 right-6 bg-red-600 text-white rounded-full p-2 text-lg font-bold shadow-lg hover:bg-red-700"
                      onClick={e => { e.stopPropagation(); setShowProofModal(false); }}
                      title="Cerrar"
                    >✕</button>
                    <a
                      href={order.comprobanteUrl}
                      download={`prueba_pago_${order.id}.jpg`}
                      className="absolute bottom-8 right-8 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-base shadow-lg hover:bg-blue-700 transition"
                      onClick={e => e.stopPropagation()}
                    >Descargar imagen</a>
                  </div>
                )}
              </div>
            )}
            {/* Productos con imágenes */}
            <div>
              <h3 className="text-xs font-bold text-blue-700 mb-2">DETALLES DE COMPRA:</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {order.items.map((i) => (
                  <div key={i.id} className="bg-gray-50 border border-gray-300 rounded p-2">
                    {/* Datos del producto */}
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-semibold text-gray-900 line-clamp-2 mb-1">{i.name}</p>
                      <div className="space-y-1 text-gray-700">
                        <p>Cantidad: <span className="text-blue-700 font-bold">{i.quantity}</span></p>
                        <p>Unitario: <span className="text-blue-700">S/. {Number(i.price).toFixed(2)}</span></p>
                        <p className="border-t border-gray-300 pt-1">
                          <span className="text-blue-700 font-bold">S/. {(i.price * i.quantity).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-blue-50 border-2 border-blue-500 p-4 rounded text-center">
              <p className="text-xs text-gray-600 mb-2 font-semibold">TOTAL A PAGAR</p>
              <p className="text-3xl font-black text-blue-700">
                S/. {Number(order.total && order.total > 0 ? order.total : order.items.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0)).toFixed(2)}
              </p>
            </div>

            {/* Pie */}
            <div className="text-center text-xs text-gray-600 space-y-1 border-t border-gray-300 pt-3">
              <p className="text-green-600 font-bold">✓ Compra confirmada y registrada</p>
              <p>Conserve este comprobante por 30 días</p>
              <p className="text-blue-700 font-semibold">compcellperu@gmail.com</p>
              <p className="text-gray-500 mt-2">Jr. F. Pizarro 137 - Trujillo</p>
            </div>
          </div>
        </div>

        {/* Botones fijos abajo */}
        <div className="bg-black border-t-2 border-amber-400 p-4 flex gap-2">
          <button
            onClick={downloadPDF}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-lg font-bold hover:shadow-lg transition-all text-sm"
          >
            📥 Descargar PDF
          </button>
          <button
            onClick={printReceipt}
            className="flex-1 px-4 py-3 border-2 border-amber-400 text-amber-200 rounded-lg font-bold hover:bg-amber-400/10 transition-all text-sm"
          >
            🖨️ Imprimir
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-red-500/20 text-red-300 rounded-lg font-bold hover:bg-red-500/40 transition-all text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
