import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Shield, Loader2, Smartphone, Monitor, Globe, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MiSeguridad = () => {
    // Estado para contraseña
    const [passData, setPassData] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
    const [loadingPass, setLoadingPass] = useState(false);

    // Estado para Logs
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/profile/security-logs');
            setLogs(data);
        } catch (error) {
            console.error("Error logs", error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoadingPass(true);
        try {
            await api.put('/profile/password', passData);
            toast.success('Contraseña actualizada correctamente');
            setPassData({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
        } finally {
            setLoadingPass(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">

            {/* SECCIÓN 1: CAMBIAR CONTRASEÑA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Contraseña y Autenticación</h2>
                        <p className="text-sm text-gray-500">Mantén tu cuenta segura con una contraseña fuerte.</p>
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                        <input
                            type="password"
                            value={passData.current_password}
                            onChange={(e) => setPassData({ ...passData, current_password: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-atlas-500 transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                            <input
                                type="password"
                                value={passData.new_password}
                                onChange={(e) => setPassData({ ...passData, new_password: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-atlas-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label>
                            <input
                                type="password"
                                value={passData.new_password_confirmation}
                                onChange={(e) => setPassData({ ...passData, new_password_confirmation: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-atlas-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={loadingPass} className="bg-atlas-900 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-atlas-800 flex items-center gap-2 disabled:opacity-50 transition-colors">
                            {loadingPass ? <Loader2 className="animate-spin" size={18} /> : 'Actualizar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>

            {/* SECCIÓN 2: HISTORIAL DE ACTIVIDAD (EL PLUS) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-50 p-2 rounded-lg text-green-600">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Actividad Reciente</h2>
                            <p className="text-sm text-gray-500">Últimos inicios de sesión detectados.</p>
                        </div>
                    </div>
                </div>

                {loadingLogs ? (
                    <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">No hay registros de actividad recientes.</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {logs.map((log) => (
                            <div key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <Monitor size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{log.action}</p>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1 font-medium text-atlas-700">
                                                <Globe size={10} /> {log.location}
                                            </span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>IP: {log.ip}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{log.date}</p>
                                    <p className="text-xs text-gray-400">{log.exact_date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-gray-50 p-3 text-center text-xs text-gray-500 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-1">
                        <AlertCircle size={12} />
                        Si no reconoces alguna actividad, cambia tu contraseña inmediatamente.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiSeguridad;