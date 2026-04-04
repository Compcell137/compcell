import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';

async function migrateServices() {
  console.log('Iniciando migración de servicios...');

  const servicesRef = collection(db, 'serviceTracking');
  const servicesSnapshot = await getDocs(servicesRef);

  const usersRef = collection(db, 'users');
  const usersSnapshot = await getDocs(usersRef);

  // Crear un mapa de email a uid
  const emailToUid = {};
  usersSnapshot.forEach(userDoc => {
    const userData = userDoc.data();
    if (userData.email) {
      emailToUid[userData.email] = userDoc.id; // uid
    }
  });

  let updatedCount = 0;

  for (const serviceDoc of servicesSnapshot.docs) {
    const serviceData = serviceDoc.data();
    const currentUserId = serviceData.userId;

    // Si userId parece ser un email (contiene @), actualizar a uid
    if (currentUserId && currentUserId.includes('@')) {
      const correctUid = emailToUid[currentUserId];
      if (correctUid && correctUid !== currentUserId) {
        await updateDoc(doc(db, 'serviceTracking', serviceDoc.id), {
          userId: correctUid
        });
        updatedCount++;
        console.log(`Actualizado servicio ${serviceDoc.id}: ${currentUserId} -> ${correctUid}`);
      }
    }
    // Si userId no es un uid válido, intentar encontrar por email si existe
    // Pero como no hay email en servicios antiguos, quizás no.
  }

  console.log(`Migración completada. ${updatedCount} servicios actualizados.`);
}

// Ejecutar la migración
migrateServices().catch(console.error);