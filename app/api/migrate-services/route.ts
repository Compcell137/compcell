import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('Iniciando migración de servicios...');

    const servicesRef = collection(db, 'serviceTracking');
    const servicesSnapshot = await getDocs(servicesRef);

    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    // Crear un mapa de uid a email
    const uidToEmail: { [uid: string]: string } = {};
    usersSnapshot.forEach(userDoc => {
      const userData = userDoc.data();
      if (userData.email) {
        uidToEmail[userDoc.id] = userData.email; // uid -> email
      }
    });

    let updatedCount = 0;

    console.log('Usuarios encontrados:');
    Object.keys(uidToEmail).forEach(uid => {
      console.log(`${uid} -> ${uidToEmail[uid]}`);
    });

    console.log('Servicios encontrados:');
    for (const serviceDoc of servicesSnapshot.docs) {
      const serviceData = serviceDoc.data();
      const currentUserId = serviceData.userId;
      console.log(`Servicio ${serviceDoc.id}: userId = ${currentUserId}`);

      // Si userId es un UID, cambiar a email
      if (currentUserId && uidToEmail[currentUserId]) {
        const email = uidToEmail[currentUserId];
        await updateDoc(doc(db, 'serviceTracking', serviceDoc.id), {
          userId: email
        });
        updatedCount++;
        console.log(`Actualizado servicio ${serviceDoc.id}: ${currentUserId} -> ${email}`);
      } else {
        console.log(`userId ${currentUserId} no encontrado en usuarios o ya es email`);
      }
    }

    console.log(`Migración completada. ${updatedCount} servicios actualizados.`);

    return NextResponse.json({
      success: true,
      message: `Migración completada. ${updatedCount} servicios actualizados.`
    });
  } catch (error) {
    console.error('Error en migración:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}