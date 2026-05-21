import React, { useState, useEffect } from 'react';
import { X, MapPin, FileText, Package, CreditCard, Image as ImageIcon, Building2, Truck, ExternalLink, Clock, History } from 'lucide-react';
import api from '../../api/axiosConfig';
import { BASE_URL } from '../../api/constants';

const PROVEEDORES_ENVIO = {
    propio:      'Reparto Propio / Interno',
    bluexpress:  'BlueExpress',
    starken:     'Starken',
    chilexpress: 'Chilexpress',
    correos:     'Correos de Chile',
};

const STATUS_COLORS = {
    paid:       'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending:    'bg-amber-50 text-amber-700 border-amber-200',
    preparing:  'bg-blue-50 text-blue-700 border-blue-200',
    shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled:  'bg-red-50 text-red-700 border-red-200',
    refunded:   'bg-rose-50 text-rose-700 border-rose-200',
};

const getTrackingLink = (provider, code) => {
    if (!code) return null;
    switch (provider) {
        case 'bluexpress':  return `https://www.blue.cl/seguimiento/?codigo=${code}`;
        case 'starken':     return `https://www.starken.cl/seguimiento?codigo=${code}`;
        case 'chilexpress': return `https://www.chilexpress.cl/Views/ChilexpressCL/Resultado-busqueda.aspx?DATA=${code}`;
        case 'correos':     return `https://www.correos.cl/web/guest/seguimiento-en-linea?objEnvio=${code}`;
        default:            return null;
    }
};

const formatPrice = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount || 0);

