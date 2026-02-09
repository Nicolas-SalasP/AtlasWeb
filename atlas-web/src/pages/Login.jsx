import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import AlertModal from '../components/AlertModal';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modal, setModal] = useState({ open: false, type: 'success', title: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const usuarioLogueado = await login(formData.email, formData.password, rememberMe);

            setModal({
                open: true,
                type: 'success',
                title: '¡Bienvenido!',
                message: 'Credenciales verificadas. Entrando al sistema...'
            });

            setTimeout(() => {
                setModal({ ...modal, open: false });

                if (usuarioLogueado.role_id === 1) {
                    navigate('/admin');
                } else {
                    navigate('/perfil');
                }

            }, 1500);

        } catch (error) {
            setIsSubmitting(false);
            setModal({
                open: true,
                type: 'error',
                title: 'Error de Acceso',
                message: 'El correo o la contraseña son incorrectos.'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 pt-20">

            <AlertModal
                isOpen={modal.open}
                onClose={() => setModal({ ...modal, open: false })}
                type={modal.type}
                title={modal.title}
                message={modal.message}
            />

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-in fade-in zoom-in duration-300">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-atlas-100 text-atlas-900 mb-4 shadow-sm">
                        <User size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Ingresa tus credenciales para acceder al sistema.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-atlas-600 transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                required
                                placeholder="nombre@empresa.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 focus:border-transparent outline-none transition-all font-medium text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-atlas-600 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 focus:border-transparent outline-none transition-all font-medium text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-atlas-900 transition-colors disabled:opacity-50"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isSubmitting}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Opciones Extra */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-atlas-900 focus:ring-atlas-500 cursor-pointer"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span className="text-gray-600 group-hover:text-atlas-900 transition-colors">Recordarme</span>
                        </label>
                        <Link to="/recuperar" className="font-semibold text-atlas-600 hover:text-atlas-800 transition-colors">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    {/* Botón Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 active:scale-[0.98] ${isSubmitting
                            ? 'bg-atlas-800 text-gray-300 cursor-wait'
                            : 'bg-atlas-900 text-white hover:bg-atlas-800 hover:shadow-xl hover:shadow-atlas-900/20'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> Procesando...
                            </>
                        ) : (
                            <>
                                Ingresar <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                </form>

                <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
                    ¿No tienes una cuenta? {' '}
                    <Link to="/registro" className="font-bold text-atlas-600 hover:text-atlas-900 transition-colors">
                        Regístrate gratis
                    </Link>
                </div>

            </div>

            <p className="mt-8 text-gray-400 text-xs text-center">
                &copy; 2026 Atlas Digital Tech. Seguridad garantizada.
            </p>

        </div>
    );
};

export default Login;