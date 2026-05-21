import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Building2, Briefcase, MapPin, Mail, Star, Edit, Trash2, Plus, Loader2, FileText } from 'lucide-react';
import AlertModal from '../AlertModal';

const MisEmpresas = () => {
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        rut: '',
        business_name: '',
        business_line: '',
        address: '',
        city: '',
        email_dte: '',
        is_default: false
    });

    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', variant: 'error' });

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const fetchEmpresas = async () => {
        try {
            const response = await api.get('/billing-profiles');
            setEmpresas(response.data);
        } catch (error) {
            console.error("Error cargando empresas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (empresa = null) => {
        if (empresa) {
            setFormData(empresa);
            setEditingId(empresa.id);
        } else {
            setFormData({
                rut: '', business_name: '', business_line: '',
                address: '', city: '', email_dte: '',
                is_default: empresas.length === 0
            });
            setEditingId(null);
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/billing-profiles/${editingId}`, formData);
            } else {
                await api.post('/billing-profiles', formData);
            }
            setModalOpen(false);
            fetchEmpresas();
        } catch (error) {
            const msg = error.response?.data?.message || 'Verifica los datos e intenta nuevamente.';
            setAlertModal({ show: true, title: 'Error al guardar', message: msg, variant: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este perfil de facturación?")) return;

        try {
            await api.delete(`/billing-profiles/${id}`);
            fetchEmpresas();
        } catch (error) {
            setAlertModal({ show: true, title: 'Error al eliminar', message: 'No se pudo eliminar la empresa.', variant: 'error' });
        }
    };

    const setAsDefault = async (empresa) => {
        try {
            await api.put(`/billing-profiles/${empresa.id}`, { ...empresa, is_default: true });
            fetchEmpresas();
        } catch (error) {
            console.error("Error cambiando perfil por defecto", error);
        }
    };

    const formatRUT = (rut) => {
        let value = rut.replace(/[^0-9kK]+/g, '').toUpperCase();
        if (value.length <= 1) return value;
        let body = value.slice(0, -1);
        let dv = value.slice(-1);
        body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return `${body}-${dv}`;
    };

    if (loading) return <div className="flex justify-center items-center h-40 text-tenri-900"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Perfiles de Facturación</h3>
                    <p className="text-sm text-gray-500">Gestiona los datos legales (RUT, Razón Social) para la emisión de tus facturas.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-tenri-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-tenri-800 transition-all flex items-center gap-2"
                >
                    <Plus size={18} /> Agregar Empresa
                </button>
            </div>

            {empresas.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 mb-4">
                        <Building2 size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">No tienes empresas registradas</h4>
                    <p className="text-gray-500 text-sm max-w-sm">Si necesitas solicitar factura en tus compras, agrega los datos de tu empresa aquí.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {empresas.map((empresa) => (
                        <div key={empresa.id} className={`bg-white border rounded-2xl p-5 transition-all relative overflow-hidden group ${empresa.is_default ? 'border-tenri-900 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>

                            {empresa.is_default && (
                                <div className="absolute top-0 right-0 bg-tenri-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1">
                                    <Star size={10} className="fill-white" /> Predeterminada
                                </div>
                            )}

                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 leading-tight">{empresa.business_name}</h4>
                                    <p className="text-xs font-bold text-gray-400 mt-0.5">RUT: {empresa.rut}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <p className="text-sm text-gray-600 flex items-start gap-2"><FileText size={16} className="text-gray-400 shrink-0 mt-0.5" /> <span className="line-clamp-1">{empresa.business_line}</span></p>
                                <p className="text-sm text-gray-600 flex items-start gap-2"><MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" /> <span className="line-clamp-1">{empresa.address}, {empresa.city}</span></p>
                                <p className="text-sm text-gray-600 flex items-start gap-2"><Mail size={16} className="text-gray-400 shrink-0 mt-0.5" /> <span className="line-clamp-1">{empresa.email_dte || 'Sin email DTE'}</span></p>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                {!empresa.is_default && (
                                    <button onClick={() => setAsDefault(empresa)} className="text-xs font-bold text-gray-500 hover:text-tenri-900 transition-colors mr-auto">
                                        Fijar por defecto
                                    </button>
                                )}
                                <button onClick={() => handleOpenModal(empresa)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Editar"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(empresa.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Eliminar"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Editar Empresa' : 'Nueva Empresa'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"><Trash2 className="hidden" />X</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">RUT de la Empresa *</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-tenri-900 outline-none transition-all" value={formData.rut} onChange={e => setFormData({...formData, rut: formatRUT(e.target.value)})} placeholder="Ej: 76.000.000-K" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Razón Social *</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-tenri-900 outline-none transition-all" value={formData.business_name} onChange={e => setFormData({ ...formData, business_name: e.target.value })} placeholder="Ej: Tenri SpA" required />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Giro Comercial *</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-tenri-900 outline-none transition-all" value={formData.business_line} onChange={e => setFormData({ ...formData, business_line: e.target.value })} placeholder="Ej: Servicios informáticos" required />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Dirección Comercial *</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-tenri-900 outline-none transition-all" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Ej: Av. Providencia 1234, Of 50" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Comuna / Ciudad *</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-tenri-900 outline-none transition-all" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Ej: Providencia" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email recepción DTE</label>
                                    <input type="email" className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-tenri-900 outline-none transition-all" value={formData.email_dte} onChange={e => setFormData({ ...formData, email_dte: e.target.value })} placeholder="facturacion@empresa.cl" />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer mt-2 group">
                                <input type="checkbox" className="w-5 h-5 text-tenri-900 rounded focus:ring-tenri-900 focus:ring-2 cursor-pointer" checked={formData.is_default} onChange={e => setFormData({ ...formData, is_default: e.target.checked })} />
                                <div>
                                    <span className="block font-bold text-sm text-gray-800">Usar como predeterminada</span>
                                    <span className="block text-xs text-gray-500">Seleccionaremos esta empresa automáticamente en el checkout.</span>
                                </div>
                            </label>

                            <div className="flex gap-3 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-3.5 bg-tenri-900 text-white font-bold rounded-xl hover:bg-tenri-800 shadow-lg transition-all">Guardar Empresa</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AlertModal
                isOpen={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                variant={alertModal.variant}
            />
        </div>
    );
};

export default MisEmpresas;