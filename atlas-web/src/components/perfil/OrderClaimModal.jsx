import React, { useState } from 'react';
import { Mail, Key, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import api from '../../api/axiosConfig';

const OrderClaimModal = ({ isOpen, onClose, claimableEmails, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Pedir Correo, 2: Pedir OTP, 3: Éxito
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/profile/claim-orders/request-otp', { historical_email: email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al solicitar el código.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/profile/claim-orders/confirm', { 
                historical_email: email, 
                otp: otp 
            });
            setStep(3);
            setTimeout(() => {
                onClose();
                if(onSuccess) onSuccess(res.data.updated_orders);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Código incorrecto o expirado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
                
                {step !== 3 && (
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                )}

                <div className="p-8">
                    {step === 1 && (
                        <>
                            <div className="flex justify-center mb-4 text-tenri-600">
                                <AlertCircle size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2">Órdenes Encontradas</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Hemos detectado compras previas con tu RUT usando estos correos enmascarados:
                                <br/><br/>
                                <strong>{claimableEmails?.join(', ')}</strong>
                                <br/><br/>
                                Ingresa el correo completo de una de estas cuentas para enviarte un código de seguridad.
                            </p>

                            <form onSubmit={handleRequestOtp} className="space-y-4">
                                <div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Ingresa el correo completo..."
                                            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-tenri-500 outline-none"
                                        />
                                    </div>
                                </div>
                                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-tenri-900 text-white py-2.5 rounded-xl font-bold hover:bg-tenri-800 transition flex justify-center items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Enviar Código'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="flex justify-center mb-4 text-tenri-600">
                                <Key size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2">Ingresa tu Código</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Hemos enviado un código de 6 dígitos a <strong>{email}</strong>. 
                                Revisa tu bandeja de entrada o spam.
                            </p>

                            <form onSubmit={handleConfirmOtp} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        required
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="123456"
                                        className="w-full text-center text-2xl tracking-widest py-3 border rounded-xl focus:ring-2 focus:ring-tenri-500 outline-none font-bold"
                                    />
                                </div>
                                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="w-full bg-tenri-900 text-white py-2.5 rounded-xl font-bold hover:bg-tenri-800 transition flex justify-center items-center gap-2 disabled:bg-gray-300"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Vincular Órdenes'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6">
                            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Completado!</h3>
                            <p className="text-gray-500">
                                Tus compras históricas se han vinculado a tu cuenta exitosamente.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderClaimModal;