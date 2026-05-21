import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { User, Mail, Phone, Save, Loader2, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import OrderClaimModal from './OrderClaimModal';
import { countryCodes, formatPhoneNumber } from '../../utils/phoneCodes';
import { useAuth } from '../../context/AuthContext';

const MiPerfil = ({ onOpenEmailModal }) => {
    const { user, setUser, checkAuth } = useAuth(); 
    const location = useLocation();
    const initialFullPhone = user?.phone || '';
    let initialCode = '+56';
    let initialNumber = initialFullPhone;

    const matchedCode = countryCodes.find(c => initialFullPhone.startsWith(c.code));
    if (matchedCode) {
        initialCode = matchedCode.code;
        initialNumber = initialFullPhone.slice(matchedCode.code.length).trim();
    }

    const [formData, setFormData] = useState({ 
        name: user?.name || '', 
        email: user?.email || '', 
        countryCode: initialCode,
        telefono: initialNumber
    });
    useEffect(() => {
        if (user) {
            const fullPhone = user.phone || '';
            let code = '+56';
            let num = fullPhone;

            const matched = countryCodes.find(c => fullPhone.startsWith(c.code));
            if (matched) {
                code = matched.code;
                num = fullPhone.slice(matched.code.length).trim();
            }

            setFormData({
                name: user.name || '',
                email: user.email || '',
                countryCode: code,
                telefono: num
            });
        }
    }, [user?.phone, user?.name, user?.email]);
    
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

    const handlePhoneChange = (e) => {
        const selectedCountry = countryCodes.find(c => c.code === formData.countryCode);
        const formatted = formatPhoneNumber(e.target.value, selectedCountry?.mask);
        setFormData({ ...formData, telefono: formatted });
    };

    const handleCountryCodeChange = (e) => {
        setFormData({ ...formData, countryCode: e.target.value, telefono: '' });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            name: formData.name,
            phone: formData.telefono ? `${formData.countryCode} ${formData.telefono}` : ''
        };

        try {
            const response = await api.put('/profile/update', payload);

            if (setUser) {
                setUser(response.data.user);
            } else if (checkAuth) {
                await checkAuth(); 
            }

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
                        <div className="flex relative">
                            <select 
                                value={formData.countryCode}
                                onChange={handleCountryCodeChange}
                                className="w-24 pl-2 pr-1 py-2 bg-gray-50 border border-gray-200 border-r-0 rounded-l-lg focus:bg-white outline-none cursor-pointer text-sm font-medium"
                            >
                                {countryCodes.map(c => (
                                    <option key={c.code} value={c.code}>{c.code}</option>
                                ))}
                            </select>
                            <div className="relative flex-1">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="tel" 
                                    value={formData.telefono} 
                                    onChange={handlePhoneChange} 
                                    className="w-full pl-9 pr-4 py-2 rounded-r-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-tenri-500 outline-none transition-all" 
                                    placeholder="9 0000 0000" 
                                />
                            </div>
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