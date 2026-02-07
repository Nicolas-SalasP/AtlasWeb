import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
    Save, Store, CreditCard, Truck, Shield, Lock, Globe,
    Loader2, CheckCircle, AlertCircle, Landmark, Wallet
} from 'lucide-react';

const AdminConfig = () => {
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // Configuración completa (incluyendo bancos)
    const [config, setConfig] = useState({
        // General
        store_name: '',
        contact_email: '',
        contact_phone: '',
        maintenance_mode: false,
        // WebPay
        webpay_enabled: false,
        webpay_code: '',
        webpay_api_key: '', // Agregado por si quieres editarlo también
        webpay_env: 'integration', // integration | production
        // Logística
        free_shipping_threshold: '',
        // Banco (NUEVO)
        bank_name: '',
        bank_account_type: '',
        bank_account_number: '',
        bank_rut: '',
        bank_email: '',
        // Seguridad (solo local, no se carga de BD)
        password_current: '',
        password_new: ''
    });

    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // 1. Cargar Configuración
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/admin/settings');
                const data = response.data;

                // Mapeamos la respuesta al estado
                setConfig(prev => ({
                    ...prev,
                    ...data,
                    // Aseguramos tipos correctos para los booleanos/números
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

        const payload = {
            ...config,
            webpay_enabled: config.webpay_enabled ? '1' : '0',
            maintenance_mode: config.maintenance_mode ? '1' : '0'
        };

        try {
            await api.post('/admin/settings', payload);
            showToast('success', 'Configuración guardada correctamente');
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
        <div className="h-[calc(100vh-80px)] overflow-y-auto p-6 md:p-10 custom-scrollbar relative pb-20">

            {/* TOAST FLOTANTE */}
            {toast.show && (
                <div className={`fixed top-24 right-10 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium text-sm">{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
                    <p className="text-gray-500 mt-1">Variables globales, métodos de pago y seguridad</p>
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

            <form className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">

                {/* 1. GENERAL */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Store size={20} /></div> Información General
                    </h2>
                    <div className="space-y-5">
                        <div>
                            <label className="label-config">Nombre de la Tienda</label>
                            <input type="text" name="store_name" value={config.store_name} onChange={handleChange} className="input-config" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-config">Email Contacto</label>
                                <input type="email" name="contact_email" value={config.contact_email} onChange={handleChange} className="input-config" />
                            </div>
                            <div>
                                <label className="label-config">Teléfono</label>
                                <input type="text" name="contact_phone" value={config.contact_phone} onChange={handleChange} className="input-config" />
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

                {/* 2. DATOS BANCARIOS (NUEVA SECCIÓN) */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Landmark size={20} /></div> Datos de Transferencia
                    </h2>
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-config">Nombre Banco</label>
                                <input type="text" name="bank_name" placeholder="Ej: Banco de Chile" value={config.bank_name} onChange={handleChange} className="input-config" />
                            </div>
                            <div>
                                <label className="label-config">Tipo de Cuenta</label>
                                <input type="text" name="bank_account_type" placeholder="Ej: Cuenta Corriente" value={config.bank_account_type} onChange={handleChange} className="input-config" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-config">Número de Cuenta</label>
                                <input type="text" name="bank_account_number" value={config.bank_account_number} onChange={handleChange} className="input-config font-mono" />
                            </div>
                            <div>
                                <label className="label-config">RUT Empresa</label>
                                <input type="text" name="bank_rut" value={config.bank_rut} onChange={handleChange} className="input-config" />
                            </div>
                        </div>
                        <div>
                            <label className="label-config">Email para Comprobantes</label>
                            <input type="email" name="bank_email" value={config.bank_email} onChange={handleChange} className="input-config" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 p-3 rounded-lg">
                            <Wallet size={14} />
                            Estos datos se mostrarán al cliente al elegir "Transferencia".
                        </div>
                    </div>
                </div>

                {/* 3. WEBPAY */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CreditCard size={20} /></div> Configuración WebPay
                    </h2>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-700">Habilitar Pagos Online</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="webpay_enabled" checked={config.webpay_enabled} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-config">Entorno</label>
                                <select name="webpay_env" value={config.webpay_env} onChange={handleChange} className="input-config">
                                    <option value="integration">Integración (Pruebas)</option>
                                    <option value="production">Producción (Real)</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-config">Código Comercio</label>
                                <input type="text" name="webpay_code" value={config.webpay_code} onChange={handleChange} className="input-config font-mono" placeholder="5970..." />
                            </div>
                        </div>
                        <div>
                            <label className="label-config">API Key (Secreta)</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="password" name="webpay_api_key" value={config.webpay_api_key} onChange={handleChange} className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-green-600 outline-none transition-all font-mono" placeholder="••••••••••••" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. SEGURIDAD & LOGÍSTICA */}
                <div className="space-y-8">
                    {/* Logística */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Truck size={20} /></div> Logística
                        </h2>
                        <div>
                            <label className="label-config">Envío Gratis Desde ($)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input type="number" name="free_shipping_threshold" value={config.free_shipping_threshold} onChange={handleChange} className="w-full pl-8 p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Seguridad */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Shield size={20} /></div> Seguridad Admin
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="label-config">Contraseña Actual</label>
                                <input type="password" name="password_current" value={config.password_current} onChange={handleChange} className="input-config" placeholder="••••••" />
                            </div>
                            <div>
                                <label className="label-config">Nueva Contraseña</label>
                                <input type="password" name="password_new" value={config.password_new} onChange={handleChange} className="input-config" placeholder="••••••" />
                            </div>
                        </div>
                    </div>
                </div>

            </form>

            {/* Styles inject */}
            <style>{`
                .label-config { display: block; font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 0.25rem; }
                .input-config { width: 100%; padding: 0.75rem; background-color: #f9fafb; border-radius: 0.75rem; border: 1px solid transparent; outline: none; transition: all 0.2s; }
                .input-config:focus { background-color: white; box-shadow: 0 0 0 2px #0f172a; }
            `}</style>
        </div>
    );
};

export default AdminConfig;