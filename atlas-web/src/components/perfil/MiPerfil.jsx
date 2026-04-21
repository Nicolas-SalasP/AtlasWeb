import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { User, Mail, Phone, Save, Loader2, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import OrderClaimModal from './OrderClaimModal';

const MiPerfil = ({ user, onOpenEmailModal }) => {
    const location = useLocation();
    const [formData, setFormData] = useState({ 
        name: user?.name || '', 
        email: user?.email || '', 
        phone: user?.phone || '' 
    });
    const [loading, setLoading] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [pendingClaims, setPendingClaims] = useState(() => {
        const saved = localStorage.getItem('pending_claims');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (location.state?.showClaimModal) {
            setShowClaimModal(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleDismissClaims = () => {
        localStorage.removeItem('pending_claims');
        setPendingClaims(null);
        toast.success('Aviso ocultado. Si tienes compras previas seguirán seguras.');
    };

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in relative">
            
            <OrderClaimModal 
                isOpen={showClaimModal} 
                onClose={() => setShowClaimModal(false)}
                claimableEmails={location.state?.claimableEmails || pendingClaims || []}
                onSuccess={(updatedOrdersCount) => {
                    toast.success(`¡Excelente! Se vincularon ${updatedOrdersCount} órdenes a tu cuenta.`);
                    // handleDismissClaims(); 
                }}
            />

            {pendingClaims && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-3">
                        <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold text-sm text-blue-900">Tienes compras anteriores</h4>
                            <p className="text-xs text-blue-700 mt-1">
                                Hemos detectado compras asociadas a tu RUT hechas como invitado.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                            onClick={() => setShowClaimModal(true)} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition w-full sm:w-auto"
                        >
                            Vincular
                        </button>
                        <button 
                            onClick={handleDismissClaims} 
                            className="bg-transparent border border-blue-300 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition w-full sm:w-auto"
                        >
                            Ignorar
                        </button>
                    </div>
                </div>
            )}

            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Datos Personales</h2>
            
            <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-tenri-500 outline-none" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                value={formData.phone} 
                                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-tenri-500 outline-none" 
                                placeholder="+56 9 ..." 
                            />
                        </div>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="email" 
                                value={formData.email} 
                                disabled 
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" 
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={onOpenEmailModal} 
                            className="px-4 py-2 text-sm font-bold text-tenri-900 bg-tenri-50 hover:bg-tenri-100 rounded-lg border border-tenri-200"
                        >
                            Cambiar
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Requiere verificación por código.</p>
                </div>
                
                <div className="pt-4 border-t border-gray-50 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="bg-tenri-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-tenri-800 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MiPerfil;