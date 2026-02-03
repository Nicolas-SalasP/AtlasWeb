import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosConfig';
import {
    Search, Plus, Package, DollarSign, Image as ImageIcon,
    MoreVertical, Edit, Trash2, X, Save, Loader2, Star, UploadCloud,
    AlertTriangle, CheckCircle, AlertCircle
} from 'lucide-react';

const AdminProductos = () => {
    // --- ESTADOS DE DATOS ---
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const BASE_URL = 'http://127.0.0.1:8000';

    // --- ESTADOS UI ---
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // --- SISTEMA DE NOTIFICACIONES Y MODALES ---
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' }); // 'success' | 'error'
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', action: null }); // Para confirmaciones

    // --- FORMULARIO ---
    const [form, setForm] = useState({
        name: '', sku: '', price: '', cost_price: '',
        stock_current: '', category_id: '', description: '', is_visible: true
    });

    // Gestor de Imágenes
    const [imagenesExistentes, setImagenesExistentes] = useState([]);
    const [nuevasImagenes, setNuevasImagenes] = useState([]);
    const fileInputRef = useRef(null);

    // 1. CARGA INICIAL
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/admin/products'),
                api.get('/categories')
            ]);
            setProductos(prodRes.data);
            setCategorias(catRes.data);
        } catch (error) {
            console.error("Error:", error);
            showToast('error', 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // --- HELPERS UX ---
    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const pedirConfirmacion = (message, action) => {
        setConfirmModal({ show: true, message, action });
    };

    const cerrarConfirmacion = () => {
        setConfirmModal({ show: false, message: '', action: null });
    };

    const ejecutarAccionConfirmada = async () => {
        if (confirmModal.action) {
            await confirmModal.action();
        }
        cerrarConfirmacion();
    };

    // 2. ABRIR DRAWER
    const abrirDrawer = (producto = null) => {
        setNuevasImagenes([]);

        if (producto) {
            setEditando(producto);
            setForm({
                name: producto.name,
                sku: producto.sku,
                price: parseInt(producto.price),
                cost_price: producto.cost_price ? parseInt(producto.cost_price) : '',
                stock_current: producto.stock_current,
                category_id: producto.category_id,
                description: producto.description || '',
                is_visible: Boolean(producto.is_visible)
            });
            setImagenesExistentes(producto.images || []);
        } else {
            setEditando(null);
            setForm({ name: '', sku: '', price: '', cost_price: '', stock_current: '', category_id: '', description: '', is_visible: true });
            setImagenesExistentes([]);
        }
        setDrawerOpen(true);
    };

    // 3. LOGICA IMÁGENES
    const eliminarImagenExistente = (idImagen) => {
        pedirConfirmacion("¿Eliminar esta imagen permanentemente?", async () => {
            try {
                await api.delete(`/admin/product-images/${idImagen}`);
                setImagenesExistentes(prev => prev.filter(img => img.id !== idImagen));
                cargarDatos(); // Refrescar lista fondo
                showToast('success', 'Imagen eliminada');
            } catch (error) {
                showToast('error', 'Error al eliminar imagen');
            }
        });
    };

    const marcarPortada = async (idImagen) => {
        try {
            await api.post(`/admin/product-images/${idImagen}/cover`);
            setImagenesExistentes(prev => prev.map(img => ({
                ...img,
                is_cover: img.id === idImagen ? 1 : 0
            })));
            cargarDatos();
            showToast('success', 'Portada actualizada');
        } catch (error) {
            showToast('error', 'Error al cambiar portada');
        }
    };

    // 4. GUARDAR PRODUCTO
    const guardarProducto = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            const formData = new FormData();

            Object.keys(form).forEach(key => {
                if (key === 'is_visible') formData.append(key, form[key] ? '1' : '0');
                else formData.append(key, form[key]);
            });

            nuevasImagenes.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });

            if (editando) {
                await api.post(`/admin/products/${editando.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            await cargarDatos();
            setDrawerOpen(false);
            showToast('success', editando ? 'Producto actualizado' : 'Producto creado');

        } catch (error) {
            console.error(error);
            showToast('error', 'Error al guardar. Revisa el SKU.');
        } finally {
            setGuardando(false);
        }
    };

    const eliminarProducto = (id) => {
        pedirConfirmacion("¿Borrar producto y todas sus imágenes?", async () => {
            try {
                await api.delete(`/admin/products/${id}`);
                setProductos(productos.filter(p => p.id !== id));
                showToast('success', 'Producto eliminado');
            } catch (error) {
                showToast('error', 'Error al eliminar');
            }
        });
    };

    const filtrados = productos.filter(p => p.name.toLowerCase().includes(busqueda.toLowerCase()) || p.sku.toLowerCase().includes(busqueda.toLowerCase()));

    if (loading) return <div className="h-screen flex items-center justify-center gap-2 text-atlas-900"><Loader2 className="animate-spin" /> Cargando Inventario...</div>;

    return (
        // LAYOUT RESPONSIVO Y FIJO
        <div className="h-[calc(100vh-80px)] p-4 md:p-10 bg-gray-50/50 flex flex-col overflow-hidden relative">

            {/* NOTIFICACIÓN TOAST (Flotante) */}
            {toast.show && (
                <div className={`fixed top-24 right-4 md:right-10 z-[100] px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium text-sm">{toast.message}</span>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Productos</h1>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">Gestión de inventario y precios</p>
                </div>
                <button onClick={() => abrirDrawer()} className="bg-atlas-900 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-atlas-800 transition-all flex items-center gap-2 text-sm md:text-base w-full md:w-auto justify-center">
                    <Plus size={20} /> Nuevo Producto
                </button>
            </div>

            {/* TABLA CONTAINER */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col flex-1 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/30 flex-shrink-0">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Buscar por nombre o SKU..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-atlas-200 outline-none text-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full min-w-[800px]"> {/* min-w fuerza scroll horizontal en móvil */}
                        <thead className="bg-gray-50 border-b border-gray-100 text-left sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Producto</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Categoría</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Precio</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50 text-center">Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtrados.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center relative flex-shrink-0">
                                                {p.images && p.images.find(img => img.is_cover) ? (
                                                    <img src={`${BASE_URL}${p.images.find(img => img.is_cover).url}`} alt="" className="w-full h-full object-cover" />
                                                ) : p.images && p.images.length > 0 ? (
                                                    <img src={`${BASE_URL}${p.images[0].url}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={20} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm md:text-base">{p.name}</p>
                                                <p className="text-xs text-gray-500 font-mono">SKU: {p.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-bold">{p.category?.name || 'Sin Categoría'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">${parseInt(p.price).toLocaleString('es-CL')}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${p.stock_current > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {p.stock_current}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => abrirDrawer(p)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"><Edit size={18} /></button>
                                            <button onClick={() => eliminarProducto(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL CONFIRMACIÓN (REEMPLAZA CONFIRM) --- */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 text-center">
                        <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
                        <p className="text-gray-500 text-sm mb-6">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button onClick={cerrarConfirmacion} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={ejecutarAccionConfirmada} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg transition-all">Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DRAWER FORMULARIO RESPONSIVO --- */}
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setDrawerOpen(false)} />
            <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 md:px-8 flex-shrink-0 bg-white">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                </div>

                <form onSubmit={guardarProducto} className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8 bg-gray-50/50">

                    {/* GESTOR DE IMÁGENES */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Galería de Imágenes</label>

                        {/* EXISTENTES */}
                        {imagenesExistentes.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-400 mb-2 font-bold uppercase">Guardadas</p>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {imagenesExistentes.map((img) => (
                                        <div key={img.id} className={`group relative aspect-square rounded-xl overflow-hidden border-2 ${img.is_cover ? 'border-atlas-900' : 'border-gray-100'}`}>
                                            <img src={`${BASE_URL}${img.url}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <button type="button" onClick={() => marcarPortada(img.id)} className={`p-1.5 rounded-full ${img.is_cover ? 'bg-yellow-400 text-white' : 'bg-white text-gray-500 hover:text-yellow-500'}`} title="Portada"><Star size={14} fill={img.is_cover ? "currentColor" : "none"} /></button>
                                                <button type="button" onClick={() => eliminarImagenExistente(img.id)} className="p-1.5 bg-white text-red-500 rounded-full hover:bg-red-50" title="Eliminar"><Trash2 size={14} /></button>
                                            </div>
                                            {img.is_cover == 1 && <div className="absolute top-1 left-1 bg-atlas-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">PORTADA</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* NUEVAS */}
                        <div>
                            <p className="text-xs text-gray-400 mb-2 font-bold uppercase">Subir Nuevas</p>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                <div onClick={() => fileInputRef.current.click()} className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-atlas-900 hover:text-atlas-900 hover:bg-atlas-50 transition-all flex-shrink-0 bg-gray-50">
                                    <UploadCloud size={24} />
                                    <span className="text-[10px] mt-1 font-bold">Seleccionar</span>
                                </div>
                                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={(e) => setNuevasImagenes([...nuevasImagenes, ...Array.from(e.target.files)])} />

                                {nuevasImagenes.map((file, i) => (
                                    <div key={i} className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-70" />
                                        <button type="button" onClick={() => setNuevasImagenes(nuevasImagenes.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full shadow-sm"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DATOS DEL PRODUCTO */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nombre</label>
                                <input required type="text" className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-atlas-900 outline-none" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">SKU</label>
                                <input required type="text" className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-atlas-900 outline-none" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Precio Venta</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input required type="number" className="w-full pl-8 p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-atlas-900 outline-none" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Costo (Opcional)</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="number" className="w-full pl-8 p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-atlas-900 outline-none" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Stock Actual</label>
                                <input required type="number" className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-atlas-900 outline-none" value={form.stock_current} onChange={e => setForm({ ...form, stock_current: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Categoría</label>
                                <select required className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-atlas-900 outline-none appearance-none" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                                    <option value="">Seleccionar...</option>
                                    {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Descripción</label>
                            <textarea rows="4" className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-atlas-900 outline-none resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 cursor-pointer" onClick={() => setForm({ ...form, is_visible: !form.is_visible })}>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${form.is_visible ? 'bg-atlas-900 border-atlas-900' : 'border-gray-300'}`}>
                                {form.is_visible && <CheckCircle size={14} className="text-white" />}
                            </div>
                            <label className="text-sm font-medium text-gray-700 cursor-pointer">Producto Visible en Tienda</label>
                        </div>
                    </div>

                </form>

                <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 flex-shrink-0">
                    <button onClick={() => setDrawerOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={guardarProducto} disabled={guardando} className="px-8 py-3 bg-atlas-900 text-white font-bold rounded-xl hover:bg-atlas-800 shadow-lg flex items-center gap-2">
                        {guardando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Guardar
                    </button>
                </div>

            </div>

        </div>
    );
};

export default AdminProductos;