import React, { useEffect } from 'react';
import { HardHat, Sparkles, Cpu, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const Maintenance = () => {

    // --- LÓGICA DE AUTO-VERIFICACIÓN (EL CAMBIO CLAVE) ---
    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Consultamos la configuración silenciosamente
                const response = await api.get('/admin/settings');
                
                // Si el modo mantenimiento se apaga (es '0' o false)
                if (response.data.maintenance_mode == '0' || response.data.maintenance_mode === false) {
                    // Redirigir al Home y forzar recarga para limpiar estados
                    window.location.href = '/';
                }
            } catch (error) {
                // Si falla, asumimos que sigue caído o hay error de red, no hacemos nada.
                console.log("Sistema aún en mantenimiento...");
            }
        };

        // Ejecutar cada 10 segundos (10000 ms)
        const intervalId = setInterval(checkStatus, 10000);

        // Limpiar al desmontar
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 relative overflow-hidden">

            {/* --- FONDO ANIMADO --- */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 blur-[120px] animate-pulse-slow"></div>
                <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-atlas-900/30 to-blue-800/30 blur-[120px] animate-pulse-slow delay-700"></div>
            </div>
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[1px]"></div>

            {/* --- TARJETA CENTRAL --- */}
            <div className="relative z-10 bg-white/90 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-blue-900/20 max-w-xl w-full text-center border border-white/50 animate-in zoom-in-95 duration-700">
                
                {/* Icono Principal */}
                <div className="relative mx-auto w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-full h-full bg-gradient-to-tr from-atlas-900 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <HardHat size={48} className="text-white relative z-10" />
                        <Cpu size={24} className="absolute top-4 left-4 text-blue-200 animate-bounce-slow" />
                        <Sparkles size={24} className="absolute bottom-4 right-4 text-yellow-300 animate-pulse" />
                    </div>
                </div>

                <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Atlas Digital Tech</h2>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                    Estamos Actualizando <br /> la Plataforma
                </h1>
                <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                    Estamos implementando mejoras importantes para ofrecerte una experiencia más rápida y segura. Volveremos en unos minutos.
                </p>

                {/* Botones e Indicadores */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {/* Status Pill Visual */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-bold text-sm ring-1 ring-blue-100/50 cursor-default select-none">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        Progreso: Optimizando BD...
                    </div>

                    <Link
                        to="/login"
                        className="group flex items-center gap-2 px-5 py-2 text-sm font-bold text-gray-500 hover:text-atlas-900 transition-colors rounded-full hover:bg-gray-100"
                    >
                        <Lock size={16} /> Acceso Admin <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* --- INDICADOR DE AUTO-CHECK --- */}
            {/* Pequeña animación abajo para que el usuario sepa que la página está "viva" revisando */}
            <div className="absolute bottom-20 text-center text-blue-300/40 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 animate-pulse">
                <Loader2 size={12} className="animate-spin" /> Conectando con servidor...
            </div>

            <div className="absolute bottom-6 text-center text-white/40 text-sm">
                © {new Date().getFullYear()} Atlas Digital Tech. Todos los derechos reservados.
            </div>

            <style>{`
                .animate-pulse-slow { animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .animate-bounce-slow { animation: bounce 3s infinite; }
            `}</style>
        </div>
    );
};

export default Maintenance;