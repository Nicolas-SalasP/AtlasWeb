import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, UserPlus, CreditCard } from 'lucide-react';
import AlertModal from '../components/AlertModal'; 
import api from '../api/axiosConfig';

// --- UTILIDADES RUT ---
const formatearRut = (rut) => {
    let valor = rut.replace(/[.-]/g, '');
    if (valor === '') return '';
    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1).toUpperCase();
    return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (cuerpo.length > 0 ? "-" : "") + dv;
};

const validarRutChileno = (rut) => {
    if (!rut || rut.trim().length < 8) return false;
    const valor = rut.replace(/[.-]/g, '');
    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1).toUpperCase();
    if (!/^\d+$/.test(cuerpo)) return false;
    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = suma % 11;
    const dvCalculado = 11 - resto;
    let dvEsperado = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'K' : dvCalculado.toString();
    return dv === dvEsperado;
};

const Registro = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        rut: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [modal, setModal] = useState({ open: false, type: 'success', title: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [errorRut, setErrorRut] = useState(false);

    const handleRutChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9kK]/g, '');
        const formatted = formatearRut(rawValue);
        setFormData({ ...formData, rut: formatted });
        
        if (formatted.length > 8 && !validarRutChileno(formatted)) {
            setErrorRut(true);
        } else {
            setErrorRut(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarRutChileno(formData.rut)) {
            setModal({
                open: true,
                type: 'error',
                title: 'RUT Inválido',
                message: 'Por favor, ingresa un RUT chileno válido.'
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setModal({
                open: true,
                type: 'error',
                title: 'Error de Validación',
                message: 'Las contraseñas no coinciden. Por favor verifícalas.'
            });
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/register', {
                name: formData.name,
                rut: formData.rut,
                email: formData.email,
                password: formData.password
            });

            setModal({
                open: true,
                type: 'success',
                title: '¡Cuenta Creada!',
                message: 'Tu registro ha sido exitoso. Te redirigiremos al inicio de sesión.'
            });

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Hubo un problema al crear tu cuenta.';
            setModal({
                open: true,
                type: 'error',
                title: 'Error al registrar',
                message: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-36">
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
                                required
                                placeholder="Juan Pérez"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* NUEVO CAMPO RUT */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <CreditCard size={20} />
                            </div>
                            <input
                                type="text"
                                required
                                value={formData.rut}
                                placeholder="12.345.678-9"
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all ${errorRut ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-atlas-300'}`}
                                onChange={handleRutChange}
                            />
                        </div>
                        {errorRut && <p className="text-xs text-red-500 mt-1">El RUT ingresado no es válido.</p>}
                    </div>

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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                required
                                minLength={8}
                                placeholder="Mínimo 8 caracteres"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                                required
                                minLength={8}
                                placeholder="Repite tu contraseña"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full text-white font-bold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-atlas-900 hover:bg-atlas-800 hover:shadow-xl'}`}
                        >
                            {isLoading ? 'Registrando...' : 'Registrarme'} <ArrowRight size={20} />
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
        </div>
    );
};

export default Registro;