import React from 'react';
import { X, MapPin, FileText, Package, CreditCard, Image as ImageIcon } from 'lucide-react';

const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    // Helpers locales (podrían ir en utils.js)
    const formatPrice = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    const getStatusColor = (status) => {
        const colors = { paid: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-50 text-amber-700', shipped: 'bg-blue-50 text-blue-700', cancelled: 'bg-red-50 text-red-700', delivered: 'bg-gray-100 text-gray-700' };
        return colors[status] || 'bg-gray-50';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Pedido #{order.order_number}</h3>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-8">
                    <div className="flex flex-wrap gap-4">
                        <div className={`px-4 py-2 rounded-lg border ${getStatusColor(order.status)} bg-opacity-10 flex items-center gap-2 font-bold`}>
                            <Package size={18} /> {order.status}
                        </div>
                        <div className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-2 text-gray-700 font-medium">
                            <CreditCard size={18} /> {order.payment_method === 'webpay' ? 'Webpay' : 'Transferencia'}
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={18} className="text-atlas-600" /> Dirección de Envío</h4>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600">{order.shipping_address || 'Sin dirección'}</div>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText size={18} className="text-atlas-600" /> Notas</h4>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 italic">{order.notes || 'Sin notas'}</div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Productos</h4>
                        <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
                            {order.items?.map((item) => (
                                <div key={item.id} className="p-4 flex items-center gap-4 bg-white hover:bg-gray-50">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                                        {item.product?.images?.[0]?.url ? <img src={`${import.meta.env.VITE_API_URL}${item.product.images[0].url}`} className="w-full h-full object-cover"/> : <ImageIcon size={24} className="text-gray-300" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{item.product_name}</p>
                                        <p className="text-sm text-gray-500">SKU: {item.sku_snapshot}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">{item.quantity} x {formatPrice(item.unit_price)}</p>
                                        <p className="font-bold text-gray-900">{formatPrice(item.total_line)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <div className="w-full md:w-80 space-y-3 bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal Neto</span><span>{formatPrice(Math.round(order.subtotal / 1.19))}</span></div>
                            <div className="flex justify-between text-sm text-gray-600"><span>IVA (19%)</span><span>{formatPrice(order.subtotal - Math.round(order.subtotal / 1.19))}</span></div>
                            <div className="flex justify-between text-sm text-gray-600 border-b border-gray-200 pb-3"><span>Envío</span><span>{formatPrice(order.shipping_cost)}</span></div>
                            <div className="flex justify-between font-black text-xl text-atlas-900 pt-1"><span>Total</span><span>{formatPrice(order.total)}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;