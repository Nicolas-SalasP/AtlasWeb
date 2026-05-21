import React from 'react';
import { Package, Calendar, CreditCard, Loader2, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../api/constants';

const STATUS_COLORS = {
    paid:       'bg-emerald-50 text-emerald-700 border-emerald-100',
    pending:    'bg-amber-50 text-amber-700 border-amber-100',
    preparing:  'bg-blue-50 text-blue-700 border-blue-100',
    shipped:    'bg-indigo-50 text-indigo-700 border-indigo-100',
    delivered:  'bg-emerald-50 text-emerald-700 border-emerald-100',
    cancelled:  'bg-red-50 text-red-700 border-red-100',
    refunded:   'bg-rose-50 text-rose-700 border-rose-100',
};

const formatPrice = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);

const MisPedidos = ({ orders, loading, onSelectOrder }) => {
    const navigate = useNavigate();

    if (loading) return (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 flex items-center justify-center gap-2 text-tenri-900">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm font-medium">Cargando pedidos...</span>
        </div>
    );

    if (!orders || orders.length === 0) return (
        <div className="bg-white p-10 md:p-12 rounded-2xl text-center border border-gray-100">
            <div className="w-20 h-20 bg-tenri-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <ShoppingBag size={32} className="text-tenri-700" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">Aún no tienes pedidos</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                Cuando hagas tu primera compra, podrás hacer seguimiento aquí.
            </p>
            <button
                onClick={() => navigate('/catalogo')}
                className="inline-flex items-center gap-2 bg-tenri-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-tenri-800 transition-all shadow-md text-sm group"
            >
                Explorar catálogo
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in">
            <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Historial de compras</h2>
                <span className="text-sm text-gray-500 font-medium">{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}</span>
            </div>

            <div className="grid gap-3">
                {orders.map((order) => {
                    const statusClass = STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600 border-gray-100';
                    const itemsCount = order.items?.length || 0;

                    return (
                        <div
                            key={order.id}
                            onClick={() => onSelectOrder(order)}
                            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-tenri-200 transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <span className="font-black text-base md:text-lg text-gray-900">{order.order_number}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusClass}`}>
                                            {order.status_label || order.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(order.created_at).toLocaleDateString('es-CL')}</span>
                                        <span className="flex items-center gap-1"><CreditCard size={12}/> {order.payment_method === 'webpay' ? 'Webpay' : 'Transferencia'}</span>
                                        <span className="flex items-center gap-1"><Package size={12}/> {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-black text-lg md:text-xl text-tenri-900">{formatPrice(order.total)}</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {order.items?.slice(0, 4).map((item, idx) => {
                                        const img = item.product?.images?.[0]?.url;
                                        return (
                                            <div key={idx} className="w-9 h-9 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                                                {img ? (
                                                    <img src={`${BASE_URL}${img}`} alt="" className="w-full h-full object-cover" loading="lazy" />
                                                ) : (
                                                    <Package size={14} className="text-gray-400"/>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {itemsCount > 4 && (
                                        <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                                            +{itemsCount - 4}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-tenri-700 group-hover:translate-x-1 transition-transform">
                                    Ver detalle <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MisPedidos;
