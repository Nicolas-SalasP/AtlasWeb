import React, { useState } from 'react';
import { Save, Store, CreditCard, Truck, Shield, Lock, Globe } from 'lucide-react';
import AlertModal from '../../components/AlertModal';

const AdminConfig = () => {
    // Estado Simulado de Configuración
    const [config, setConfig] = useState({
        nombreTienda: 'Atlas Digital Tech',
        emailContacto: 'contacto@atlasdigital.cl',
        telefono: '+56 9 1234 5678',
        moneda: 'CLP',
        webpayEnabled: true,
        webpayCommerceCode: '597012345678',
        envioGratisDesde: 100000,
        modoMantenimiento: false,
        passwordActual: '',
        passwordNueva: ''
    });

    const [modal, setModal] = useState({ open: false, type: 'success', title: '', message: '' });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig({
            ...config,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleGuardar = (e) => {
        e.preventDefault();
        // AQUÍ SE ENVIARÍA A LARAVEL (API)
        setModal({
            open: true,
            type: 'success',
            title: 'Configuración Guardada',
            message: 'Los cambios han sido aplicados correctamente en el sistema.'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            <AlertModal
                isOpen={modal.open} onClose={() => setModal({ ...modal, open: false })}
                type={modal.type} title={modal.title} message={modal.message}
            />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Configuración del Sistema</h1>
                    <p className="text-gray-500">Gestiona las variables globales de tu tienda y ERP</p>
                </div>
                <button
                    onClick={handleGuardar}
                    className="bg-atlas-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-atlas-800 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Save size={20} /> Guardar Cambios
                </button>
            </div>

            <form className="grid lg:grid-cols-2 gap-8">

                {/* 1. GENERAL */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b">
                        <Store className="text-atlas-500" /> Información General
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Tienda</label>
                            <input type="text" name="nombreTienda" value={config.nombreTienda} onChange={handleChange} className="input-config" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Contacto</label>
                                <input type="email" name="emailContacto" value={config.emailContacto} onChange={handleChange} className="input-config" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Soporte</label>
                                <input type="text" name="telefono" value={config.telefono} onChange={handleChange} className="input-config" />
                            </div>
                        </div>

                        {/* Switch Modo Mantenimiento */}
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
                            <div className="flex items-center gap-3">
                                <Globe className="text-gray-400" size={20} />
                                <div>
                                    <span className="block text-sm font-bold text-gray-700">Modo Mantenimiento</span>
                                    <span className="text-xs text-gray-500">Si activas esto, la tienda pública mostrará una página de "En construcción".</span>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="modoMantenimiento" checked={config.modoMantenimiento} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-atlas-900"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 2. PAGOS & API */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b">
                        <CreditCard className="text-green-600" /> Pasarelas de Pago
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-700">Habilitar WebPay Plus (Transbank)</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="webpayEnabled" checked={config.webpayEnabled} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Código de Comercio (Commerce Code)</label>
                            <input type="text" name="webpayCommerceCode" value={config.webpayCommerceCode} onChange={handleChange} className="input-config font-mono" />
                            <p className="text-xs text-gray-400 mt-1">Este código te lo entrega Transbank.</p>
                        </div>
                    </div>
                </div>

                {/* 3. ENVÍOS */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b">
                        <Truck className="text-blue-600" /> Logística de Envíos
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monto para Envío Gratis ($)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input type="number" name="envioGratisDesde" value={config.envioGratisDesde} onChange={handleChange} className="input-config pl-8" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Si el carrito supera este monto, el envío se marca como $0.</p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                            <p className="font-bold mb-1">Nota:</p>
                            Las tarifas por región (Metropolitana, Biobío, etc.) se configuran directamente en la base de datos o en el módulo de "Zonas de Despacho".
                        </div>
                    </div>
                </div>

                {/* 4. SEGURIDAD ADMIN */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b">
                        <Shield className="text-red-500" /> Seguridad de Cuenta
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar Contraseña Admin</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="password"
                                    name="passwordActual"
                                    placeholder="Contraseña Actual"
                                    value={config.passwordActual} onChange={handleChange}
                                    className="input-config pl-10 mb-2"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="password"
                                    name="passwordNueva"
                                    placeholder="Nueva Contraseña"
                                    value={config.passwordNueva} onChange={handleChange}
                                    className="input-config pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
};

// Estilo CSS encapsulado para inputs repetitivos (Reutilización limpia)
const inputClass = "w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-atlas-300 focus:border-transparent outline-none transition-all";

export default AdminConfig;