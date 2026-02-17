import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, UserPlus, CreditCard, Loader2 } from 'lucide-react';
import AlertModal from '../components/AlertModal';
import { useAuth } from '../context/AuthContext';

const Registro = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rut: '',
        password: '',
        password_confirmation: ''
    });

    const [modal, setModal] = useState({ open: false, type: 'success', title: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatRut = (rut) => {
        let valor = rut.replace(/[^0-9kK]/g, '');
        let cuerpo = valor.slice(0, -1);
        let dv = valor.slice(-1).toUpperCase();
        
        if (valor.length < 2) return valor;

        rut = cuerpo + '-' + dv;
        if (cuerpo.length > 3) {
            cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            rut = cuerpo + '-' + dv;
        }
        return rut;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'rut') {
            setFormData({ ...formData, [name]: formatRut(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (formData.password !== formData.password_confirmation) {
            setModal({
                open: true,
                type: 'error',
                title: 'Error de Validación',
                message: 'Las contraseñas no coinciden.'
            });
            setIsSubmitting(false);
            return;
        }

        try {
            await register(formData);

            setModal({
                open: true,
                type: 'success',
                title: '¡Cuenta Creada!',
                message: 'Tu cuenta ha sido creada'
            });

            setTimeout(() => {
                navigate('/perfil');
            }, 2000);

        } catch (error) {
            setModal({
                open: true,
                type: 'error',
                title: 'Error de Registro',
                message: error.response?.data?.message || 'Hubo un problema al crear tu cuenta.'
            });
            setIsSubmitting(false);
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

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Juan Pérez"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <CreditCard size={20} />
                            </div>
                            <input
                                type="text"
                                name="rut"
                                required
                                placeholder="12.345.678-9"
                                maxLength={12}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
                                value={formData.rut}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="juan@empresa.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="Mínimo 8 caracteres"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Repetir Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                name="password_confirmation"
                                required
                                placeholder="Repite tu contraseña"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 ${
                                isSubmitting ? 'bg-atlas-800 text-gray-300 cursor-wait' : 'bg-atlas-900 text-white hover:bg-atlas-800 hover:shadow-xl'
                            }`}
                        >
                            {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Creando cuenta...</> : <>Registrarme <ArrowRight size={20} /></>}
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