import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, User } from 'lucide-react';
import AlertModal from '../components/AlertModal'; // <--- IMPORTAMOS EL MODAL

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    // Estado para el Modal
    const [modal, setModal] = useState({ open: false, type: 'success', title: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();

        // SIMULACIÓN DE ÉXITO
        setModal({
            open: true,
            type: 'success',
            title: '¡Bienvenido!',
            message: 'Has iniciado sesión correctamente. Redirigiendo...'
        });

        // Redirigir después de 1.5 segundos
        setTimeout(() => {
            setModal({ ...modal, open: false });
            navigate('/checkout');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 pt-20">

            {/* EL MODAL VIVE AQUÍ */}
            <AlertModal
                isOpen={modal.open}
                onClose={() => setModal({ ...modal, open: false })}
                type={modal.type}
                title={modal.title}
                message={modal.message}
            />

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-atlas-100 text-atlas-900 mb-4">
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
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                required
                                placeholder="nombre@empresa.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 focus:border-transparent outline-none transition-all"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 focus:border-transparent outline-none transition-all"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-atlas-900"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-gray-300 text-atlas-900 focus:ring-atlas-500" />
                            <span className="text-gray-600">Recordarme</span>
                        </label>
                        <Link to="/recuperar" className="font-semibold text-atlas-600 hover:text-atlas-800">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button type="submit" className="w-full bg-atlas-900 text-white font-bold py-3 rounded-xl hover:bg-atlas-800 transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2">
                        Ingresar <ArrowRight size={20} />
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