const OrderDetailModal = ({ order, onClose }) => {
    const [bankDetails, setBankDetails] = useState(null);

    useEffect(() => {
        if (order?.payment_method === 'transfer' && order?.status === 'pending') {
            const fetchBankDetails = async () => {
                try {
                    const { data } = await api.get('/system-status');
                    setBankDetails(data.bank_details || data);
                } catch (error) {
                    console.error("Error obteniendo datos del banco:", error);
                }
            };
            fetchBankDetails();
        }
    }, [order]);

    if (!order) return null;

    const statusClass = STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600 border-gray-100';
    const subtotalNeto = Math.round((order.subtotal || 0) / 1.19);
    const iva = (order.subtotal || 0) - subtotalNeto;
    const trackingUrl = getTrackingLink(order.shipping_provider, order.tracking_number);
    const statusLogs = Array.isArray(order.status_logs) ? order.status_logs : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 custom-scrollbar" onClick={e => e.stopPropagation()}>

                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                    <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-extrabold text-gray-900 truncate">Pedido {order.order_number}</h3>
                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString('es-CL')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors shrink-0" aria-label="Cerrar">
                        <X size={22} />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    <div className="flex flex-wrap gap-2">
                        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-black uppercase text-[10px] tracking-wider ${statusClass}`}>
                            <Package size={12} /> {order.status_label || order.status}
                        </div>
                        <div className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-1.5 text-gray-700 font-bold text-[11px] uppercase tracking-wider">
                            <CreditCard size={12} /> {order.payment_method === 'webpay' ? 'Webpay Plus' : 'Transferencia'}
                        </div>
                    </div>

                    {order.payment_method === 'transfer' && order.status === 'pending' && (
                        <div className="bg-blue-50 p-5 md:p-6 rounded-2xl border border-blue-100 animate-in fade-in">
                            <h4 className="font-black text-blue-900 mb-2 flex items-center gap-2 text-sm">
                                <Building2 size={18} /> Datos para transferencia
                            </h4>
                            <p className="text-xs text-blue-800 mb-4 leading-relaxed">
                                Tu pedido está reservado. Transferí el total y enviá el comprobante mencionando tu número de orden <strong>{order.order_number}</strong>.
                            </p>

                            {bankDetails ? (
                                <div className="bg-white p-4 md:p-5 rounded-xl border border-blue-100 text-sm grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-tenri-900"></div>
                                    <BankRow label="Banco" value={bankDetails.bank_name} />
                                    <BankRow label="Tipo" value={bankDetails.bank_account_type} />
                                    <BankRow label="N° Cuenta" value={bankDetails.bank_account_number} mono />
                                    <BankRow label="RUT" value={bankDetails.bank_rut} mono />
                                    <BankRow label="Correo" value={bankDetails.bank_email} colSpan={2} />
                                </div>
                            ) : (
                                <div className="bg-white/50 p-4 rounded-xl border border-blue-100 text-xs text-blue-600 animate-pulse">
                                    Cargando datos bancarios...
                                </div>
                            )}
                        </div>
                    )}

                    {(order.shipping_provider || order.tracking_number) && (
                        <div className="bg-indigo-50 p-5 md:p-6 rounded-2xl border border-indigo-100 animate-in fade-in">
                            <h4 className="font-black text-indigo-900 mb-3 flex items-center gap-2 text-sm">
                                <Truck size={18} /> Información de despacho
                            </h4>
                            <div className="bg-white p-4 md:p-5 rounded-xl border border-indigo-100/50 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Empresa de envío</p>
                                    <p className="font-bold text-gray-900">
                                        {PROVEEDORES_ENVIO[order.shipping_provider] || order.shipping_provider || 'No asignado'}
                                    </p>
                                </div>

                                {order.tracking_number && (
                                    <div className="flex-1 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-5">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Código de seguimiento</p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="font-mono font-black text-tenri-900 text-base md:text-lg tracking-wider">{order.tracking_number}</p>
                                            {trackingUrl && (
                                                <a
                                                    href={trackingUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                                                >
                                                    Rastrear envío <ExternalLink size={12}/>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {statusLogs.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
                            <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-sm">
                                <History size={16} className="text-tenri-600" /> Historial del pedido
                            </h4>
                            <ol className="relative border-l-2 border-gray-100 ml-3 space-y-4">
                                {statusLogs.map((log, idx) => {
                                    const logClass = STATUS_COLORS[log.status] || 'bg-gray-50 text-gray-600 border-gray-100';
                                    return (
                                        <li key={log.id || idx} className="ml-4">
                                            <div className="absolute -left-[7px] w-3 h-3 rounded-full bg-tenri-900 border-2 border-white"></div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${logClass}`}>
                                                    {log.status_label || log.status}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock size={10} /> {new Date(log.created_at).toLocaleString('es-CL')}
                                                </span>
                                            </div>
                                            {log.notes && (
                                                <p className="text-xs text-gray-600 leading-relaxed">{log.notes}</p>
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                                <MapPin size={16} className="text-tenri-600" /> Dirección de envío
                            </h4>
                            <div className="bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100 text-xs text-gray-600 leading-relaxed">
                                {order.shipping_address || 'Sin dirección registrada'}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                                <FileText size={16} className="text-tenri-600" /> Notas del cliente
                            </h4>
                            <div className="bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100 text-xs text-gray-600 italic leading-relaxed">
                                {order.notes || 'Sin notas adjuntas.'}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-3 text-sm">Productos</h4>
                        <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
                            {(order.items || []).map((item) => {
                                const img = item.product?.images?.[0]?.url;
                                return (
                                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 bg-white hover:bg-gray-50 transition-colors">
                                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                                            {img ? (
                                                <img src={`${BASE_URL}${img}`} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <ImageIcon size={20} className="text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 text-sm truncate">{item.product_name}</p>
                                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">SKU: {item.sku_snapshot}</p>
                                        </div>
                                        <div className="text-left sm:text-right shrink-0">
                                            <p className="text-xs text-gray-500 mb-0.5">{item.quantity} × {formatPrice(item.unit_price)}</p>
                                            <p className="font-black text-gray-900 text-sm">{formatPrice(item.total_line)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-full md:w-80 space-y-2 bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100">
                            <SummaryRow label="Subtotal neto" value={formatPrice(subtotalNeto)} />
                            <SummaryRow label="IVA (19%)" value={formatPrice(iva)} />
                            <SummaryRow label="Envío" value={formatPrice(order.shipping_cost)} />
                            <div className="flex justify-between font-black text-lg md:text-xl text-tenri-900 pt-3 border-t border-gray-200">
                                <span>Total</span>
                                <span>{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const BankRow = ({ label, value, mono = false, colSpan = 1 }) => (
    <div className={colSpan === 2 ? 'sm:col-span-2' : ''}>
        <span className="text-gray-400 font-medium text-xs">{label}:</span>{' '}
        <span className={`font-bold text-gray-900 ml-1 ${mono ? 'font-mono tracking-wider text-tenri-900' : ''}`}>
            {value || 'No disponible'}
        </span>
    </div>
);

const SummaryRow = ({ label, value }) => (
    <div className="flex justify-between text-sm text-gray-600 font-medium">
        <span>{label}</span>
        <span>{value}</span>
    </div>
);

export default OrderDetailModal;
