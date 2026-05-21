import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
    Save, Store, CreditCard, Truck, Shield, Lock, Globe,
    Loader2, CheckCircle, AlertCircle, Landmark, Wallet, ExternalLink, Info
} from 'lucide-react';

const DEFAULT_CONFIG = {
    store_name: '',
    contact_email: '',
    contact_phone: '',
    maintenance_mode: false,
    webpay_enabled: false,
    webpay_code: '',
    webpay_api_key: '',
    webpay_env: 'integration',
    free_shipping_threshold: 0,
    bank_name: '',
    bank_account_type: '',
    bank_account_number: '',
    bank_rut: '',
    bank_email: '',
};

const AdminConfig = () => {
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/admin/settings');
                const data = response.data || {};

                setConfig({
                    store_name: data.store_name ?? '',
                    contact_email: data.contact_email ?? '',
                    contact_phone: data.contact_phone ?? '',
                    maintenance_mode: parseBool(data.maintenance_mode),
                    webpay_enabled: parseBool(data.webpay_enabled),
                    webpay_code: data.webpay_code ?? '',
                    webpay_api_key: data.webpay_api_key ?? '',
                    webpay_env: data.webpay_env ?? 'integration',
                    free_shipping_threshold: parseInt(data.free_shipping_threshold ?? 0, 10) || 0,
                    bank_name: data.bank_name ?? '',
                    bank_account_type: data.bank_account_type ?? '',
                    bank_account_number: data.bank_account_number ?? '',
                    bank_rut: data.bank_rut ?? '',
                    bank_email: data.bank_email ?? '',
                });
            } catch (error) {
                console.error("Error:", error);
                showToast('error', 'Error cargando configuración');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const parseBool = (value) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value === 1;
        if (typeof value === 'string') return value === '1' || value === 'true';
        return false;
    };

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
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
            maintenance_mode: Boolean(config.maintenance_mode),
            webpay_enabled: Boolean(config.webpay_enabled),
            free_shipping_threshold: parseInt(config.free_shipping_threshold ?? 0, 10) || 0,
        };

        try {
            await api.post('/admin/settings', payload);
            showToast('success', 'Configuración guardada correctamente');
        } catch (error) {
            console.error(error);
            const status = error.response?.status;
            const body = error.response?.data;

            if (status === 422 && body?.errors) {
                const flat = Object.values(body.errors).flat().join(' ');
                showToast('error', flat || body?.message || 'Datos inválidos');
            } else {
                showToast('error', body?.message || 'Error al guardar cambios');
            }
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center gap-2 text-tenri-900"><Loader2 className="animate-spin" /> Cargando Configuración...</div>;

    const webpayMissingFields = config.webpay_enabled && (!config.webpay_code || !config.webpay_api_key);
    const transferMissingFields = !config.bank_name || !config.bank_account_number;

    return (
        <div className="h-[calc(100vh-80px)] overflow-y-auto p-6 md:p-10 custom-scrollbar relative pb-20">

            {toast.show && (
                <div className={`fixed top-24 right-4 md:right-10 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-tenri-900 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">Variables globales, métodos de pago y logística</p>
                </div>
                <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="bg-tenri-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-tenri-800 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center"
                >
                    {guardando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Guardar Cambios
                </button>
            </div>

            <form onSubmit={handleGuardar} className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">

                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Store size={20} /></div> Información General
                    </h2>
                    <div className="space-y-5">
                        <div>
                            <label className="label-config">Nombre de la Tienda</label>
                            <input type="text" name="store_name" value={config.store_name} onChange={handleChange} className="input-config" placeholder="Tenri Spa" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-config">Email de Contacto</label>
                                <input type="email" name="contact_email" value={config.contact_email} onChange={handleChange} className="input-config" placeholder="contacto@tenri.cl" />
                            </div>
                            <div>
                                <label className="label-config">Teléfono</label>
                                <input type="text" name="contact_phone" value={config.contact_phone} onChange={handleChange} className="input-config" placeholder="+56 9 ..." />
                            </div>
                        </div>

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

                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Landmark size={20} /></div> Datos de Transferencia
                        {transferMissingFields && (
                            <span className="ml-auto text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md flex items-center gap-1">
                                <AlertCircle size={10} /> INCOMPLETO
                            </span>
                        )}
                    </h2>
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-config">Nombre Banco</label>
                                <input type="text" name="bank_name" placeholder="Ej: Banco de Chile" value={config.bank_name} onChange={handleChange} className="input-config" />
                            </div>
                            <div>
                                <label className="label-config">Tipo de Cuenta</label>
                                <input type="text" name="bank_account_type" placeholder="Ej: Cuenta Corriente" value={config.bank_account_type} onChange={handleChange} className="input-config" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-config">Número de Cuenta</label>
                                <input type="text" name="bank_account_number" value={config.bank_account_number} onChange={handleChange} className="input-config font-mono" />
                            </div>
                            <div>
                                <label className="label-config">RUT Empresa</label>
                                <input type="text" name="bank_rut" value={config.bank_rut} onChange={handleChange} className="input-config" placeholder="12.345.678-9" />
                            </div>
                        </div>
                        <div>
                            <label className="label-config">Email para Comprobantes</label>
                            <input type="email" name="bank_email" value={config.bank_email} onChange={handleChange} className="input-config" placeholder="pagos@tenri.cl" />
                            <p className="text-[11px] text-gray-400 mt-1.5">El bot de procesamiento de transferencias monitorea esta casilla.</p>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                            <Wallet size={14} className="shrink-0 mt-0.5" />
                            <span>Estos datos se muestran al cliente cuando elige "Transferencia" en el checkout.</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CreditCard size={20} /></div> Configuración WebPay
                        {webpayMissingFields && (
                            <span className="ml-auto text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md flex items-center gap-1">
                                <AlertCircle size={10} /> FALTAN DATOS
                            </span>
                        )}
                    </h2>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <span className="text-sm font-bold text-gray-700 block">Habilitar Pagos Online</span>
                                <span className="text-xs text-gray-500">Mostrar Webpay como opción en checkout</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="webpay_enabled" checked={config.webpay_enabled} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-config flex items-center justify-between">
                                    <span>Entorno</span>
                                    {config.webpay_env === 'production' && (
                                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">EN VIVO</span>
                                    )}
                                </label>
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
                            <p className="text-[11px] text-gray-400 mt-1.5">No se mostrará al cargar de nuevo por seguridad. Vuelve a ingresarla si necesitas actualizarla.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Truck size={20} /></div> Logística
                        </h2>
                        <div>
                            <label className="label-config">Envío Gratis Desde ($)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input type="number" min="0" name="free_shipping_threshold" value={config.free_shipping_threshold} onChange={handleChange} className="w-full pl-8 p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1.5">Compras sobre este monto reciben envío gratis. Usa 0 para desactivar.</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Shield size={20} /></div> Seguridad de tu Cuenta
                        </h2>
                        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
                            <div className="text-sm text-blue-800">
                                <p className="font-bold mb-1">El cambio de contraseña vive en tu Perfil</p>
                                <p className="text-xs text-blue-700 leading-relaxed mb-3">
                                    Para mantener separadas las acciones de configuración del sistema y las de tu cuenta personal,
                                    la contraseña se cambia desde tu perfil de usuario, no desde aquí.
                                </p>
                                <Link
                                    to="/perfil"
                                    className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Ir a Mi Perfil <ExternalLink size={12} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </form>

            <style>{`
                .label-config { display: block; font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 0.25rem; }
                .input-config { width: 100%; padding: 0.75rem; background-color: #f9fafb; border-radius: 0.75rem; border: 1px solid transparent; outline: none; transition: all 0.2s; }
                .input-config:focus { background-color: white; box-shadow: 0 0 0 2px #0f172a; }
            `}</style>
        </div>
    );
};

export default AdminConfig;