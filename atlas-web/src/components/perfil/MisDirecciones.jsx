import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Star, Home, Briefcase, Loader2, ChevronDown, Building, AlertTriangle, X } from 'lucide-react';
import api from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { regiones } from '../../api/chileData';

const MisDirecciones = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        alias: '',
        address: '', 
        number: '',  
        depto: '',   
        region: '',
        commune: ''
    });

    const regionSeleccionada = regiones.find(r => r.nombre === formData.region);
    const comunasDisponibles = regionSeleccionada ? regionSeleccionada.comunas : [];

    const fetchAddresses = async () => {
        try {
            const res = await api.get('/addresses');
            setAddresses(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/addresses', formData);
            toast.success('Dirección guardada correctamente');
            setShowForm(false);
            setFormData({ alias: '', address: '', number: '', depto: '', region: '', commune: '' });
            fetchAddresses();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar la dirección. Verifica los datos.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await api.put(`/addresses/${id}/default`);
            toast.success('Dirección principal actualizada');
            fetchAddresses();
        } catch (error) { toast.error('Error al actualizar'); }
    };

    const requestDelete = (id) => {
        setAddressToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!addressToDelete) return;
        setDeleting(true);
        try {
            await api.delete(`/addresses/${addressToDelete}`);
            toast.success('Eliminada');
            fetchAddresses();
            setShowDeleteModal(false);
            setAddressToDelete(null);
        } catch (error) { 
            toast.error('Error al eliminar'); 
        } finally {
            setDeleting(false);
        }
    };

    const getIcon = (alias) => {
        const lower = alias.toLowerCase();
        if (lower.includes('casa')) return <Home size={20} />;
        if (lower.includes('oficina') || lower.includes('trabajo')) return <Briefcase size={20} />;
        if (lower.includes('edificio') || lower.includes('depto')) return <Building size={20} />;
        return <MapPin size={20} />;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando direcciones...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Mis Direcciones</h2>
                    <p className="text-sm text-gray-500">Gestiona tus lugares de entrega frecuentes</p>
                </div>
                {!showForm && (
                    <button 
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-atlas-900 text-white px-4 py-2 rounded-xl hover:bg-atlas-800 transition-all shadow-md text-sm font-bold active:scale-95"
                    >
                        <Plus size={18} /> Nueva Dirección
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm animate-in zoom-in-95 duration-300">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-atlas-600"/> Agregar Nueva Dirección
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Alias (Nombre corto)</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlas-500 outline-none bg-white transition-all"
                                value={formData.alias}
                                onChange={e => setFormData({...formData, alias: e.target.value})}
                                placeholder="Ej: Casa, Oficina Centro, Depto Playa..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Calle / Avenida</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlas-500 outline-none bg-white transition-all"
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                placeholder="Ej: Av. Providencia"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Número</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlas-500 outline-none bg-white transition-all"
                                value={formData.number}
                                onChange={e => setFormData({...formData, number: e.target.value})}
                                placeholder="Ej: 1234"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Depto / Oficina (Opcional)</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlas-500 outline-none bg-white transition-all"
                                value={formData.depto}
                                onChange={e => setFormData({...formData, depto: e.target.value})}
                                placeholder="Ej: 402-B"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Región</label>
                            <div className="relative">
                                <select 
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlas-500 outline-none appearance-none bg-white cursor-pointer transition-all"
                                    value={formData.region}
                                    onChange={e => {
                                        setFormData({...formData, region: e.target.value, commune: ''});
                                    }}
                                >
                                    <option value="" disabled>Selecciona una región</option>
                                    {regiones.map(r => (
                                        <option key={r.nombre} value={r.nombre}>{r.nombre}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none bg-white pl-1" size={16} />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Comuna</label>
                            <div className="relative">
                                <select 
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlas-500 outline-none appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                                    value={formData.commune}
                                    onChange={e => setFormData({...formData, commune: e.target.value})}
                                    disabled={!formData.region}
                                >
                                    <option value="" disabled>
                                        {formData.region ? "Selecciona una comuna" : "Primero elige región"}
                                    </option>
                                    {comunasDisponibles.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none bg-white pl-1" size={16} />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t border-gray-200 pt-4">
                            <button 
                                type="button" 
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-white border border-transparent hover:border-gray-300 rounded-lg text-sm font-medium transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="px-6 py-2 bg-atlas-900 text-white rounded-lg hover:bg-atlas-800 text-sm font-bold shadow-md flex items-center gap-2"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin"/> : 'Guardar Dirección'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {addresses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <MapPin size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No tienes direcciones guardadas</h3>
                    <p className="text-gray-500 mt-1">Agrega una dirección para agilizar tus compras.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                        <div 
                            key={addr.id} 
                            className={`p-5 rounded-xl border transition-all relative group ${
                                addr.is_default 
                                ? 'bg-white border-atlas-600 shadow-md ring-1 ring-atlas-600' 
                                : 'bg-white border-gray-200 hover:border-atlas-300 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2.5 rounded-lg ${addr.is_default ? 'bg-atlas-100 text-atlas-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {getIcon(addr.alias)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{addr.alias}</h4>
                                        {addr.is_default && (
                                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black text-atlas-700 bg-atlas-50 px-2 py-0.5 rounded-full border border-atlas-100">
                                                <Star size={10} fill="currentColor" /> Principal
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex gap-1">
                                    {!addr.is_default && (
                                        <button 
                                            onClick={() => handleSetDefault(addr.id)}
                                            title="Marcar como principal"
                                            className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                                        >
                                            <Star size={18} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => requestDelete(addr.id)}
                                        title="Eliminar"
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-2 pl-[3.5rem] text-sm text-gray-600 space-y-1">
                                <p className="font-medium text-gray-900">
                                    {addr.address} #{addr.number} {addr.depto ? `Dpto ${addr.depto}` : ''}
                                </p>
                                <p className="text-gray-500 flex items-center gap-1">
                                    {addr.commune}, {addr.region}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-100 text-red-600 rounded-full">
                                <AlertTriangle size={24} />
                            </div>
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            ¿Eliminar dirección?
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Esta acción no se puede deshacer. La dirección se borrará permanentemente de tu lista.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                                disabled={deleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm flex items-center gap-2"
                                disabled={deleting}
                            >
                                {deleting ? <Loader2 size={16} className="animate-spin" /> : 'Sí, eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisDirecciones;