import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const Recuperar = () => {
    const [email, setEmail] = useState('');
    const [enviado, setEnviado] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // API RESET PASSWORD CALL
        setTimeout(() => {
            setEnviado(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-atlas-100 text-atlas-900 mb-4">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Recuperar Contraseña</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Ingresa tu correo y te enviaremos instrucciones para restablecer tu acceso.
                    </p>
                </div>

                {!enviado ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                    placeholder="nombre@ejemplo.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-atlas-900 text-white font-bold py-3 rounded-xl hover:bg-atlas-800 transition-all shadow-lg flex justify-center items-center gap-2">
                            Enviar Instrucciones <Send size={18} />
                        </button>
                    </form>
                ) : (
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 border border-green-100">
                            <p className="font-bold">¡Correo enviado!</p>
                            <p className="text-sm mt-1">Revisa tu bandeja de entrada (y spam) para continuar.</p>
                        </div>
                        <button
                            onClick={() => setEnviado(false)}
                            className="text-atlas-500 text-sm font-bold hover:underline"
                        >
                            Intentar con otro correo
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-atlas-900 text-sm font-medium transition-colors">
                        <ArrowLeft size={16} /> Volver al Login
                    </Link>
                </div>

            </div>

            <p className="mt-8 text-gray-400 text-xs">
                &copy; 2026 Atlas Digital Tech. Todos los derechos reservados.
            </p>

        </div>
    );
};

export default Recuperar;