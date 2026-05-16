import React, { useState } from 'react';
import { CreditCard, Building2, Loader2, ChevronRight, CheckCircle, AlertCircle, Lock, ShieldCheck, Copy, ArrowRight } from 'lucide-react';
import api from '../../api/axiosConfig';

const PaymentSelector = ({ orderId }) => {
    const [method, setMethod] = useState('webpay');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [transferData, setTransferData] = useState(null);
    const [copiado, setCopiado] = useState(null);

    const handleWebpay = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const { data } = await api.post('/payment/webpay', { order_id: orderId });

            const form = document.createElement('form');
            form.action = data.url;
            form.method = 'POST';

            const tokenInput = document.createElement('input');
            tokenInput.name = 'token_ws';
            tokenInput.value = data.token;

            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error("Error Webpay", error);
            const body = error.response?.data;
            const textoError = body?.message || body?.error || "Error de conexión con el servidor de pago.";
            setErrorMsg(textoError);
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const { data } = await api.post('/payment/transfer', { order_id: orderId });
            setTransferData(data.bank_details);
        } catch (error) {
            console.error("Error Transfer", error);
            const body = error.response?.data;
            const textoError = body?.message || "No se pudo registrar la transferencia.";
            setErrorMsg(textoError);
            setLoading(false);
        }
    };

    const copiarAlPortapapeles = async (texto, label) => {
        try {
            await navigator.clipboard.writeText(texto);
            setCopiado(label);
            setTimeout(() => setCopiado(null), 1800);
        } catch (e) {
            console.error('No se pudo copiar:', e);
        }
    };

    if (transferData) {
        return (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 text-center animate-in fade-in zoom-in-95">
                <div className="mx-auto w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
                    <CheckCircle size={26} />
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">¡Orden registrada!</h3>
                <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                    Tu pedido <span className="font-mono font-bold text-gray-900">#{orderId}</span> está reservado.<br />
                    Transferí el total a la siguiente cuenta:
                </p>

                <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-100 text-left space-y-3 text-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-tenri-900"></div>

                    <DataRow
                        label="Banco"
                        value={transferData.bank_name}
                        onCopy={() => copiarAlPortapapeles(transferData.bank_name, 'bank_name')}
                        copiado={copiado === 'bank_name'}
                    />
                    <DataRow
                        label="Tipo de cuenta"
                        value={transferData.bank_account_type}
                    />
                    <DataRow
                        label="N° cuenta"
                        value={transferData.bank_account_number}
                        mono
                        onCopy={() => copiarAlPortapapeles(transferData.bank_account_number, 'bank_account_number')}
                        copiado={copiado === 'bank_account_number'}
                    />
                    <DataRow
                        label="RUT"
                        value={transferData.bank_rut}
                        mono
                        onCopy={() => copiarAlPortapapeles(transferData.bank_rut, 'bank_rut')}
                        copiado={copiado === 'bank_rut'}
                    />
                    <DataRow
                        label="Correo"
                        value={transferData.bank_email}
                        onCopy={() => copiarAlPortapapeles(transferData.bank_email, 'bank_email')}
                        copiado={copiado === 'bank_email'}
                    />
                </div>

                <div className="mt-5 p-4 bg-blue-50 border border-blue-100 text-blue-800 text-xs rounded-xl flex gap-2.5 items-start text-left">
                    <Building2 size={14} className="mt-0.5 shrink-0" />
                    <p className="leading-relaxed">
                        Una vez realizada la transferencia, enviá el comprobante al correo del banco indicado mencionando tu número de orden <strong>#{orderId}</strong>. Confirmamos el pago en menos de 24h.
                    </p>
                </div>

                <button
                    onClick={() => window.location.href = '/catalogo'}
                    className="mt-6 inline-flex items-center gap-2 text-tenri-700 font-bold text-sm hover:text-tenri-900 transition-colors group"
                >
                    Volver a la tienda
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-500">

            <div className="mb-6 text-center">
                <h3 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">Elegí tu método de pago</h3>
                <p className="text-xs text-gray-500 mt-1">Ambos métodos son seguros y confiables</p>
            </div>

            {errorMsg && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-sm text-red-700 animate-in shake">
                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                    <span className="font-medium">{errorMsg}</span>
                </div>
            )}

            <div className="space-y-3 mb-6">

                <PaymentOption
                    activo={method === 'webpay'}
                    onClick={() => !loading && setMethod('webpay')}
                    loading={loading}
                    icon={<CreditCard size={22} />}
                    iconColor="bg-orange-100 text-orange-600"
                    title="Webpay Plus"
                    description="Tarjetas de crédito, débito y prepago"
                    badge="RECOMENDADO"
                    badgeColor="bg-emerald-100 text-emerald-700 border-emerald-200"
                />

                <PaymentOption
                    activo={method === 'transfer'}
                    onClick={() => !loading && setMethod('transfer')}
                    loading={loading}
                    icon={<Building2 size={22} />}
                    iconColor="bg-blue-100 text-blue-600"
                    title="Transferencia bancaria"
                    description="Transferencia directa a cuenta empresa"
                    extra="Confirmación en < 24h"
                />
            </div>

            <button
                onClick={method === 'webpay' ? handleWebpay : handleTransfer}
                disabled={loading}
                className="w-full bg-tenri-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-tenri-900/20 hover:bg-tenri-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 group"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Procesando pago...
                    </>
                ) : (
                    <>
                        {method === 'webpay' ? 'Pagar con Webpay' : 'Continuar con transferencia'}
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-gray-400 font-bold">
                <span className="flex items-center gap-1.5"><Lock size={11} /> Conexión segura</span>
                <span className="text-gray-200">|</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={11} /> SSL 256-bit</span>
                <span className="text-gray-200">|</span>
                <span className="flex items-center gap-1.5">Transbank®</span>
            </div>
        </div>
    );
};

