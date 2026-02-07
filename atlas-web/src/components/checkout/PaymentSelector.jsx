import React, { useState } from 'react';
import { CreditCard, Building2, Loader2, ChevronRight, CheckCircle, Copy } from 'lucide-react';
import api from '../../api/axiosConfig';

const PaymentSelector = ({ orderId }) => {
    const [method, setMethod] = useState('webpay'); // 'webpay' | 'transfer'
    const [loading, setLoading] = useState(false);
    const [transferData, setTransferData] = useState(null); // Datos del banco al confirmar transferencia

    // --- 1. INICIAR WEBPAY ---
    const handleWebpay = async () => {
        setLoading(true);
        try {
            // Solicitamos token al backend
            const { data } = await api.post('/payment/webpay', { order_id: orderId });
            
            // Webpay requiere crear un formulario oculto y enviarlo automáticamente (POST)
            const form = document.createElement('form');
            form.action = data.url;
            form.method = 'POST';
            
            const tokenInput = document.createElement('input');
            tokenInput.name = 'token_ws';
            tokenInput.value = data.token;
            
            form.appendChild(tokenInput);
            document.body.appendChild(form);
            
            // Enviamos al usuario a Transbank
            form.submit(); 
            
        } catch (error) {
            console.error("Error Webpay", error);
            alert("Error al iniciar el pago. Revisa la consola o intenta más tarde.");
            setLoading(false);
        }
    };

    // --- 2. CONFIRMAR TRANSFERENCIA ---
    const handleTransfer = async () => {
        setLoading(true);
        try {
            // Avisamos al backend que se eligió transferencia
            const { data } = await api.post('/payment/transfer', { order_id: orderId });
            
            // Guardamos los datos del banco para mostrarlos
            setTransferData(data.bank_details);
            
        } catch (error) {
            console.error("Error Transfer", error);
            alert("No se pudo registrar la intención de transferencia.");
            setLoading(false);
        }
    };

    // --- VISTA: ÉXITO TRANSFERENCIA (Mostrar Datos Banco) ---
    if (transferData) {
        return (
            <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center animate-in fade-in zoom-in-95">
                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Orden Registrada!</h3>
                <p className="text-gray-600 mb-6 text-sm">
                    Tu pedido #{orderId} está reservado. <br/>
                    Transfiere el total a la siguiente cuenta:
                </p>
                
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-left space-y-3 text-sm text-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-atlas-900"></div>
                    <div className="grid grid-cols-3 gap-y-2">
                        <span className="text-gray-400 font-medium">Banco:</span>
                        <span className="col-span-2 font-bold text-gray-900">{transferData.bank_name}</span>
                        
                        <span className="text-gray-400 font-medium">Tipo:</span>
                        <span className="col-span-2 font-bold text-gray-900">{transferData.bank_account_type}</span>
                        
                        <span className="text-gray-400 font-medium">Número:</span>
                        <span className="col-span-2 font-mono text-lg font-bold text-atlas-900 tracking-wider">{transferData.bank_account_number}</span>
                        
                        <span className="text-gray-400 font-medium">RUT:</span>
                        <span className="col-span-2 font-bold text-gray-900">{transferData.bank_rut}</span>
                        
                        <span className="text-gray-400 font-medium">Correo:</span>
                        <span className="col-span-2 font-bold text-gray-900">{transferData.bank_email}</span>
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 text-blue-800 text-xs rounded-xl flex gap-3 items-start text-left">
                    <div className="mt-0.5"><Building2 size={16}/></div>
                    <p>Una vez realizada la transferencia, envía el comprobante al correo indicado mencionando tu número de orden <strong>#{orderId}</strong>.</p>
                </div>

                <button onClick={() => window.location.href = '/catalogo'} className="mt-6 text-green-700 font-bold text-sm hover:underline">
                    Volver a la tienda
                </button>
            </div>
        );
    }

    // --- VISTA: SELECCIÓN DE MÉTODO ---
    return (
        <div className="animate-in fade-in slide-in-from-right duration-500">
            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Selecciona Método de Pago</h3>
            
            <div className="space-y-4 mb-8">
                {/* OPCIÓN WEBPAY */}
                <div 
                    onClick={() => setMethod('webpay')}
                    className={`relative cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group ${method === 'webpay' ? 'border-atlas-900 bg-gray-50 shadow-md' : 'border-gray-100 hover:border-gray-200 hover:bg-white'}`}
                >
                    <div className={`p-3 rounded-xl transition-colors ${method === 'webpay' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                        <CreditCard size={24}/>
                    </div>
                    <div className="flex-1">
                        <p className={`font-bold transition-colors ${method === 'webpay' ? 'text-gray-900' : 'text-gray-600'}`}>Webpay Plus</p>
                        <p className="text-xs text-gray-400">Tarjetas de Crédito, Débito y Prepago</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'webpay' ? 'border-atlas-900' : 'border-gray-300'}`}>
                        {method === 'webpay' && <div className="w-2.5 h-2.5 rounded-full bg-atlas-900"/>}
                    </div>
                </div>

                {/* OPCIÓN TRANSFERENCIA */}
                <div 
                    onClick={() => setMethod('transfer')}
                    className={`relative cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group ${method === 'transfer' ? 'border-atlas-900 bg-gray-50 shadow-md' : 'border-gray-100 hover:border-gray-200 hover:bg-white'}`}
                >
                    <div className={`p-3 rounded-xl transition-colors ${method === 'transfer' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Building2 size={24}/>
                    </div>
                    <div className="flex-1">
                        <p className={`font-bold transition-colors ${method === 'transfer' ? 'text-gray-900' : 'text-gray-600'}`}>Transferencia Bancaria</p>
                        <p className="text-xs text-gray-400">Transferencia directa a cuenta empresa</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'transfer' ? 'border-atlas-900' : 'border-gray-300'}`}>
                        {method === 'transfer' && <div className="w-2.5 h-2.5 rounded-full bg-atlas-900"/>}
                    </div>
                </div>
            </div>

            <button
                onClick={method === 'webpay' ? handleWebpay : handleTransfer}
                disabled={loading}
                className="w-full bg-atlas-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-atlas-800 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" /> Procesando...
                    </>
                ) : (
                    <>
                        {method === 'webpay' ? 'Pagar con Webpay' : 'Confirmar Transferencia'} <ChevronRight size={20}/>
                    </>
                )}
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-4">
                Serás redirigido a un entorno seguro.
            </p>
        </div>
    );
};

export default PaymentSelector;