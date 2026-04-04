"use client";

import { useEffect, useState } from 'react';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState('🟡 Iniciando prueba...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('🧪 Iniciando prueba de Firebase');
    
    const testFirebase = async () => {
      try {
        addLog('1. Importando módulos...');
        // Importar dinámicamente para evitar errores en build
        const { db } = await import('@/lib/firebase');
        const { collection, addDoc, getDocs } = await import('firebase/firestore');
        
        addLog('2. Intentando escribir en Firestore...');
        const docRef = await addDoc(collection(db, 'connection_test'), {
          message: 'Prueba desde CompCell',
          timestamp: new Date().toISOString(),
          status: 'success'
        });
        
        addLog(`✅ Documento creado: ${docRef.id}`);
        
        addLog('3. Intentando leer documentos...');
        const snapshot = await getDocs(collection(db, 'connection_test'));
        addLog(`✅ ${snapshot.size} documentos encontrados`);
        
        setStatus('✅ ¡FIREBASE FUNCIONA PERFECTAMENTE!');
        addLog('🎉 Prueba completada con éxito');
        
      } catch (error: any) {
        addLog(`❌ ERROR: ${error.message}`);
        addLog(`Código: ${error.code}`);
        setStatus('❌ Error conectando a Firebase');
        
        // Mostrar ayuda según el error
        if (error.code === 'permission-denied') {
          addLog('💡 SOLUCIÓN: Cambia las reglas de Firestore a modo de prueba');
          addLog('💡 Ve a Firebase Console → Firestore → Reglas');
          addLog('💡 Cambia a: allow read, write: if true;');
        }
      }
    };

    testFirebase();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header simple */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🔥 Firebase Live Test</h1>
          <div className="text-sm bg-gray-700 px-3 py-1 rounded">
            Proyecto: compcell-b9e65
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Status Card */}
          <div className="mb-8">
            <div className={`p-6 rounded-2xl ${
              status.includes('✅') ? 'bg-green-900/30 border-green-700' :
              status.includes('❌') ? 'bg-red-900/30 border-red-700' :
              'bg-blue-900/30 border-blue-700'
            } border-2`}>
              <div className="flex items-center">
                <div className="text-4xl mr-4">
                  {status.includes('✅') ? '✅' : status.includes('❌') ? '❌' : '🔄'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Estado de Conexión</h2>
                  <p className="text-xl">{status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logs en tiempo real */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden mb-8">
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
              <h3 className="text-xl font-bold">📊 Logs en Tiempo Real</h3>
              <p className="text-gray-400 text-sm">Abre también la consola del navegador (F12)</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500 italic">Esperando logs...</div>
                ) : (
                  logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded ${
                        log.includes('✅') ? 'bg-green-900/20 text-green-300' :
                        log.includes('❌') ? 'bg-red-900/20 text-red-300' :
                        log.includes('💡') ? 'bg-yellow-900/20 text-yellow-300' :
                        'bg-gray-800/50'
                      }`}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Información del proyecto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <h4 className="font-bold text-lg mb-3">📁 Proyecto Firebase</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-400 text-sm">Project ID</p>
                  <p className="font-mono">compcell-b9e65</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Database</p>
                  <p className="font-mono">Firestore</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <h4 className="font-bold text-lg mb-3">🔗 URLs</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-400 text-sm">Auth Domain</p>
                  <p className="font-mono text-sm">compcell-b9e65.firebaseapp.com</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Storage</p>
                  <p className="font-mono text-sm">compcell-b9e65.firebasestorage.app</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <h4 className="font-bold text-lg mb-3">⚡ Acciones</h4>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
                >
                  🔄 Reiniciar Prueba
                </button>
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold text-center transition"
                >
                  📊 Ir a Firebase Console
                </a>
              </div>
            </div>
          </div>

          {/* Mensaje final */}
          <div className="text-center text-gray-400">
            <p>💡 Si todo funciona, ya puedes implementar el CRUD de productos y el sistema de tickets</p>
            <p className="mt-2">
              <a href="/" className="text-blue-400 hover:text-blue-300 underline">
                ← Volver a la página principal de CompCell
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}