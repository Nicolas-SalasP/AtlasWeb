import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, UserPlus } from 'lucide-react';
import AlertModal from '../components/AlertModal'; // <--- IMPORTAMOS EL MODAL

const Registro = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Estado del Modal
    const [modal, setModal] = useState({ open: false, type: 'success', title: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();

        // VALIDACIÓN DE CONTRASEÑAS
        if (formData.password !== formData.confirmPassword) {
            setModal({
                open: true,
                type: 'error',
                title: 'Error de Validación',
                message: 'Las contraseñas ingresadas no coinciden. Por favor verifícalas.'
            });
            return;
        }

        // SIMULACIÓN DE REGISTRO EXITOSO
        setModal({
            open: true,
            type: 'success',
            title: '¡Cuenta Creada!',
            message: 'Tu registro ha sido exitoso. Te redirigiremos al inicio de sesión.'
        });

        setTimeout(() => {
            navigate('/login');
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 pt-20">

            {/* EL MODAL */}
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-atlas-600 mb-4">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Únete a Atlas Digital Tech y gestiona tus proyectos.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="Juan Pérez"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                    </div>

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
                                placeholder="juan@empresa.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
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
                                type="password"
                                required
                                placeholder="Mínimo 8 caracteres"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Repetir Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                required
                                placeholder="Repite tu contraseña"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full bg-atlas-900 text-white font-bold py-3 rounded-xl hover:bg-atlas-800 transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2">
                            Registrarme <ArrowRight size={20} />
                        </button>
                    </div>

                </form>

                <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
                    ¿Ya tienes cuenta? {' '}
                    <Link to="/login" className="font-bold text-atlas-600 hover:text-atlas-900 transition-colors">
                        Inicia Sesión aquí
                    </Link>
                </div>

            </div>

            <p className="mt-8 text-gray-400 text-xs text-center">
                &copy; 2026 Atlas Digital Tech. Todos los derechos reservados.
            </p>

        </div>
    );
};

export default Registro;