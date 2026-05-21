import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
    Shield, Loader2, Smartphone, Monitor, Globe, AlertCircle,
    Clock, Eye, EyeOff, KeyRound, MapPin, History, Sparkles,
    CheckCircle, Laptop, Tablet, ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DEVICE_ICONS = {
    Mobile:  Smartphone,
    Tablet:  Tablet,
    Desktop: Laptop,
};

const PASSWORD_REQUIREMENTS = [
    { test: (p) => p.length >= 8,           label: 'Mínimo 8 caracteres' },
    { test: (p) => /[A-Z]/.test(p),         label: 'Una mayúscula' },
    { test: (p) => /[a-z]/.test(p),         label: 'Una minúscula' },
    { test: (p) => /\d/.test(p),            label: 'Un número' },
];

const MiSeguridad = () => {
    const [passData, setPassData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [show, setShow] = useState({ current: false, next: false, confirm: false });
    const [loadingPass, setLoadingPass] = useState(false);
    const [errors, setErrors] = useState({});

    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/profile/security-logs');
            setLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error logs", error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setErrors({});

        if (passData.new_password !== passData.new_password_confirmation) {
            setErrors({ new_password_confirmation: 'Las contraseñas no coinciden' });
            return;
        }

        const failedRequirement = PASSWORD_REQUIREMENTS.find(r => !r.test(passData.new_password));
        if (failedRequirement) {
            setErrors({ new_password: `La contraseña no cumple: ${failedRequirement.label}` });
            return;
        }

        setLoadingPass(true);
        try {
            await api.put('/profile/password', passData);
            toast.success('Contraseña actualizada correctamente');
            setPassData({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (error) {
            const body = error.response?.data;
            if (body?.errors) {
                setErrors(Object.fromEntries(
                    Object.entries(body.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
                ));
            } else {
                toast.error(body?.message || 'Error al cambiar contraseña');
            }
        } finally {
            setLoadingPass(false);
        }
    };

    return (
        <div className="space-y-5 animate-in fade-in">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 md:p-6 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
                            <KeyRound size={18} />
                        </div>
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 mb-1.5">
                                <Sparkles size={9} /> Autenticación
                            </span>
                            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Cambiar contraseña</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Mantené tu cuenta segura con una contraseña fuerte.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="p-5 md:p-6 space-y-4">
                    <PasswordField
                        label="Contraseña actual"
                        value={passData.current_password}
                        onChange={(v) => setPassData({ ...passData, current_password: v })}
                        visible={show.current}
                        onToggle={() => setShow({ ...show, current: !show.current })}
                        error={errors.current_password}
                        autoComplete="current-password"
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                        <PasswordField
                            label="Nueva contraseña"
                            value={passData.new_password}
                            onChange={(v) => setPassData({ ...passData, new_password: v })}
                            visible={show.next}
                            onToggle={() => setShow({ ...show, next: !show.next })}
                            error={errors.new_password}
                            autoComplete="new-password"
                        />
                        <PasswordField
                            label="Confirmar"
                            value={passData.new_password_confirmation}
                            onChange={(v) => setPassData({ ...passData, new_password_confirmation: v })}
                            visible={show.confirm}
                            onToggle={() => setShow({ ...show, confirm: !show.confirm })}
                            error={errors.new_password_confirmation}
                            autoComplete="new-password"
                        />
                    </div>

                    {passData.new_password && (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 grid grid-cols-2 gap-2">
                            {PASSWORD_REQUIREMENTS.map((req, i) => {
                                const ok = req.test(passData.new_password);
                                return (
                                    <div key={i} className={`flex items-center gap-1.5 text-xs font-medium ${ok ? 'text-emerald-700' : 'text-gray-400'}`}>
                                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${ok ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                                            {ok && <CheckCircle size={9} />}
                                        </div>
                                        {req.label}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="pt-1">
                        <button
                            type="submit"
                            disabled={loadingPass || !passData.current_password || !passData.new_password}
                            className="bg-tenri-900 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-tenri-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm group"
                        >
                            {loadingPass ? (
                                <><Loader2 className="animate-spin" size={16} /> Actualizando...</>
                            ) : (
                                <>
                                    Actualizar contraseña
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 md:p-6 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
                            <History size={18} />
                        </div>
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 mb-1.5">
                                <Shield size={9} /> Auditoría
                            </span>
                            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Actividad reciente</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Últimos eventos de seguridad detectados en tu cuenta.</p>
                        </div>
                    </div>
                </div>

                {loadingLogs ? (
                    <div className="p-12 flex items-center justify-center gap-2 text-tenri-900">
                        <Loader2 className="animate-spin" size={18} />
                        <span className="text-sm font-medium">Cargando actividad...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <History size={22} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-bold text-gray-700 mb-1">Sin actividad reciente</p>
                        <p className="text-xs text-gray-500">Los eventos de seguridad aparecerán acá cuando los detectemos.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {logs.map((log) => {
                            const DeviceIcon = DEVICE_ICONS[log.device] || Monitor;
                            const isFailure = (log.action || '').toLowerCase().includes('fallido');

                            return (
                                <div key={log.id} className="p-4 md:p-5 hover:bg-gray-50/60 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isFailure ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                            <DeviceIcon size={16} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                                                <p className={`text-sm font-bold ${isFailure ? 'text-red-700' : 'text-gray-900'}`}>
                                                    {log.action}
                                                </p>
                                                <span className="text-[11px] text-gray-400 font-medium shrink-0">{log.date}</span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                                {log.location && log.location !== 'Ubicación desconocida' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-tenri-50 text-tenri-700 rounded border border-tenri-100 font-medium">
                                                        <MapPin size={9} /> {log.location}
                                                    </span>
                                                )}
                                                {log.browser && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                                                        <Globe size={9} /> {log.browser}
                                                    </span>
                                                )}
                                                {log.device && (
                                                    <span className="text-gray-400 font-medium">{log.device}</span>
                                                )}
                                                {log.ip && (
                                                    <span className="text-gray-400 font-mono">{log.ip}</span>
                                                )}
                                            </div>

                                            <p className="text-[10px] text-gray-400 font-medium mt-1">
                                                <Clock size={9} className="inline -mt-0.5 mr-0.5" /> {log.exact_date}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="bg-amber-50/50 border-t border-amber-100 px-5 py-3">
                    <p className="text-xs text-amber-800 flex items-center justify-center gap-2 font-medium">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>Si no reconocés alguna actividad, cambiá tu contraseña inmediatamente.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const PasswordField = ({ label, value, onChange, visible, onToggle, error, autoComplete = 'off' }) => (
    <div>
        <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">{label}</label>
        <div className="relative">
            <input
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete={autoComplete}
                className={`w-full px-4 py-3 pr-10 rounded-xl bg-gray-50 border focus:bg-white focus:ring-2 outline-none transition-all text-sm ${error ? 'border-red-200 focus:ring-red-200' : 'border-gray-100 focus:ring-tenri-300'}`}
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                aria-label={visible ? 'Ocultar' : 'Mostrar'}
            >
                {visible ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
        {error && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle size={11} /> {error}
            </p>
        )}
    </div>
);

export default MiSeguridad;
