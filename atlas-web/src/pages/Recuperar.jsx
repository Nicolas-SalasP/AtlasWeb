import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/axiosConfig';

const Recuperar = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            await api.post('/forgot-password', { email });
            setStatus('success');
        } catch (error) {
            console.error("Error password reset:", error);
            setStatus('error');
            setErrorMessage(
                error.response?.data?.message || 
                error.response?.data?.email?.[0] ||
                'No pudimos encontrar una cuenta con ese correo.'
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-atlas-100 text-atlas-900 mb-4">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Recuperar Contraseña</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu acceso.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-50 text-green-700 p-6 rounded-xl mb-6 border border-green-100">
                            <p className="font-bold text-lg mb-2">¡Correo enviado!</p>
                            <p className="text-sm">
                                Hemos enviado las instrucciones a <strong>{email}</strong>.
                                <br/>
                                Revisa tu bandeja de entrada (y la carpeta de Spam por si acaso).
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setStatus('idle');
                                setEmail('');
                                setErrorMessage('');
                            }}
                            className="text-atlas-900 text-sm font-bold hover:underline"
                        >
                            ¿No llegó? Intentar con otro correo
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === 'error' && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm animate-in shake">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    disabled={status === 'loading'}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={status === 'loading' || !email}
                            className="w-full bg-atlas-900 text-white font-bold py-3 rounded-xl hover:bg-atlas-800 transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {status === 'loading' ? (
                                <><Loader2 size={20} className="animate-spin" /> Enviando...</>
                            ) : (
                                <>Enviar Instrucciones <Send size={18} /></>
                            )}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-atlas-900 text-sm font-medium transition-colors">
                        <ArrowLeft size={16} /> Volver al Login
                    </Link>
                </div>

            </div>

            <p className="mt-8 text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} Atlas Digital Tech. Todos los derechos reservados.
            </p>

        </div>
    );
};

export default Recuperar;