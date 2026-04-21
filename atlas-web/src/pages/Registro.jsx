import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, UserPlus, CreditCard, Loader2, X } from 'lucide-react';
import AlertModal from '../components/AlertModal';
import { useAuth } from '../context/AuthContext';
import Terminos from './legal/Terminos';
import Privacidad from './legal/Privacidad';
import SLA from './legal/SLA';

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
    const { register } = useAuth(); 

    const [formData, setFormData] = useState({
        name: '',
        rut: '',
        email: '',
        password: '',
        password_confirmation: '',
        accept_terms: false
    });

    const [modal, setModal] = useState({ open: false, type: 'success', title: '', message: '' });
    const [legalModal, setLegalModal] = useState({ open: false, type: '' });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e) => {
        setFormData({ ...formData, accept_terms: e.target.checked });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarRutChileno(formData.rut)) {
            setModal({ open: true, type: 'error', title: 'RUT Inválido', message: 'Por favor, ingresa un RUT chileno válido.' });
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setModal({ open: true, type: 'error', title: 'Error', message: 'Las contraseñas no coinciden.' });
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await register(formData);          
            if (result.requires_order_claim) {
                localStorage.setItem('pending_claims', JSON.stringify(result.claimable_emails));

                setModal({
                    open: true,
                    type: 'success',
                    title: '¡Cuenta Creada!',
                    message: 'Hemos detectado compras previas asociadas a tu RUT. Redirigiendo para vincularlas...'
                });

                setTimeout(() => {
                    navigate('/perfil', {
                        state: {
                            showClaimModal: true,
                            claimableEmails: result.claimable_emails
                        }
                    });
                }, 2500);
            } else {
                setModal({
                    open: true,
                    type: 'success',
                    title: '¡Cuenta Creada!',
                    message: 'Tu registro ha sido exitoso. Entrando al sistema...'
                });

                setTimeout(() => {
                    navigate('/perfil');
                }, 2000);
            }

        } catch (error) {
            let errorMessage = 'Hubo un problema al crear tu cuenta.';
            if (error.response?.data?.errors) {
                const primerError = Object.values(error.response.data.errors)[0][0];
                errorMessage = primerError;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            setModal({
                open: true,
                type: 'error',
                title: 'No pudimos registrarte',
                message: errorMessage
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-36 relative">
            <AlertModal
                isOpen={modal.open}
                onClose={() => setModal({ ...modal, open: false })}
                type={modal.type}
                title={modal.title}
                message={modal.message}
            />

            {/* Modal Interactivo para Documentos Legales */}
            {legalModal.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 sm:p-6">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
                        <div className="flex justify-between items-center p-4 sm:px-6 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                                {legalModal.type === 'terminos' && 'Términos y Condiciones'}
                                {legalModal.type === 'privacidad' && 'Política de Privacidad'}
                                {legalModal.type === 'sla' && 'Acuerdo de Nivel de Servicio (SLA)'}
                            </h2>
                            <button 
                                onClick={() => setLegalModal({ open: false, type: '' })} 
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto w-full relative document-modal-content">
                            {legalModal.type === 'terminos' && <Terminos />}
                            {legalModal.type === 'privacidad' && <Privacidad />}
                            {legalModal.type === 'sla' && <SLA />}
                        </div>

                        <div className="p-4 sm:px-6 border-t border-gray-200 bg-white flex justify-end">
                            <button 
                                onClick={() => setLegalModal({ open: false, type: '' })} 
                                className="bg-tenri-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-tenri-800 transition-colors shadow-md"
                            >
                                Entendido, cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-tenri-600 mb-4">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Únete a Tenri y gestiona tus proyectos.
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-tenri-300 outline-none transition-all"
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
                                value={formData.rut}
                                placeholder="12.345.678-9"
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all ${errorRut ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-tenri-300'}`}
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
                                name="email"
                                required
                                placeholder="juan@empresa.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-tenri-300 outline-none transition-all"
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
                                minLength={8}
                                placeholder="Mínimo 8 caracteres"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-tenri-300 outline-none transition-all"
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
                                minLength={8}
                                placeholder="Repite tu contraseña"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-tenri-300 outline-none transition-all"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* CHECKBOX DE TÉRMINOS Y CONDICIONES */}
                    <div className="flex items-start gap-3 pt-3 pb-1">
                        <input
                            type="checkbox"
                            id="accept_terms"
                            name="accept_terms"
                            required
                            checked={formData.accept_terms}
                            onChange={handleCheckboxChange}
                            className="mt-1 w-5 h-5 text-tenri-600 border-gray-300 rounded focus:ring-tenri-500 cursor-pointer"
                        />
                        <label htmlFor="accept_terms" className="text-sm text-gray-600 leading-snug">
                            He leído y acepto los{' '}
                            <button type="button" onClick={() => setLegalModal({ open: true, type: 'terminos' })} className="font-bold text-tenri-600 hover:text-tenri-900 underline">
                                Términos y Condiciones
                            </button>
                            , la{' '}
                            <button type="button" onClick={() => setLegalModal({ open: true, type: 'privacidad' })} className="font-bold text-tenri-600 hover:text-tenri-900 underline">
                                Política de Privacidad
                            </button>
                            {' '}y el{' '}
                            <button type="button" onClick={() => setLegalModal({ open: true, type: 'sla' })} className="font-bold text-tenri-600 hover:text-tenri-900 underline">
                                SLA
                            </button>.
                        </label>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.accept_terms}
                            className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 
                                ${isSubmitting || !formData.accept_terms 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-tenri-900 text-white hover:bg-tenri-800 hover:shadow-xl'
                                }`}
                        >
                            {isSubmitting ? (
                                <><Loader2 size={20} className="animate-spin" /> Creando cuenta...</>
                            ) : (
                                <>Registrarme <ArrowRight size={20} /></>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
                    ¿Ya tienes cuenta? {' '}
                    <Link to="/login" className="font-bold text-tenri-600 hover:text-tenri-900 transition-colors">
                        Inicia Sesión aquí
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Registro;