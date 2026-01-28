import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const AlertModal = ({ isOpen, onClose, type = 'success', title, message }) => {
    if (!isOpen) return null;

    // Configuración según el tipo de alerta
    const config = {
        success: {
            icon: <CheckCircle size={48} className="text-green-500" />,
            bgIcon: 'bg-green-100',
            button: 'bg-green-600 hover:bg-green-700'
        },
        error: {
            icon: <AlertCircle size={48} className="text-red-500" />,
            bgIcon: 'bg-red-100',
            button: 'bg-red-600 hover:bg-red-700'
        },
        info: {
            icon: <Info size={48} className="text-blue-500" />,
            bgIcon: 'bg-blue-100',
            button: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    const current = config[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in duration-200">

                <div className="p-6 text-center">
                    {/* Icono animado */}
                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${current.bgIcon} animate-in fade-in zoom-in duration-300`}>
                        {current.icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className={`w-full py-3 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 ${current.button}`}
                    >
                        Entendido
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AlertModal;