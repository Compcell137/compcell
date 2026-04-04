import { db, storage } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function addProduct(product: any) {
  console.log('Intentando guardar producto:', product);
  let imageUrl = '';
  try {
    if (product.image) {
      console.log('Subiendo imagen...', product.image.name, 'tipo:', product.image.type, 'tamaño:', product.image.size);
      const imageRef = ref(storage, `productos/${Date.now()}_${product.image.name}`);
      await uploadBytes(imageRef, product.image);
      imageUrl = await getDownloadURL(imageRef);
      console.log('Imagen subida exitosamente:', imageUrl);
    }
    console.log('Guardando en Firestore...');
    const docRef = await addDoc(collection(db, 'products'), {
      name: product.name,
      category: product.category,
      price: Number(product.price),
      stock: Number(product.stock),
      status: product.status,
      imageUrl,
    });
    console.log('Producto guardado con ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error detallado al guardar producto:', error);
    console.error('Código de error:', error.code);
    console.error('Mensaje:', error.message);
    throw new Error(error?.message || 'Error al guardar el producto.');
  }
}

export async function updateProduct(id: string, product: any) {
  let imageUrl = product.imageUrl || '';
  if (product.image && typeof product.image !== 'string') {
    const imageRef = ref(storage, `productos/${Date.now()}_${product.image.name}`);
    await uploadBytes(imageRef, product.image);
    imageUrl = await getDownloadURL(imageRef);
  }
  await updateDoc(doc(db, 'products', id), {
    name: product.name,
    category: product.category,
    price: Number(product.price),
    stock: Number(product.stock),
    status: product.status,
    imageUrl,
  });
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, 'products', id));
}
