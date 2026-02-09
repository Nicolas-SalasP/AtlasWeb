import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosConfig';
import {
    Search, Plus, Briefcase, DollarSign, Image as ImageIcon,
    Edit, Trash2, X, Save, Loader2, Star, UploadCloud,
    AlertTriangle, CheckCircle, AlertCircle, Check, MinusCircle, PlusCircle
} from 'lucide-react';
import { BASE_URL } from '../../api/constants';

const AdminServices = () => {
    // --- ESTADOS DE DATOS ---
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    // --- ESTADOS UI ---
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // --- NOTIFICACIONES Y MODALES ---
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', action: null });

    // --- FORMULARIO ---
    const [form, setForm] = useState({
        name: '',
        price: '',
        duration_days: 30,
        description: '',
        features: [''],
        image: null,
        previewUrl: null
    });

    const fileInputRef = useRef(null);

    // 1. CARGA INICIAL
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const { data } = await api.get('/admin/services');
            setServices(data);
        } catch (error) {
            console.error("Error:", error);
            showToast('error', 'Error al cargar servicios');
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
        if (confirmModal.action) await confirmModal.action();
        cerrarConfirmacion();
    };

    // 2. ABRIR DRAWER
    const abrirDrawer = (service = null) => {
        if (service) {
            setEditando(service);
            setForm({
                name: service.name,
                price: parseInt(service.price),
                duration_days: service.duration_days,
                description: service.description || '',
                features: service.features && service.features.length > 0 ? service.features : [''],
                image: null,
                previewUrl: service.image_url ? `${BASE_URL}${service.image_url}` : null
            });
        } else {
            setEditando(null);
            setForm({
                name: '', price: '', duration_days: 30, description: '',
                features: [''], image: null, previewUrl: null
            });
        }
        setDrawerOpen(true);
    };

    // 3. LOGICA FORMULARIO
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({
                ...form,
                image: file,
                previewUrl: URL.createObjectURL(file)
            });
        }
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...form.features];
        newFeatures[index] = value;
        setForm({ ...form, features: newFeatures });
    };

    const addFeatureField = () => {
        setForm({ ...form, features: [...form.features, ''] });
    };

    const removeFeatureField = (index) => {
        const newFeatures = form.features.filter((_, i) => i !== index);
        setForm({ ...form, features: newFeatures });
    };

    // 4. GUARDAR SERVICIO
    const guardarServicio = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('price', form.price);
            formData.append('duration_days', form.duration_days);
            formData.append('description', form.description);

            if (form.image instanceof File) {
                formData.append('image', form.image);
            }
            const cleanFeatures = form.features.filter(f => f.trim() !== '');
            formData.append('features', JSON.stringify(cleanFeatures));

            if (editando) {
                formData.append('_method', 'PUT');
                await api.post(`/admin/services/${editando.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast('success', 'Plan actualizado');
            } else {
                await api.post('/admin/services', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast('success', 'Plan creado');
            }

            await cargarDatos();
            setDrawerOpen(false);

        } catch (error) {
            console.error(error);
            showToast('error', 'Error al guardar');
        } finally {
            setGuardando(false);
        }
    };

    const eliminarServicio = (id) => {
        pedirConfirmacion("¿Eliminar este plan de servicio?", async () => {
            try {
                await api.delete(`/admin/services/${id}`);
                setServices(services.filter(s => s.id !== id));
                showToast('success', 'Plan eliminado');
            } catch (error) {
                showToast('error', 'Error al eliminar');
            }
        });
    };

    // Filtros
    const filtrados = services.filter(s =>
        s.name.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) return <div className="h-screen flex items-center justify-center gap-2 text-atlas-900"><Loader2 className="animate-spin" /> Cargando Servicios...</div>;

    return (
        <div className="h-[calc(100vh-80px)] p-4 md:p-10 bg-gray-50/50 flex flex-col overflow-hidden relative">

            {/* NOTIFICACIÓN TOAST */}
            {toast.show && (
                <div className={`fixed top-24 right-4 md:right-10 z-[100] px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium text-sm">{toast.message}</span>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Servicios</h1>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">Administra los planes de suscripción</p>
                </div>
                <button onClick={() => abrirDrawer()} className="bg-atlas-900 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-atlas-800 transition-all flex items-center gap-2 text-sm md:text-base w-full md:w-auto justify-center">
                    <Plus size={20} /> Nuevo Plan
                </button>
            </div>

            {/* TABLA CONTAINER */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col flex-1 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/30 flex-shrink-0">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Buscar plan..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-atlas-200 outline-none text-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-100 text-left sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Servicio</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Duración</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Precio</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Beneficios</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtrados.length > 0 ? filtrados.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center relative flex-shrink-0">
                                                {s.image_url ? (
                                                    <img src={`${BASE_URL}${s.image_url}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Briefcase size={20} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm md:text-base">{s.name}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{s.description || 'Sin descripción'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                            s.duration_days === 30 ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            s.duration_days === 365 ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                            'bg-gray-50 text-gray-700 border-gray-200'
                                        }`}>
                                            {s.duration_days === 30 ? 'Mensual' : s.duration_days === 365 ? 'Anual' : `${s.duration_days} días`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">${parseInt(s.price).toLocaleString('es-CL')}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                                {s.features?.length || 0} ítems
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => abrirDrawer(s)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"><Edit size={18} /></button>
                                            <button onClick={() => eliminarServicio(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="p-10 text-center text-gray-400">No hay servicios registrados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL CONFIRMACIÓN --- */}
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

            {/* --- DRAWER FORMULARIO --- */}
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setDrawerOpen(false)} />
            <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 md:px-8 flex-shrink-0 bg-white">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{editando ? 'Editar Plan' : 'Nuevo Plan'}</h2>
                    <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                </div>

                <form onSubmit={guardarServicio} className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8 bg-gray-50/50">

                    {/* IMAGEN DEL SERVICIO */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <label className="text-sm font-bold text-gray-900 mb-4 w-full">Icono / Imagen del Plan</label>
                        <div onClick={() => fileInputRef.current.click()} className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-atlas-900 hover:bg-atlas-50 transition-all bg-gray-50 overflow-hidden relative group">
                            {form.previewUrl ? (
                                <>
                                    <img src={form.previewUrl} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit className="text-white" size={24} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={32} className="text-gray-400 group-hover:text-atlas-900 mb-2" />
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-atlas-900">Subir Imagen</span>
                                </>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                    </div>

                    {/* DATOS DEL SERVICIO */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nombre</label>
                                <input required type="text" className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-atlas-900 outline-none" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Plan Pro" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Precio (CLP)</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input required type="number" className="w-full pl-8 p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-atlas-900 outline-none" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Duración</label>
                            <select className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-atlas-900 outline-none appearance-none" value={form.duration_days} onChange={e => setForm({ ...form, duration_days: e.target.value })}>
                                <option value="30">Mensual (30 días)</option>
                                <option value="365">Anual (365 días)</option>
                                <option value="7">Semanal (7 días)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Descripción Corta</label>
                            <textarea rows="3" className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-atlas-900 outline-none resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Breve resumen del servicio..." />
                        </div>

                        {/* LISTA DINÁMICA DE FEATURES */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Beneficios Incluidos</label>
                            <div className="space-y-3">
                                {form.features.map((feature, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <div className="relative flex-1">
                                            <Check size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-atlas-900 outline-none text-sm"
                                                placeholder="Ej: Soporte 24/7"
                                            />
                                        </div>
                                        {form.features.length > 1 && (
                                            <button type="button" onClick={() => removeFeatureField(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><MinusCircle size={18} /></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addFeatureField} className="mt-3 text-xs font-bold text-atlas-600 hover:text-atlas-800 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-atlas-50 transition-colors">
                                <PlusCircle size={16} /> Agregar otro beneficio
                            </button>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 flex-shrink-0">
                    <button onClick={() => setDrawerOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={guardarServicio} disabled={guardando} className="px-8 py-3 bg-atlas-900 text-white font-bold rounded-xl hover:bg-atlas-800 shadow-lg flex items-center gap-2">
                        {guardando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Guardar
                    </button>
                </div>

            </div>

        </div>
    );
};

export default AdminServices;