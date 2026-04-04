"use client";
import { useEffect, useState } from 'react';
import { fetchProducts } from '../products/firebase-products';
import { addProduct, updateProduct, deleteProduct } from '../products/firebase-crud';
import { fetchCategories, addCategory, updateCategory, deleteCategory, type Category } from '../categories/firebase-categories';
import { fetchUsers, updateUser, deleteUser, toggleUserStatus, changeUserRole, type UserProfile } from './firebase-users';
import { fetchOrders, subscribeOrders, updateOrder, addOrderHistoryEntry } from '../orders/firebase-orders';
import { fetchAllServices, type ServiceTracking } from '../service/firebase-service-tracking';
import { fetchAllFlashSales, createFlashSale, updateFlashSale, deleteFlashSale, updateFlashSaleImage, type FlashSale } from '../offers/firebase-offers';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import ProductForm from '../products/ProductForm';
import CategoryForm from '../categories/CategoryForm';
import BannersManager from '../../components/BannersManager';
import ServiceDetailsModal from '../../components/ServiceDetailsModal';
import ServiceCreationModal from '../../components/ServiceCreationModal';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import OrderReceipt from '../../components/OrderReceipt';
import type { Product } from '../products/firebase-products';

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);  
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [services, setServices] = useState<ServiceTracking[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({ productName: '', category: '', originalPrice: 0, salePrice: 0, stock: 0, expiresAt: '', description: '', isActive: true, imageUrl: '' });
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerImageFile, setOfferImageFile] = useState<File | null>(null);
  const [uploadingOfferImage, setUploadingOfferImage] = useState(false);
  const [adminToast, setAdminToast] = useState<string | null>(null);
  const [productModal, setProductModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceModal, setServiceModal] = useState<null | 'add' | ServiceTracking>(null);
  const [orderReceipt, setOrderReceipt] = useState<any | null>(null);
  const [roleSelection, setRoleSelection] = useState<Record<string, 'admin' | 'vendor' | 'technician' | 'user'>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
    onCancel: () => {},
    isLoading: false,
  });
  const [serviceReportsFilter, setServiceReportsFilter] = useState<'all' | 'recibido' | 'diagnostico' | 'esperando_partes' | 'en_reparacion' | 'pruebas_finales' | 'listo_para_recoger' | 'entregado' | 'cancelado'>('all');
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');

  const { userProfile, logout } = useAuth();

  // Función para obtener pestañas disponibles según el rol
  const getAvailableTabs = () => {
    if (!userProfile) return [];

    switch (userProfile.role) {
      case 'admin':
        return ['products', 'categories', 'orders', 'services', 'offers', 'banners', 'users', 'service-reports', 'analytics'];
      case 'vendor':
        return ['products', 'categories', 'orders', 'offers', 'banners'];
      case 'technician':
        return ['services', 'service-reports'];
      default:
        return [];
    }
  };

  // Función para obtener el nombre del rol en español
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'vendor': return 'Vendedor';
      case 'technician': return 'Técnico';
      case 'user': return 'Usuario';
      default: return role;
    }
  };

  const canViewTab = (tab: string) => {
    const allowed = getAvailableTabs();
    return allowed.includes(tab);
  };

  const openConfirm = (title: string, message: string, onConfirm: () => Promise<void>, onCancel: () => void = () => {}) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel,
      isLoading: false,
    });
  };

  const closeConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = async () => {
    setConfirmDialog(prev => ({ ...prev, isLoading: true }));
    try {
      await confirmDialog.onConfirm();
      closeConfirm();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeOrders((ordersData) => {
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, []);
  // Efecto para ajustar la pestaña activa cuando cambia el rol
  useEffect(() => {
    const availableTabs = getAvailableTabs();
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
    if (availableTabs.length === 0) {
      setActiveTab('services');
    }
  }, [userProfile?.role, activeTab]);
  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, usersData, _ordersData, servicesData, flashSalesData] = await Promise.all([
        fetchProducts(), fetchCategories(), fetchUsers(), fetchOrders(), fetchAllServices(), fetchAllFlashSales()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setUsers(usersData);
      setServices(servicesData);
      setFlashSales(flashSalesData);
      // Not needed: orders se actualiza por suscripción en tiempo real.
    } catch (err) {
      console.error('Error:', err);
      setError('Error cargando datos iniciales.');
    }
    setLoading(false);
  };

  const handleAddProduct = () => { setEditProduct(null); setProductModal(true); };
  const handleEditProduct = (product: Product) => { setEditProduct(product); setProductModal(true); };
  const handleDeleteProduct = async (id: string) => {
    openConfirm(
      'Eliminar Producto',
      '¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.',
      async () => {
        try {
          await deleteProduct(id);
          await loadData();
          setAdminToast('Producto eliminado correctamente');
        } catch (err) {
          setError('Error al eliminar producto');
        }
      }
    );
  };
  const handleSaveProduct = async (formData: any) => {
    setSaving(true);
    try {
      if (editProduct) await updateProduct(editProduct.id, formData);
      else await addProduct(formData);
      setProductModal(false);
      await loadData();
    } catch (err: any) { setError(err.message); }
    setSaving(false);
  };

  const handleAddOffer = () => {
    setOfferForm({ productName: '', category: '', originalPrice: 0, salePrice: 0, stock: 0, expiresAt: '', description: '', isActive: true, imageUrl: '' });
    setEditingOfferId(null);
    setOfferImageFile(null);
    setOfferModalOpen(true);
  };

  const handleEditOffer = (offer: FlashSale) => {
    setOfferForm({ productName: offer.productName, category: offer.category, originalPrice: offer.originalPrice, salePrice: offer.salePrice, stock: offer.stock || 0, expiresAt: offer.expiresAt.toISOString().slice(0, 16), description: offer.description || '', isActive: offer.isActive, imageUrl: offer.imageUrl || '' });
    setEditingOfferId(offer.id);
    setOfferImageFile(null);
    setOfferModalOpen(true);
  };

  const handleDeleteOffer = async (id: string) => {
    openConfirm(
      'Eliminar Oferta',
      '¿Está seguro de que desea eliminar esta oferta especial? Esta acción no se puede deshacer.',
      async () => {
        try {
          await deleteFlashSale(id);
          await loadData();
          setAdminToast('Oferta eliminada correctamente');
        } catch (err) {
          setError('Error al eliminar oferta');
        }
      }
    );
  };

  const handleSaveOffer = async () => {
    try {
      const originalPrice = Number(offerForm.originalPrice);
      const salePrice = Number(offerForm.salePrice);
      const discount = originalPrice > 0 ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

      let imageUrl = offerForm.imageUrl;

      // Subir nueva imagen si hay una
      if (offerImageFile) {
        setUploadingOfferImage(true);
        const storageRef = ref(storage, `flash-sales/${editingOfferId || Date.now()}/${offerImageFile.name}`);
        await uploadBytes(storageRef, offerImageFile);
        imageUrl = await getDownloadURL(storageRef);
        setUploadingOfferImage(false);
      }

      const payload = {
        productName: offerForm.productName,
        category: offerForm.category,
        originalPrice,
        salePrice,
        discount,
        stock: Number(offerForm.stock),
        expiresAt: new Date(offerForm.expiresAt),
        description: offerForm.description,
        isActive: offerForm.isActive,
        imageUrl,
      };

      if (editingOfferId) {
        await updateFlashSale(editingOfferId, payload);
        setAdminToast('Oferta actualizada');
      } else {
        const newOfferId = await createFlashSale(payload);
        // Si hay imagen y es nueva oferta, actualizar la imagen
        if (offerImageFile && newOfferId) {
          await updateFlashSaleImage(newOfferId, imageUrl);
        }
        setAdminToast('Oferta creada');
      }

      setOfferModalOpen(false);
      setOfferImageFile(null);
      await loadData();
    } catch (err) {
      setError('Error guardando oferta');
      setUploadingOfferImage(false);
    }
  };


  const handleAddCategory = () => { setEditCategory(null); setCategoryModal(true); };
  const handleEditCategory = (category: Category) => { setEditCategory(category); setCategoryModal(true); };
  const handleDeleteCategory = async (id: string) => {
    openConfirm(
      'Eliminar Categoría',
      '¿Está seguro de que desea eliminar esta categoría? Esta acción no se puede deshacer.',
      async () => {
        try {
          await deleteCategory(id);
          await loadData();
          setAdminToast('Categoría eliminada correctamente');
        } catch (err) {
          setError('Error al eliminar categoría');
        }
      }
    );
  };
  const handleSaveCategory = async (formData: any) => {
    setSaving(true);
    try {
      if (editCategory) await updateCategory(editCategory.id, formData);
      else await addCategory(formData);
      setCategoryModal(false);
      await loadData();
    } catch (err: any) { setError(err.message); }
    setSaving(false);
  };

  const handleToggleUserStatus = async (uid: string, isActive: boolean) => {
    try { await toggleUserStatus(uid, !isActive); await loadData(); } catch (err) { setError('Error'); }
  };
  // Función para obtener el siguiente rol en la secuencia
  const getNextRole = (currentRole: string) => {
    const roleSequence = ['user', 'vendor', 'technician', 'admin'];
    const currentIndex = roleSequence.indexOf(currentRole);
    const nextIndex = (currentIndex + 1) % roleSequence.length;
    return roleSequence[nextIndex] as 'admin' | 'vendor' | 'technician' | 'user';
  };

  // Función para manejar el cambio de rol con confirmación
  const handleRoleChange = async (user: UserProfile) => {
    if (userProfile?.role !== 'admin') {
      setError('Solo administradores pueden cambiar roles de usuarios');
      return;
    }

    const nextRole = getNextRole(user.role);
    const nextRoleName = getRoleDisplayName(nextRole);

    if (window.confirm(`¿Cambiar el rol de ${user.displayName} de ${getRoleDisplayName(user.role)} a ${nextRoleName}?`)) {
      try {
        await changeUserRole(user.uid, nextRole);
        await loadData();
      } catch (err) {
        setError('Error al cambiar rol del usuario');
      }
    }
  };

  const handleRoleSelectionChange = (uid: string, role: 'admin' | 'vendor' | 'technician' | 'user') => {
    setRoleSelection(prev => ({ ...prev, [uid]: role }));
  };

  const handleApplyRoleChange = async (user: UserProfile) => {
    if (userProfile?.role !== 'admin') {
      setError('Solo administradores pueden cambiar roles de usuarios');
      return;
    }

    const selectedRole = roleSelection[user.uid] || user.role || 'user';
    if (selectedRole === user.role) {
      setError('Seleccione un rol distinto para cambiar');
      return;
    }

    openConfirm(
      'Cambiar Rol de Usuario',
      `¿Cambiar el rol de ${user.displayName} de ${getRoleDisplayName(user.role)} a ${getRoleDisplayName(selectedRole)}?`,
      async () => {
        try {
          await changeUserRole(user.uid, selectedRole);
          await loadData();
        } catch (err) {
          setError('Error al cambiar rol del usuario');
        }
      }
    );
  };
  const handleDeleteUser = async (uid: string) => {
    openConfirm(
      'Eliminar Usuario',
      '¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer y eliminará toda su información.',
      async () => {
        try {
          await deleteUser(uid);
          await loadData();
          setAdminToast('Usuario eliminado correctamente');
        } catch (err) {
          setError('Error al eliminar usuario');
        }
      }
    );
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid') => {
    try {
      await updateOrder(orderId, { status });
      await addOrderHistoryEntry(orderId, `Estado cambiado a ${status}`);
      setAdminToast(`Pedido ${orderId} actualizado a ${status}.`);
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar el estado del pedido.');
    }
  };

  const handleDownloadComprobante = (orderId: string, comprobanteUrl: string) => {
    try {
      const extensionMatch = comprobanteUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
      const extension = extensionMatch ? extensionMatch[1] : 'jpg';
      const link = document.createElement('a');
      link.href = comprobanteUrl;
      link.download = `comprobante-${orderId}.${extension}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setAdminToast(`Descargando comprobante del pedido ${orderId}.`);
    } catch (err) {
      console.error(err);
      setError('No se pudo descargar el comprobante.');
    }
  };

  // Funciones para estadísticas de servicios
  const getServiceReportStats = () => {
    const entregados = services.filter(s => s.status === 'entregado').length;
    const cancelados = services.filter(s => s.status === 'cancelado').length;
    const enProgreso = services.filter(s => !['entregado', 'cancelado'].includes(s.status)).length;
    
    return { entregados, cancelados, enProgreso };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recibido': return 'bg-blue-500/20 text-blue-300 border-blue-500';
      case 'diagnostico': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500';
      case 'esperando_partes': return 'bg-orange-500/20 text-orange-300 border-orange-500';
      case 'en_reparacion': return 'bg-purple-500/20 text-purple-300 border-purple-500';
      case 'pruebas_finales': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500';
      case 'listo_para_recoger': return 'bg-green-500/20 text-green-300 border-green-500';
      case 'entregado': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500';
      case 'cancelado': return 'bg-red-500/20 text-red-300 border-red-500';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'recibido': 'Recibido',
      'diagnostico': 'En Diagnóstico',
      'esperando_partes': 'Esperando Partes',
      'en_reparacion': 'En Reparación',
      'pruebas_finales': 'Pruebas Finales',
      'listo_para_recoger': 'Listo para Recoger',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getFilteredServices = () => {
    let filtered = services;
    
    if (serviceReportsFilter !== 'all') {
      filtered = filtered.filter(s => s.status === serviceReportsFilter);
    }
    
    if (dateFilterStart) {
      const start = new Date(dateFilterStart);
      filtered = filtered.filter(s => new Date(s.createdAt) >= start);
    }
    
    if (dateFilterEnd) {
      const end = new Date(dateFilterEnd);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(s => new Date(s.createdAt) <= end);
    }
    
    return filtered;
  };

  const getServiceStats = () => {
    const filtered = getFilteredServices();
    const totalCost = filtered.reduce((sum, s) => sum + (s.finalCost || s.costEstimate || 0), 0);
    const avgTime = filtered.length > 0
      ? filtered.reduce((sum, s) => {
          const start = new Date(s.createdAt);
          const end = new Date(s.updatedAt);
          return sum + (end.getTime() - start.getTime());
        }, 0) / filtered.length / (1000 * 60 * 60 * 24)
      : 0;

    return { totalCost, avgTime };
  };

  useEffect(() => {
    if (!adminToast) return;
    const timeout = setTimeout(() => setAdminToast(null), 2800);
    return () => clearTimeout(timeout);
  }, [adminToast]);

  // Verificar que el usuario tenga un rol válido para acceder al panel
  const allowedRoles = ['admin', 'vendor', 'technician'];
  if (!userProfile || !allowedRoles.includes(userProfile.role)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Acceso Denegado</h1>
          <p className="text-gray-300 mb-4">No tienes permisos para acceder a esta sección.</p>
          <button onClick={() => window.history.back()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAdmin={false}>
      <div className="min-h-screen bg-black px-4 py-6 sm:px-8 sm:py-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-400">Panel de Administración</h1>
              <p className="text-amber-200 text-sm">Rol: {getRoleDisplayName(userProfile?.role || 'user')}</p>
            </div>
            <button onClick={logout} className="text-red-500 font-bold border border-red-500 rounded px-3 py-1 sm:px-4 sm:py-2">Logout</button>
          </div>

          <nav className="flex gap-2 mb-6 sm:mb-8 flex-wrap justify-start">
            {getAvailableTabs().map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded font-bold ${activeTab === tab ? 'bg-amber-500 text-black' : 'bg-gray-800'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          {error && <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-400">{error}</div>}
          {adminToast && <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded text-green-300">{adminToast}</div>}

          {activeTab === 'banners' && canViewTab('banners') && <div><h2 className="text-2xl font-bold text-amber-400 mb-4">Gestión de Banners</h2><BannersManager /></div>}
          
          {activeTab === 'products' && canViewTab('products') && (
            <div>
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold text-amber-400">Productos</h2>
                <button onClick={handleAddProduct} className="bg-amber-500 text-black px-4 py-2 rounded font-bold">+Agregar</button>
              </div>
              <div className="grid gap-4">{products.map(p => (
                <div key={p.id} className="bg-gray-900 p-4 rounded border border-amber-400/30"><h3 className="font-bold">{p.name}</h3><p>${p.price}</p><button onClick={() => handleEditProduct(p)} className="bg-amber-500 text-black px-2 py-1 rounded text-sm mt-2">Edit</button></div>
              ))}</div>
            </div>
          )}

          {activeTab === 'categories' && canViewTab('categories') && (
            <div>
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold text-amber-400">Categorías</h2>
                <button onClick={handleAddCategory} className="bg-amber-500 text-black px-4 py-2 rounded font-bold">+Agregar</button>
              </div>
              <div className="grid gap-4">{categories.map(c => (
                <div key={c.id} className="bg-gray-900 p-4 rounded border border-amber-400/30"><h3 className="font-bold">{c.name}</h3><div className="flex gap-2 mt-2"><button onClick={() => handleEditCategory(c)} className="bg-amber-500 text-black px-2 py-1 rounded text-sm">Edit</button><button onClick={() => handleDeleteCategory(c.id)} className="bg-red-600 text-white px-2 py-1 rounded text-sm">Delete</button></div></div>
              ))}</div>
            </div>
          )}

          {activeTab === 'services' && canViewTab('services') && (
            <div>
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold text-amber-400">Servicios Técnicos</h2>
                <button onClick={() => setServiceModal('add')} className="bg-amber-500 text-black px-4 py-2 rounded font-bold">+Nuevo Servicio</button>
              </div>
              {services.length === 0 ? (
                <p className="text-gray-400">No hay servicios registrados.</p>
              ) : (
                <div className="grid gap-4">
                  {services.map(s => (
                    <div key={s.id} className="bg-gray-900 p-4 rounded border border-amber-400/30 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold">{s.deviceInfo.brand} {s.deviceInfo.model}</p>
                          {s.ticketNumber && (
                            <span className="px-2 py-1 bg-amber-500 text-black text-xs font-bold rounded">Ticket: {s.ticketNumber}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">Usuario: {s.userId}</p>
                        <p className="text-sm">Issue: {s.deviceInfo.issue}</p>
                        <p className="text-sm">Estado: <span className="capitalize">{s.status.replace('_', ' ')}</span></p>
                        <p className="text-sm">Fecha estimada: {s.estimatedCompletion ? new Date(s.estimatedCompletion).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => setServiceModal(s)}>Ver / Editar</button>
                        <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={() => setServiceModal(s)}>Seguimiento</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'offers' && canViewTab('offers') && (
            <div>
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold text-amber-400">Ofertas Especiales</h2>
                <button onClick={handleAddOffer} className="bg-amber-500 text-black px-4 py-2 rounded font-bold">+Agregar</button>
              </div>
              {flashSales.length === 0 ? (
                <p className="text-gray-400">No hay ofertas registradas.</p>
              ) : (
                <div className="grid gap-4">
                  {flashSales.map(f => (
                    <div key={f.id} className="bg-gray-900 p-4 rounded border border-blue-500/30">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex gap-3">
                          {f.imageUrl && (
                            <img src={f.imageUrl} alt={f.productName} className="w-16 h-16 object-cover rounded border border-gray-600" />
                          )}
                          <div>
                            <h3 className="font-bold text-blue-200">{f.productName}</h3>
                            <p className="text-xs text-blue-300">{f.category}</p>
                            <p className="text-sm text-blue-100">{f.description}</p>
                            <p className="text-xs text-blue-300 mt-1">Precio: S/. {f.salePrice.toFixed(2)} (Antes S/. {f.originalPrice.toFixed(2)})</p>
                            <p className="text-xs text-blue-300">Stock: {f.stock ?? 0}</p>
                            <p className="text-xs text-blue-300">Expira: {new Date(f.expiresAt).toLocaleString('es-PE')}</p>
                            <p className="text-xs text-blue-300">Activo: {f.isActive ? 'Sí' : 'No'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditOffer(f)} className="px-2 py-1 rounded bg-blue-600 text-white text-xs">Editar</button>
                          <button onClick={() => handleDeleteOffer(f.id)} className="px-2 py-1 rounded bg-red-600 text-white text-xs">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && canViewTab('users') && (
            <div>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Usuarios</h2>
              <div className="grid gap-4">
                {users.map(u => (
                  <div key={u.uid} className="bg-gradient-to-br from-cyan-900 via-blue-950 to-indigo-900 p-4 rounded-xl border border-cyan-400/30 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-cyan-200">{u.displayName || 'Usuario sin nombre'}</p>
                        <p className="text-sm text-cyan-100">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wider text-amber-300">{u.role || 'user'}</p>
                        <p className={`text-xs ${u.isActive ? 'text-green-300' : 'text-red-300'}`}>{u.isActive ? 'Activo' : 'Inactivo'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      <button onClick={() => handleToggleUserStatus(u.uid, !u.isActive)} className="px-3 py-1 rounded bg-yellow-500 text-slate-900 text-xs">{u.isActive ? 'Desactivar' : 'Activar'}</button>

                      {userProfile?.role === 'admin' && (
                        <>
                          <label className="flex items-center gap-2 text-xs text-cyan-100">
                            <span>Rol:</span>
                            <select
                              value={roleSelection[u.uid] || u.role || 'user'}
                              onChange={e => handleRoleSelectionChange(u.uid, e.target.value as 'admin' | 'vendor' | 'technician' | 'user')}
                              className="rounded border border-cyan-400 bg-blue-950 px-2 py-1 text-xs"
                            >
                              <option value="user">Usuario</option>
                              <option value="vendor">Vendedor</option>
                              <option value="technician">Técnico</option>
                              <option value="admin">Administrador</option>
                            </select>
                          </label>
                          <button onClick={() => handleApplyRoleChange(u)} className="px-3 py-1 rounded bg-violet-500 text-white text-xs">
                            Aplicar
                          </button>
                        </>
                      )}

                      <button onClick={() => handleDeleteUser(u.uid)} className="px-3 py-1 rounded bg-red-500 text-white text-xs">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && canViewTab('orders') && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-amber-400">Pedidos</h2>
                <span className="text-sm text-blue-200">Total pedidos: {orders.length}</span>
              </div>
              <div className="grid gap-4">
                {orders.map(o => {
                  const totalItems = Array.isArray(o.items) ? o.items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0) : 0;
                  const productsCount = Array.isArray(o.items) ? o.items.length : 0;
                  return (
                    <div key={o.id} className="bg-gray-900 p-4 rounded border border-blue-500/30">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-blue-200 text-sm">
                            Pedido <span title={o.id}>#{o.id.slice(0, 10)}...</span>
                          </p>
                          <p className="text-xs text-blue-300">Cliente: {o.nombre || o.userEmail || 'Desconocido'} - {o.celular || o.email || 'sin teléfono'}</p>
                          <p className="text-xs text-blue-300">Ciudad: {o.ciudad || '-'} | Agencia: {o.agencia || '-'} | Sucursal: {o.sucursal || '-'}</p>
                          <p className="text-xs text-blue-300">Dirección: {o.direccion || '-'}</p>
                          <p className="text-xs text-blue-300">DNI: {o.dni || '-'}</p>
                          <p className="text-xs text-blue-300">Método pago: {o.paymentMethod || 'N/A'}</p>
                          <p className="text-xs text-blue-300">Productos: {productsCount} | Cantidad total: {totalItems}</p>
                          <p className="text-xs text-blue-300">Fecha: {o.createdAt ? new Date(o.createdAt).toLocaleString('es-PE') : 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-cyan-300">S/. {Number(o.total || 0).toFixed(2)}</p>
                          <div className="mt-2">
                            <select
                              value={o.status || 'pending'}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                              className="text-xs px-2 py-1 rounded bg-gray-800 text-white border border-blue-500"
                            >
                              <option value="pending">PENDIENTE</option>
                              <option value="processing">EN PROCESO</option>
                              <option value="shipped">ENVIADO</option>
                              <option value="delivered">ENTREGADO</option>
                              <option value="cancelled">CANCELADO</option>
                              <option value="paid">PAGADO</option>
                            </select>
                          </div>

                          <div className="mt-3 flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => setOrderReceipt(o)}
                              className="text-xs bg-amber-500 hover:bg-amber-600 text-black px-3 py-2 rounded font-semibold transition"
                            >
                              Descargar voucher (PDF)
                            </button>
                            
                          </div>

                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                        {Array.isArray(o.items)
                          ? o.items.slice(0, 4).map((item: any) => (
                              <div key={item.id} className="flex items-center gap-2 bg-slate-800 p-2 rounded-md min-w-[130px] border border-cyan-500/20">
                                <img
                                  src={item.imageUrl || '/no-image.png'}
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded"
                                  onError={(e: any) => { e.currentTarget.src = '/no-image.png'; }}
                                />
                                <div className="text-xs">
                                  <p className="font-semibold truncate max-w-[90px]">{item.name}</p>
                                  <p className="text-blue-300">x{item.quantity} = S/. {(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              </div>
                            ))
                          : null }
                        {productsCount > 4 && (
                          <div className="py-2 px-3 border border-blue-300/40 rounded-lg text-xs text-blue-200">+{productsCount - 4} más</div>
                        )}
                      </div>
                      {Array.isArray(o.history) && o.history.length > 0 && (
                        <div className="mt-3 p-2 bg-black/30 border border-blue-500 rounded">
                          <p className="text-xs font-semibold text-blue-300 mb-1">Historial:</p>
                          <ul className="text-xs text-blue-100 max-h-24 overflow-y-auto space-y-1">
                            {o.history.slice(-4).reverse().map((h: any, idx: number) => (
                              <li key={idx} className="border-b border-blue-500/20 pb-1">{h.message} - {h.createdAt?.toDate ? h.createdAt.toDate().toLocaleString('es-PE') : (h.createdAt ? new Date(h.createdAt).toLocaleString('es-PE') : '')}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {o.comprobanteUrl && (
                        <div className="mt-3 p-2 border border-green-400/30 rounded bg-slate-900">
                          <p className="text-xs font-semibold text-green-300 mb-1">Comprobante de pago:</p>
                          <div className="flex items-center gap-2">
                            <a href={o.comprobanteUrl} target="_blank" rel="noreferrer" className="inline-block">
                              <img
                                src={o.comprobanteUrl}
                                alt={`Comprobante ${o.id}`}
                                className="w-20 h-20 object-cover rounded border border-green-300/40 hover:scale-105 transition"
                                onError={(e: any) => { e.currentTarget.src = '/no-image.png'; }}
                              />
                            </a>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-green-200">Id comprobante: {o.id}</span>
                              <a
                                href={o.comprobanteUrl}
                                download={`comprobante-${o.id}`}
                                className="text-xs bg-green-500/20 border border-green-400/50 text-green-200 px-2 py-1 rounded font-semibold hover:bg-green-500/30 transition"
                              >
                                Descargar comprobante
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          )}

          {activeTab === 'service-reports' && canViewTab('service-reports') && (
            <div>
              <h2 className="text-2xl font-bold text-blue-400 mb-6">Reportes de Servicios Técnicos</h2>

              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-900 to-emerald-800 p-6 rounded-lg border border-green-400/30 shadow-lg">
                  <p className="text-sm text-green-200 mb-2">Servicios Entregados</p>
                  <p className="text-4xl font-bold text-green-400">{getServiceReportStats().entregados}</p>
                </div>
                <div className="bg-gradient-to-br from-red-900 to-rose-800 p-6 rounded-lg border border-red-400/30 shadow-lg">
                  <p className="text-sm text-red-200 mb-2">Servicios Cancelados</p>
                  <p className="text-4xl font-bold text-red-400">{getServiceReportStats().cancelados}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-900 to-cyan-800 p-6 rounded-lg border border-blue-400/30 shadow-lg">
                  <p className="text-sm text-blue-200 mb-2">En Progreso</p>
                  <p className="text-4xl font-bold text-blue-400">{getServiceReportStats().enProgreso}</p>
                </div>
              </div>

              {/* Filtros - Responsive */}
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Estado</label>
                    <select
                      value={serviceReportsFilter}
                      onChange={(e) => setServiceReportsFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="recibido">Recibido</option>
                      <option value="diagnostico">En Diagnóstico</option>
                      <option value="esperando_partes">Esperando Partes</option>
                      <option value="en_reparacion">En Reparación</option>
                      <option value="pruebas_finales">Pruebas Finales</option>
                      <option value="listo_para_recoger">Listo para Recoger</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Desde</label>
                    <input
                      type="date"
                      value={dateFilterStart}
                      onChange={(e) => setDateFilterStart(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Hasta</label>
                    <input
                      type="date"
                      value={dateFilterEnd}
                      onChange={(e) => setDateFilterEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setServiceReportsFilter('all');
                        setDateFilterStart('');
                        setDateFilterEnd('');
                      }}
                      className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition"
                    >
                      Limpiar Filtros
                    </button>
                  </div>
                </div>
              </div>

              {/* Resumen de costos y tiempo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900 p-4 rounded border border-yellow-500/30">
                  <p className="text-sm text-yellow-300">Costo Total</p>
                  <p className="text-3xl font-bold text-yellow-400">S/. {getServiceStats().totalCost.toFixed(2)}</p>
                </div>
                <div className="bg-gray-900 p-4 rounded border border-purple-500/30">
                  <p className="text-sm text-purple-300">Tiempo Promedio (días)</p>
                  <p className="text-3xl font-bold text-purple-400">{getServiceStats().avgTime.toFixed(1)}</p>
                </div>
              </div>

              {/* VISTA MÓVIL - Cards */}
              <div className="md:hidden">
                <h3 className="text-lg font-semibold text-white mb-4">Servicios</h3>
                {getFilteredServices().length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No hay servicios con los filtros seleccionados.</p>
                ) : (
                  <div className="space-y-4">
                    {getFilteredServices().map((service) => (
                      <div key={service.id} className={`border-l-4 rounded-lg p-4 ${getStatusColor(service.status).split(' ').slice(0, 2).join(' ')} border-l-${getStatusColor(service.status).split('border-')[1]}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-white text-sm">Ticket: {service.ticketNumber || 'N/A'}</p>
                            <p className={`text-xs font-semibold px-2 py-1 rounded inline-block mt-1 border ${getStatusColor(service.status)}`}>
                              {getStatusLabel(service.status)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-300"><span className="font-semibold">Cliente:</span> {service.userId}</p>
                          <p className="text-gray-300"><span className="font-semibold">Equipo:</span> {service.deviceInfo.brand} {service.deviceInfo.model}</p>
                          <p className="text-gray-300"><span className="font-semibold">Técnico:</span> {service.technician || 'No asignado'}</p>
                          <p className="text-gray-400 text-xs"><span className="font-semibold">Costo:</span> S/. {(service.finalCost || service.costEstimate || 0).toFixed(2)}</p>
                          <p className="text-gray-400 text-xs"><span className="font-semibold">Inicio:</span> {new Date(service.createdAt).toLocaleDateString('es-PE')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* VISTA DESKTOP - Tabla */}
              <div className="hidden md:block bg-gray-900 rounded-lg border border-gray-700 overflow-x-auto">
                <h3 className="text-lg font-semibold text-white p-4 border-b border-gray-700">Servicios</h3>
                {getFilteredServices().length === 0 ? (
                  <p className="text-gray-400 p-4 text-center">No hay servicios con los filtros seleccionados.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Ticket</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Cliente</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Equipo</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Técnico</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Estado</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Costo</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Inicio</th>
                        <th className="px-4 py-3 text-left text-gray-300 font-semibold">Fin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredServices().map((service, idx) => (
                        <tr key={service.id} className={idx % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900'}>
                          <td className="px-4 py-3 text-white font-semibold">{service.ticketNumber || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-300">{service.userId}</td>
                          <td className="px-4 py-3 text-gray-300">{service.deviceInfo.brand} {service.deviceInfo.model}</td>
                          <td className="px-4 py-3 text-gray-300">{service.technician || 'No asignado'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(service.status)}`}>
                              {getStatusLabel(service.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-300">S/. {(service.finalCost || service.costEstimate || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-gray-400">{new Date(service.createdAt).toLocaleDateString('es-PE')}</td>
                          <td className="px-4 py-3 text-gray-400">{new Date(service.updatedAt).toLocaleDateString('es-PE')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && canViewTab('analytics') && (
            <div>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 p-4 rounded border border-blue-500/40">
                  <p className="text-sm text-blue-200">Pedidos totales</p>
                  <p className="text-3xl font-bold text-amber-400">{orders.length}</p>
                </div>
                <div className="bg-gray-900 p-4 rounded border border-blue-500/40">
                  <p className="text-sm text-blue-200">Usuarios</p>
                  <p className="text-3xl font-bold text-amber-400">{users.length}</p>
                </div>
                <div className="bg-gray-900 p-4 rounded border border-blue-500/40">
                  <p className="text-sm text-blue-200">Productos</p>
                  <p className="text-3xl font-bold text-amber-400">{products.length}</p>
                </div>
              </div>
              <div className="bg-gray-900 p-4 rounded border border-cyan-500/30">
                <p className="text-sm text-blue-200">Ventas totales</p>
                <p className="text-3xl font-bold text-cyan-400">S/. {orders.reduce((sum, o) => sum + Number(o.total || 0), 0).toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-2">Ingresos calculados según campos de total de pedidos.</p>
              </div>
            </div>
          )}

          {orderReceipt && (
            <OrderReceipt order={orderReceipt} onClose={() => setOrderReceipt(null)} />
          )}

          {productModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 py-6 z-50">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-black p-6 rounded-xl border-2 border-amber-400 shadow-xl">
                <ProductForm initialData={editProduct} onSave={handleSaveProduct} onCancel={() => setProductModal(false)} loading={saving} />
              </div>
            </div>
          )}

          {categoryModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 py-6 z-50">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-black p-6 rounded-xl border-2 border-amber-400 shadow-xl">
                <CategoryForm initialData={editCategory} onSave={handleSaveCategory} onCancel={() => setCategoryModal(false)} loading={saving} />
              </div>
            </div>
          )}

          {offerModalOpen && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 py-6 z-50">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-black p-6 rounded-xl border-2 border-amber-400 shadow-xl">
                <h2 className="text-xl font-bold text-amber-400 mb-4">{editingOfferId ? 'Editar' : 'Agregar'} Oferta</h2>
                <div className="grid gap-3">
                  <input className="px-3 py-2 rounded bg-gray-800 text-white" placeholder="Nombre del producto" value={offerForm.productName} onChange={e => setOfferForm(f => ({ ...f, productName: e.target.value }))} />
                  <input className="px-3 py-2 rounded bg-gray-800 text-white" placeholder="Categoría" value={offerForm.category} onChange={e => setOfferForm(f => ({ ...f, category: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" min="0" step="0.01" className="px-3 py-2 rounded bg-gray-800 text-white" placeholder="Precio original" value={offerForm.originalPrice} onChange={e => setOfferForm(f => ({ ...f, originalPrice: Number(e.target.value) }))} />
                    <input type="number" min="0" step="0.01" className="px-3 py-2 rounded bg-gray-800 text-white" placeholder="Precio oferta" value={offerForm.salePrice} onChange={e => setOfferForm(f => ({ ...f, salePrice: Number(e.target.value) }))} />
                  </div>
                  <input type="number" min="0" className="px-3 py-2 rounded bg-gray-800 text-white" placeholder="Stock" value={offerForm.stock} onChange={e => setOfferForm(f => ({ ...f, stock: Number(e.target.value) }))} />
                  <input type="datetime-local" className="px-3 py-2 rounded bg-gray-800 text-white" value={offerForm.expiresAt} onChange={e => setOfferForm(f => ({ ...f, expiresAt: e.target.value }))} />
                  <textarea className="px-3 py-2 rounded bg-gray-800 text-white" placeholder="Descripción" value={offerForm.description} onChange={e => setOfferForm(f => ({ ...f, description: e.target.value }))} />
                  <div>
                    <label className="block text-sm text-gray-200 mb-2">Imagen de la oferta</label>
                    {offerForm.imageUrl && (
                      <div className="mb-2">
                        <img src={offerForm.imageUrl} alt="Imagen actual" className="w-20 h-20 object-cover rounded border border-gray-600" />
                        <p className="text-xs text-gray-400 mt-1">Imagen actual</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setOfferImageFile(e.target.files?.[0] || null)}
                      className="px-3 py-2 rounded bg-gray-800 text-white text-sm"
                    />
                    {uploadingOfferImage && <p className="text-xs text-blue-300 mt-1">Subiendo imagen...</p>}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-200">
                    <input type="checkbox" checked={offerForm.isActive} onChange={e => setOfferForm(f => ({ ...f, isActive: e.target.checked }))} />
                    Activa
                  </label>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setOfferModalOpen(false)} className="flex-1 bg-gray-700 text-white px-3 py-2 rounded">Cancelar</button>
                    <button onClick={handleSaveOffer} disabled={uploadingOfferImage} className="flex-1 bg-amber-500 text-black px-3 py-2 rounded disabled:opacity-50">
                      {uploadingOfferImage ? 'Subiendo...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ServiceCreationModal
            isOpen={serviceModal === 'add'}
            onClose={() => setServiceModal(null)}
            onServiceCreated={async () => { setServiceModal(null); await loadData(); }}
          />

          <ServiceDetailsModal
            isOpen={serviceModal !== null && serviceModal !== 'add'}
            onClose={() => setServiceModal(null)}
            service={serviceModal !== null && serviceModal !== 'add' ? serviceModal : null}
            onServiceUpdated={async () => { setServiceModal(null); await loadData(); }}
          />

          {/* Modal de Confirmación Personalizado */}
          {confirmDialog.isOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-blue-950 via-indigo-950 to-blue-900 rounded-lg shadow-2xl border border-cyan-400/30 max-w-md w-full animate-in fade-in scale-95 transform transition duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 border-b border-cyan-400/30">
                  <h2 className="text-lg font-bold text-white">{confirmDialog.title}</h2>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  <p className="text-gray-200 text-sm leading-relaxed">{confirmDialog.message}</p>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-cyan-400/20 bg-black/20">
                  <button
                    onClick={() => {
                      closeConfirm();
                      confirmDialog.onCancel();
                    }}
                    disabled={confirmDialog.isLoading}
                    className="flex-1 px-4 py-2 rounded font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    disabled={confirmDialog.isLoading}
                    className="flex-1 px-4 py-2 rounded font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {confirmDialog.isLoading && (
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {confirmDialog.isLoading ? 'Procesando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
