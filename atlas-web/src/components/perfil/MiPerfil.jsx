import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { User, Mail, Phone, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MiPerfil = ({ user, onOpenEmailModal }) => {
    const [formData, setFormData] = useState({ 
        name: user?.name || '', 
        email: user?.email || '', 
        phone: user?.phone || '' 
    });
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/profile/update', formData);
            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            toast.error('Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Datos Personales</h2>
            <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-atlas-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-atlas-500 outline-none" placeholder="+56 9 ..." />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="email" value={formData.email} disabled className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" />
                        </div>
                        <button type="button" onClick={onOpenEmailModal} className="px-4 py-2 text-sm font-bold text-atlas-900 bg-atlas-50 hover:bg-atlas-100 rounded-lg border border-atlas-200">Cambiar</button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Requiere verificación por código.</p>
                </div>
                <div className="pt-4 border-t border-gray-50 flex justify-end">
                    <button type="submit" disabled={loading} className="bg-atlas-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-atlas-800 transition-all flex items-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MiPerfil;