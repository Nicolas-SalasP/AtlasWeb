import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmailChangeModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleRequest = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/profile/email/request', { new_email: email });
            toast.success(data.message);
            console.log('DEBUG CODE:', data.debug_code);
            setStep(2);
        } catch (error) { toast.error(error.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    const handleVerify = async () => {
        setLoading(true);
        try {
            await api.post('/profile/email/verify', { code });
            onSuccess(email);
            onClose();
            setStep(1); setEmail(''); setCode('');
        } catch (error) { toast.error('Código incorrecto'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cambiar Correo</h3>
                {step === 1 ? (
                    <>
                        <p className="text-sm text-gray-500 mb-4">Ingresa tu nuevo correo para recibir el código.</p>
                        <input type="email" placeholder="nuevo@correo.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border mb-4 outline-none focus:ring-2 focus:ring-atlas-900" />
                        <div className="flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleRequest} disabled={loading || !email} className="bg-atlas-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">{loading && <Loader2 className="animate-spin" size={16} />} Enviar</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-4 text-sm flex gap-2"><CheckCircle size={16} className="mt-0.5" /> <span>Código enviado a <b>{email}</b>.</span></div>
                        <input type="text" placeholder="000000" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))} className="w-full px-4 py-3 rounded-xl border mb-4 text-center text-2xl tracking-widest font-mono outline-none focus:ring-2 focus:ring-atlas-900" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Atrás</button>
                            <button onClick={handleVerify} disabled={loading || code.length < 6} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">{loading && <Loader2 className="animate-spin" size={16} />} Verificar</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmailChangeModal;