import React, { useState, useEffect } from 'react';
import { X, MapPin, FileText, Package, CreditCard, Image as ImageIcon, Building2, Truck, ExternalLink } from 'lucide-react';
import api from '../../api/axiosConfig'; 

// --- DICCIONARIOS Y HELPERS PARA TRACKING ---
const PROVEEDORES_ENVIO = {
    'propio': 'Reparto Propio / Interno',
    'bluexpress': 'BlueExpress',
    'starken': 'Starken',
    'chilexpress': 'Chilexpress',
    'correos': 'Correos de Chile'
};

const getTrackingLink = (provider, code) => {
    if (!code) return "#";
    switch (provider) {
        case 'bluexpress': return `https://www.blue.cl/seguimiento/?codigo=${code}`;
        case 'starken': return `https://www.starken.cl/seguimiento?codigo=${code}`;
        case 'chilexpress': return `https://www.chilexpress.cl/Views/ChilexpressCL/Resultado-busqueda.aspx?DATA=${code}`;
        case 'correos': return `https://www.correos.cl/web/guest/seguimiento-en-linea?objEnvio=${code}`;
        default: return "#";
    }
};

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

    const formatPrice = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    
    const getStatusColor = (status) => {
        const colors = { 
            paid: 'bg-emerald-100 text-emerald-700', 
            pending: 'bg-amber-50 text-amber-700', 
            preparing: 'bg-blue-50 text-blue-700',
            shipped: 'bg-indigo-100 text-indigo-700', 
            cancelled: 'bg-red-50 text-red-700', 
            delivered: 'bg-gray-100 text-gray-700',
            refunded: 'bg-rose-100 text-rose-700'
        };
        return colors[status] || 'bg-gray-50';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 custom-scrollbar" onClick={e => e.stopPropagation()}>
                
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Pedido #{order.order_number}</h3>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={24} /></button>
                </div>

                <div className="p-6 space-y-8">
                    {/* ETIQUETAS ESTADO Y PAGO */}
                    <div className="flex flex-wrap gap-4">
                        <div className={`px-4 py-2 rounded-lg border ${getStatusColor(order.status)} bg-opacity-10 flex items-center gap-2 font-bold uppercase text-xs tracking-wider`}>
                            <Package size={16} /> {order.status}
                        </div>
                        <div className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-2 text-gray-700 font-medium text-sm">
                            <CreditCard size={16} /> {order.payment_method === 'webpay' ? 'Webpay Plus' : 'Transferencia Bancaria'}
                        </div>
                    </div>

                    {/* DATOS DE TRANSFERENCIA */}
                    {order.payment_method === 'transfer' && order.status === 'pending' && (
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <Building2 size={20} /> Datos para Transferencia
                            </h4>
                            <p className="text-sm text-blue-800 mb-5">
                                Tu pedido está reservado. Por favor, transfiere el total y envía el comprobante mencionando tu número de orden <strong>#{order.order_number}</strong>.
                            </p>
                            
                            {bankDetails ? (
                                <div className="bg-white p-5 rounded-xl border border-blue-100 text-sm grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-atlas-900"></div>
                                    <div><span className="text-gray-400 font-medium">Banco:</span> <span className="font-bold text-gray-900 ml-1">{bankDetails.bank_name || 'No disponible'}</span></div>
                                    <div><span className="text-gray-400 font-medium">Tipo:</span> <span className="font-bold text-gray-900 ml-1">{bankDetails.bank_account_type || 'No disponible'}</span></div>
                                    <div><span className="text-gray-400 font-medium">N° Cuenta:</span> <span className="font-mono font-bold text-atlas-900 tracking-wider ml-1 text-base">{bankDetails.bank_account_number || 'No disponible'}</span></div>
                                    <div><span className="text-gray-400 font-medium">RUT:</span> <span className="font-bold text-gray-900 ml-1">{bankDetails.bank_rut || 'No disponible'}</span></div>
                                    <div className="sm:col-span-2"><span className="text-gray-400 font-medium">Correo:</span> <span className="font-bold text-gray-900 ml-1">{bankDetails.bank_email || 'No disponible'}</span></div>
                                </div>
                            ) : (
                                <div className="bg-white/50 p-4 rounded-xl border border-blue-100 text-sm text-blue-600 animate-pulse flex items-center gap-2">
                                    Cargando datos bancarios...
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- ESTADO DEL DESPACHO / TRACKING --- */}
                    {(order.shipping_provider || order.tracking_number) && (
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm animate-in fade-in">
                            <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                <Truck size={20} /> Información de Despacho
                            </h4>
                            <div className="bg-white p-5 rounded-xl border border-indigo-100/50 flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Empresa de Envío</p>
                                    <p className="font-bold text-gray-900 text-lg">
                                        {PROVEEDORES_ENVIO[order.shipping_provider] || order.shipping_provider || 'No asignado'}
                                    </p>
                                </div>
                                
                                {order.tracking_number && (
                                    <div className="flex-1 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
                                        <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Código de Seguimiento</p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="font-mono font-black text-atlas-900 text-xl tracking-wider">{order.tracking_number}</p>
                                            
                                            {order.shipping_provider && order.shipping_provider !== 'propio' && (
                                                <a 
                                                    href={getTrackingLink(order.shipping_provider, order.tracking_number)} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                                                >
                                                    Rastrear Envío <ExternalLink size={16}/>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* DIRECCIÓN Y NOTAS */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={18} className="text-atlas-600" /> Dirección de Envío</h4>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed">{order.shipping_address || 'Sin dirección registrada'}</div>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText size={18} className="text-atlas-600" /> Notas del Cliente</h4>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 italic leading-relaxed">{order.notes || 'No se adjuntaron notas al pedido.'}</div>
                        </div>
                    </div>

                    {/* PRODUCTOS */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Productos</h4>
                        <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
                            {order.items?.map((item) => (
                                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-white hover:bg-gray-50 transition-colors">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                                        {item.product?.images?.[0]?.url ? <img src={`${import.meta.env.VITE_API_URL}${item.product.images[0].url}`} className="w-full h-full object-cover"/> : <ImageIcon size={24} className="text-gray-300" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{item.product_name}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {item.sku_snapshot}</p>
                                    </div>
                                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                                        <p className="text-sm text-gray-500 mb-0.5">Cant: {item.quantity} × {formatPrice(item.unit_price)}</p>
                                        <p className="font-black text-gray-900">{formatPrice(item.total_line)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TOTALES */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-80 space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex justify-between text-sm text-gray-600 font-medium"><span>Subtotal Neto</span><span>{formatPrice(Math.round(order.subtotal / 1.19))}</span></div>
                            <div className="flex justify-between text-sm text-gray-600 font-medium"><span>IVA (19%)</span><span>{formatPrice(order.subtotal - Math.round(order.subtotal / 1.19))}</span></div>
                            <div className="flex justify-between text-sm text-gray-600 font-medium border-b border-gray-200 pb-4 mb-1"><span>Envío</span><span>{formatPrice(order.shipping_cost)}</span></div>
                            <div className="flex justify-between font-black text-2xl text-atlas-900 pt-1"><span>Total</span><span>{formatPrice(order.total)}</span></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;