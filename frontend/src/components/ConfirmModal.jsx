import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Modal de confirmación genérico para acciones destructivas o sensibles.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onConfirm: () => void  (lo dispara el botón "Confirmar")
 *  - title: string
 *  - message: string
 *  - confirmLabel?: string  (default: "Confirmar")
 *  - cancelLabel?: string   (default: "Cancelar")
 *  - tone?: 'danger' | 'warning' | 'info'  (default: 'warning')
 *  - loading?: boolean
 */
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    tone = 'warning',
    loading = false,
}) => {
    if (!isOpen) return null;

    const config = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-500',
            button: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-500',
            button: 'bg-amber-600 hover:bg-amber-700',
        },
        info: {
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-500',
            button: 'bg-blue-600 hover:bg-blue-700',
        },
    };

    const current = config[tone] || config.warning;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${current.iconBg}`}>
                        <AlertTriangle size={42} className={current.iconColor} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed whitespace-pre-line">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 font-bold transition-all active:scale-95 disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${current.button} disabled:opacity-50`}
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
