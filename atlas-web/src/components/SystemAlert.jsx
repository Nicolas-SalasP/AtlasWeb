import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import api from '../api/axiosConfig';

const SystemAlert = () => {
    const [visible, setVisible] = useState(false);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { data } = await api.get('/system-status');
                if (data.maintenance_mode == '1' || data.maintenance_mode === true) {
                    setMensaje('MODO MANTENIMIENTO: Puedes navegar el catálogo, pero las compras están deshabilitadas.');
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            } catch (error) {
                console.error("No se pudo verificar estado del sistema");
            }
        };

        checkStatus();
    }, []);

    if (!visible) return null;

    return (
        <div className="bg-yellow-500 text-yellow-950 px-4 py-3 relative overflow-hidden shadow-md z-40">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>
            <div className="container mx-auto flex items-center justify-center gap-3 relative z-10 text-sm md:text-base font-bold animate-in slide-in-from-top duration-500">
                <AlertTriangle className="animate-bounce" size={20} />
                <span className="text-center">{mensaje}</span>
            </div>
        </div>
    );
};

export default SystemAlert;