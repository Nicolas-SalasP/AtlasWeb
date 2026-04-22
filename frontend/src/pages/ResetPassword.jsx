import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Lock, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import AlertModal from '../components/AlertModal';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorModal, setErrorModal] = useState({ show: false, title: '', message: '' });

    const [formData, setFormData] = useState({
        token: searchParams.get('token') || '',
        email: searchParams.get('email') || '',
        password: '',
        password_confirmation: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/reset-password', formData);
            setSuccess(true);
        } catch (error) {
            console.error("Error reset:", error);
            const data = error.response?.data;
            let finalMsg = 'Ocurrió un error al restablecer la contraseña. Verifica que el enlace no haya expirado.';

            if (data?.errors) {
                const firstErrorKey = Object.keys(data.errors)[0];
                const rawError = data.errors[firstErrorKey][0];

                if (rawError.includes('min.string')) {
                    finalMsg = 'La contraseña es demasiado corta. Debe tener al menos 8 caracteres.';
                } else if (rawError.includes('confirmed')) {
                    finalMsg = 'Las contraseñas no coinciden. Por favor, escríbelas exactamente igual.';
                } else {
                    finalMsg = rawError;
                }
            } else if (data?.message) {
                finalMsg = data.message;
            }

            setErrorModal({
                show: true,
                title: 'Error de Validación',
                message: finalMsg
            });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Todo listo!</h2>
                    <p className="text-gray-500 mb-8">Tu contraseña ha sido actualizada. Ya puedes iniciar sesión con tus nuevas credenciales.</p>
                    <Link to="/login" className="w-full py-4 bg-tenri-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-tenri-800 transition-all shadow-lg">
                        Ir al Login <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Nueva Contraseña</h2>
                    <p className="text-gray-500 mt-2">Ingresa tu nueva clave de acceso para Tenri.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                placeholder="Nueva contraseña"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-tenri-900 outline-none transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                placeholder="Confirmar contraseña"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-tenri-900 outline-none transition-all"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-tenri-900 text-white rounded-2xl font-bold shadow-lg hover:bg-tenri-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Actualizar Contraseña'}
                    </button>
                </form>
            </div>

            <AlertModal
                isOpen={errorModal.show}
                onClose={() => setErrorModal({ ...errorModal, show: false })}
                title={errorModal.title}
                message={errorModal.message}
                variant="error"
            />
        </div>
    );
};

export default ResetPassword;