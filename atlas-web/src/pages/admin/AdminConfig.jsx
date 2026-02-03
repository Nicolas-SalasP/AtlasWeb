import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Save, Store, CreditCard, Truck, Shield, Lock, Globe, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const AdminConfig = () => {
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // Configuración inicial (se sobreescribe con la API)
    const [config, setConfig] = useState({
        store_name: '',
        contact_email: '',
        contact_phone: '',
        webpay_enabled: false,
        webpay_code: '',
        free_shipping_threshold: '',
        maintenance_mode: false,
        password_current: '', // Campos especiales (no van a system_settings)
        password_new: ''
    });

    // Toasts (Notificaciones)
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // 1. Cargar Configuración
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/admin/settings');
                // Convertir strings "1"/"0" a booleanos para los checkbox
                const data = response.data;
                setConfig(prev => ({
                    ...prev,
                    ...data,
                    webpay_enabled: data.webpay_enabled == '1',
                    maintenance_mode: data.maintenance_mode == '1',
                    free_shipping_threshold: parseInt(data.free_shipping_threshold || 0)
                }));
            } catch (error) {
                console.error("Error:", error);
                showToast('error', 'Error cargando configuración');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // Helper Toast
    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig({
            ...config,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);

        // Preparamos datos (convertir booleanos a 1/0 para la BD)
        const payload = {
            ...config,
            webpay_enabled: config.webpay_enabled ? '1' : '0',
            maintenance_mode: config.maintenance_mode ? '1' : '0'
        };

        try {
            await api.post('/admin/settings', payload);
            showToast('success', 'Configuración guardada correctamente');
            // Limpiar campos de password por seguridad
            setConfig(prev => ({ ...prev, password_current: '', password_new: '' }));
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error al guardar cambios';
            showToast('error', msg);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center gap-2 text-atlas-900"><Loader2 className="animate-spin" /> Cargando Configuración...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 p-6 md:p-10 relative">

            {/* TOAST FLOTANTE */}
            {toast.show && (
                <div className={`fixed top-24 right-10 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium text-sm">{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
                    <p className="text-gray-500 mt-1">Variables globales de la tienda y seguridad</p>
                </div>
                <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="bg-atlas-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-atlas-800 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                    {guardando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Guardar Cambios
                </button>
            </div>

            <form className="grid lg:grid-cols-2 gap-8">

                {/* 1. GENERAL */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Store size={20} /></div> Información General
                    </h2>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de la Tienda</label>
                            <input type="text" name="store_name" value={config.store_name} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-900 outline-none transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Contacto</label>
                                <input type="email" name="contact_email" value={config.contact_email} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-900 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                                <input type="text" name="contact_phone" value={config.contact_phone} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-900 outline-none transition-all" />
                            </div>
                        </div>

                        {/* Mantenimiento */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${config.maintenance_mode ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <Globe className={config.maintenance_mode ? "text-orange-500" : "text-gray-400"} size={22} />
                                <div>
                                    <span className={`block text-sm font-bold ${config.maintenance_mode ? 'text-orange-700' : 'text-gray-700'}`}>Modo Mantenimiento</span>
                                    <span className="text-xs text-gray-500">Tienda cerrada al público</span>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="maintenance_mode" checked={config.maintenance_mode} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 2. PAGOS & API */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CreditCard size={20} /></div> Pagos (WebPay)
                    </h2>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-700">Habilitar WebPay Plus</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="webpay_enabled" checked={config.webpay_enabled} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código de Comercio</label>
                            <input type="text" name="webpay_code" value={config.webpay_code} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-green-600 outline-none transition-all font-mono" />
                            <p className="text-[10px] text-gray-400 mt-1 ml-1">Código entregado por Transbank (Integración)</p>
                        </div>
                    </div>
                </div>

                {/* 3. ENVÍOS */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Truck size={20} /></div> Logística
                    </h2>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Envío Gratis Desde ($)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input type="number" name="free_shipping_threshold" value={config.free_shipping_threshold} onChange={handleChange} className="w-full pl-8 p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed">
                            <strong>Nota:</strong> Las tarifas específicas por comuna se gestionan en el mantenedor de base de datos geográfica.
                        </div>
                    </div>
                </div>

                {/* 4. SEGURIDAD */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Shield size={20} /></div> Seguridad Admin
                    </h2>
                    <div className="space-y-5">
                        <p className="text-xs text-gray-400">Deja estos campos vacíos si no quieres cambiar tu contraseña.</p>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña Actual</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="password" name="password_current" value={config.password_current} onChange={handleChange} className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nueva Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="password" name="password_new" value={config.password_new} onChange={handleChange} className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default AdminConfig;