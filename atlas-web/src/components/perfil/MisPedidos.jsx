import React from 'react';
import { Package, Calendar, CreditCard, Loader2, ChevronRight } from 'lucide-react';

const MisPedidos = ({ orders, loading, onSelectOrder }) => {
    // Helpers locales
    const formatPrice = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    
    const getStatusColor = (status) => {
        const colors = {
            paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            shipped: 'bg-blue-50 text-blue-700 border-blue-200',
            cancelled: 'bg-red-50 text-red-700 border-red-200',
            delivered: 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return colors[status] || 'bg-gray-50 text-gray-600 border-gray-200';
    };

    const getStatusLabel = (status) => {
        const labels = { paid: 'Pagado', pending: 'Pendiente', shipped: 'Enviado', cancelled: 'Anulado', delivered: 'Entregado' };
        return labels[status] || status;
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;
    
    if (orders.length === 0) return (
        <div className="bg-white p-12 rounded-xl text-center border border-gray-100">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Aún no tienes pedidos.</p>
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Compras ({orders.length})</h2>
            <div className="grid gap-4">
                {orders.map((order) => (
                    <div key={order.id} onClick={() => onSelectOrder(order)} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-atlas-200 transition-all cursor-pointer group">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-lg text-gray-900">{order.order_number}</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(order.created_at).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><CreditCard size={14}/> {order.payment_method === 'webpay' ? 'Webpay' : 'Transferencia'}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-xl text-atlas-900">{formatPrice(order.total)}</p>
                            </div>
                        </div>
                        {/* Miniaturas */}
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex -space-x-3">
                                {order.items?.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                                        {item.product?.images?.[0]?.url ? <img src={`${import.meta.env.VITE_API_URL}${item.product.images[0].url}`} className="w-full h-full object-cover"/> : <Package size={16} className="text-gray-400"/>}
                                    </div>
                                ))}
                                {order.items?.length > 4 && <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">+{order.items.length - 4}</div>}
                            </div>
                            <div className="flex items-center gap-1 text-sm font-bold text-atlas-600 group-hover:translate-x-1 transition-transform">Ver detalle <ChevronRight size={16} /></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MisPedidos;