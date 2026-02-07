import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
    Search, ShoppingBag, Calendar, User,
    ChevronRight, DollarSign, Package, X, Loader2
} from 'lucide-react';

const AdminPedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    // Drawer Detalle
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = async () => {
        try {
            const response = await api.get('/admin/orders');
            setPedidos(response.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtrados = pedidos.filter(p =>
        p.order_number.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.user.name.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) return <div className="h-screen flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Cargando Ventas...</div>;

    return (
        <div className="h-[calc(100vh-80px)] p-6 md:p-10 bg-gray-50/50 flex flex-col overflow-hidden relative">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
                <p className="text-gray-500">Historial global de ventas</p>
            </div>

            {/* Tabla Contenedor */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 flex flex-col flex-1 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Buscar por Orden o Cliente..." className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl outline-none" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left sticky top-0">
                            <tr>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">Orden</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Cliente</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Total</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtrados.map((p) => (
                                <tr key={p.id} onClick={() => setPedidoSeleccionado(p)} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                                    <td className="px-8 py-4 font-mono font-bold text-atlas-900">{p.order_number}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">{p.user.name.charAt(0)}</div>
                                            <span className="text-sm font-medium">{p.user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-gray-900">${parseInt(p.total).toLocaleString('es-CL')}</td>
                                    <td className="px-6 py-4 text-gray-400 group-hover:text-atlas-900"><ChevronRight size={20} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DRAWER DETALLE PEDIDO */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${pedidoSeleccionado ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                {pedidoSeleccionado && (
                    <>
                        <div className="h-24 bg-atlas-900 flex items-center justify-between px-8 text-white flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-bold">{pedidoSeleccionado.order_number}</h2>
                                <p className="text-atlas-300 text-sm">{new Date(pedidoSeleccionado.created_at).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setPedidoSeleccionado(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Package size={18} /> Productos</h3>
                            <div className="space-y-4">
                                {pedidoSeleccionado.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{item.product_name}</p>
                                            <p className="text-xs text-gray-500">Cant: {item.quantity} x ${parseInt(item.unit_price).toLocaleString('es-CL')}</p>
                                        </div>
                                        <p className="font-bold text-atlas-900">${parseInt(item.total_line).toLocaleString('es-CL')}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 border-t border-gray-100 pt-6 space-y-2">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>${parseInt(pedidoSeleccionado.subtotal).toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Envío</span>
                                    <span>${parseInt(pedidoSeleccionado.shipping_cost).toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t border-gray-100 mt-2">
                                    <span>Total Pagado</span>
                                    <span>${parseInt(pedidoSeleccionado.total).toLocaleString('es-CL')}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {/* Backdrop */}
            {pedidoSeleccionado && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setPedidoSeleccionado(null)} />}
        </div>
    );
};

export default AdminPedidos;