const PaymentOption = ({ activo, onClick, loading, icon, iconColor, title, description, badge, badgeColor, extra }) => (
    <div
        onClick={onClick}
        className={`relative cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${activo ? 'border-tenri-900 bg-gradient-to-br from-tenri-50/30 to-white shadow-sm' : 'border-gray-100 hover:border-gray-200'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className={`p-3 rounded-xl transition-colors shrink-0 ${activo ? iconColor : 'bg-gray-100 text-gray-400'}`}>
            {icon}
        </div>

        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className={`font-bold transition-colors text-sm md:text-base ${activo ? 'text-gray-900' : 'text-gray-600'}`}>
                    {title}
                </p>
                {badge && (
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeColor}`}>
                        {badge}
                    </span>
                )}
            </div>
            <p className="text-xs text-gray-500">{description}</p>
            {extra && (
                <p className="text-[10px] text-gray-400 mt-1 font-medium">{extra}</p>
            )}
        </div>

        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${activo ? 'border-tenri-900 bg-tenri-900' : 'border-gray-300'}`}>
            {activo && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
    </div>
);

const DataRow = ({ label, value, mono = false, onCopy = null, copiado = false }) => (
    <div className="grid grid-cols-3 gap-2 items-center">
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</span>
        <div className="col-span-2 flex items-center justify-between gap-2">
            <span className={`font-bold text-gray-900 truncate ${mono ? 'font-mono text-base text-tenri-900 tracking-wider' : ''}`}>
                {value || 'No disponible'}
            </span>
            {onCopy && value && (
                <button
                    type="button"
                    onClick={onCopy}
                    className={`p-1.5 rounded-lg transition-all shrink-0 ${copiado ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500 hover:bg-tenri-50 hover:text-tenri-900'}`}
                    aria-label="Copiar"
                    title={copiado ? '¡Copiado!' : 'Copiar'}
                >
                    {copiado ? <CheckCircle size={13} /> : <Copy size={13} />}
                </button>
            )}
        </div>
    </div>
);

export default PaymentSelector;
