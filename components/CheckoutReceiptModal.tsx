"use client";

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CheckoutReceiptModalProps {
  order: {
    id: string;
    nombre: string;
    dni: string;
    celular: string;
    email: string;
    direccion: string;
    ciudad: string;
    agencia: string;
    sucursal: string;
    metodoPago: string;
    total: number;
    items: Array<{ id: string; name: string; price: number; quantity: number; imageUrl?: string }>;
    createdAt?: Date | null;
  };
  onClose: () => void;
}

export default function CheckoutReceiptModal({ order, onClose }: CheckoutReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

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
      const margin = 8;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;
      const imgWidth = (canvas.width > 0) ? Math.min(maxWidth, (canvas.width * maxHeight) / canvas.height) : maxWidth;
      const computedHeight = (canvas.height * imgWidth) / canvas.width;
      const scale = computedHeight > maxHeight ? maxHeight / computedHeight : 1;
      const finalWidth = imgWidth * scale;
      const finalHeight = computedHeight * scale;
      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      pdf.save(`comprobante-${order.id}.pdf`);
    } catch (err) {
      alert('Error al descargar PDF.');
    }
  };

  const fecha = order.createdAt instanceof Date 
    ? order.createdAt.toLocaleString('es-PE')
    : new Date().toLocaleString('es-PE');

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="bg-black/95 border-2 border-amber-400 rounded-lg w-full max-w-md flex flex-col max-h-[90vh]" style={{ zIndex: 10000 }}>
        <div className="overflow-y-auto flex-1">
          <div ref={receiptRef} className="p-6 bg-white text-gray-900 space-y-4">
            <div className="text-center border-b-2 border-blue-500 pb-4">
              <div className="flex justify-center items-center gap-2 mb-3">
                <img src="/logo.png" alt="CompCell" className="w-12 h-12 object-contain" />
                <h1 className="text-2xl font-black text-blue-600">COMPCELL</h1>
              </div>
              <p className="text-xs text-gray-600">Tecnología & Servicio Profesional</p>
            </div>
            <div className="text-center bg-blue-100 border border-blue-400 rounded p-2">
              <h2 className="text-sm font-bold text-blue-800">COMPROBANTE DE VENTA</h2>
              <p className="text-xs text-gray-600 font-mono">Orden: {order.id}</p>
            </div>
            <div className="bg-gray-50 border border-gray-300 rounded p-3 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-600 font-semibold">Fecha:</span><span className="text-gray-800 font-mono text-xs">{fecha}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-semibold">Cliente:</span><span className="text-gray-800 text-xs break-words" style={{wordBreak:'break-word',whiteSpace:'pre-line'}}>{order.nombre}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-semibold">DNI:</span><span className="text-blue-700 font-bold uppercase text-xs">{order.dni}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-semibold">Celular:</span><span className="text-blue-700 font-bold uppercase text-xs">{order.celular}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-semibold">Email:</span><span className="text-blue-700 font-bold uppercase text-xs">{order.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-semibold">Dirección:</span><span className="text-blue-700 font-bold uppercase text-xs break-words" style={{wordBreak:'break-word',whiteSpace:'pre-line'}}>{order.direccion}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-semibold">Ciudad:</span><span className="text-blue-700 font-bold uppercase text-xs">{order.ciudad}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-semibold">Agencia:</span><span className="text-blue-700 font-bold uppercase text-xs">{order.agencia}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-semibold">Sucursal:</span><span className="text-blue-700 font-bold uppercase text-xs">{order.sucursal}</span></div>
              <div className="flex justify-between"><span className="text-gray-600 font-semibold">Método:</span><span className="text-blue-700 font-bold uppercase text-xs">{order.metodoPago}</span></div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-blue-700 mb-2">DETALLES DE COMPRA:</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {order.items.map((i) => (
                  <div key={i.id} className="bg-gray-50 border border-gray-300 rounded p-2">
                    <div className="text-xs break-words whitespace-pre-line">
                      <p className="font-semibold text-gray-900 mb-1" style={{wordBreak:'break-word',whiteSpace:'pre-line'}}>{i.name}</p>
                      <div className="space-y-1 text-gray-700">
                        <p style={{wordBreak:'break-word',whiteSpace:'pre-line'}}>Cantidad: <span className="text-blue-700 font-bold">{i.quantity}</span></p>
                        <p style={{wordBreak:'break-word',whiteSpace:'pre-line'}}>Unitario: <span className="text-blue-700">S/. {Number(i.price).toFixed(2)}</span></p>
                        <p className="border-t border-gray-300 pt-1" style={{wordBreak:'break-word',whiteSpace:'pre-line'}}><span className="text-blue-700 font-bold">S/. {(i.price * i.quantity).toFixed(2)}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 border-2 border-blue-500 p-4 rounded text-center">
              <p className="text-xs text-gray-600 mb-2 font-semibold">TOTAL A PAGAR</p>
              <p className="text-3xl font-black text-blue-700">
                S/. {Number(order.total && order.total > 0 ? order.total : order.items.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0)).toFixed(2)}
              </p>
            </div>
            <div className="text-center text-xs text-gray-600 space-y-1 border-t border-gray-300 pt-3">
              <p className="text-green-600 font-bold">✓ Compra confirmada y registrada</p>
              <p>Conserve este comprobante por 30 días</p>
              <p className="text-blue-700 font-semibold">compcellperu@gmail.com</p>
              <p className="text-gray-500 mt-2">Jr. F. Pizarro 137 - Trujillo</p>
            </div>
          </div>
        </div>
        <div className="bg-black border-t-2 border-amber-400 p-4 flex gap-2">
          <button onClick={downloadPDF} className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-lg font-bold hover:shadow-lg transition-all text-sm">📥 Descargar PDF</button>
          <button onClick={onClose} className="px-4 py-3 bg-red-500/20 text-red-300 rounded-lg font-bold hover:bg-red-500/40 transition-all text-sm">✕</button>
        </div>
      </div>
    </div>
  );
}
