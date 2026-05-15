import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
    Package, AlertTriangle,
    Activity, DollarSign, MapPin, CheckCircle, MessageSquare,
    ShoppingCart, ArrowRight, Loader2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

const buildChartLabels = (count = 10) => {
    const today = new Date();
    const labels = [];
    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }));
    }
    return labels;
};

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [notifs, setNotifs] = useState({ pending_orders: 0, new_tickets: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summary, notifications] = await Promise.all([
                    api.get('/admin/dashboard'),
                    api.get('/admin/notifications-summary').catch(() => ({ data: { pending_orders: 0, new_tickets: 0 } })),
                ]);
                setData(summary.data);
                setNotifs(notifications.data);
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center gap-2 text-tenri-900">
            <Loader2 className="animate-spin" /> Cargando Dashboard...
        </div>
    );

    if (!data) return <div className="p-10 text-center text-gray-500">No hay datos disponibles en este momento.</div>;

    const chartLabels = buildChartLabels(data.chart_data?.length || 10);
    const chartData = (data.chart_data || []).map((value, index) => ({
        day: chartLabels[index] || `Día ${index + 1}`,
        ventas: value
    }));

    const kpis = data.kpis || {};
    const topProducts = data.top_products || [];
    const topZones = data.top_zones || [];
    const insights = data.insights || [];

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50/50">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Dashboard Tenri</h1>
                <p className="text-gray-500 text-sm md:text-base">Resumen de operaciones en tiempo real.</p>
            </div>

            {(notifs.pending_orders > 0 || notifs.new_tickets > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {notifs.pending_orders > 0 && (
                        <Link to="/admin/pedidos" className="bg-white border-2 border-amber-200 hover:border-amber-300 hover:shadow-lg transition-all rounded-2xl p-4 flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <ShoppingCart size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-0.5">Pedidos pendientes</p>
                                <p className="text-sm text-gray-700"><span className="font-black text-lg">{notifs.pending_orders}</span> {notifs.pending_orders === 1 ? 'pedido espera' : 'pedidos esperan'} confirmación</p>
                            </div>
                            <ArrowRight size={18} className="text-amber-600 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                    {notifs.new_tickets > 0 && (
                        <Link to="/admin/tickets" className="bg-white border-2 border-rose-200 hover:border-rose-300 hover:shadow-lg transition-all rounded-2xl p-4 flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                                <MessageSquare size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-0.5">Tickets nuevos</p>
                                <p className="text-sm text-gray-700"><span className="font-black text-lg">{notifs.new_tickets}</span> {notifs.new_tickets === 1 ? 'ticket sin' : 'tickets sin'} responder</p>
                            </div>
                            <ArrowRight size={18} className="text-rose-600 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <StatCard
                    title="Ventas Mes"
                    value={`$${(kpis.ventas?.value || 0).toLocaleString('es-CL')}`}
                    trend={kpis.ventas?.trend}
                    icon={<DollarSign size={24} />}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Pedidos Totales"
                    value={kpis.pedidos?.value || 0}
                    trend={kpis.pedidos?.trend}
                    icon={<Package size={24} />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Valor Promedio"
                    value={`$${(kpis.ticket?.value || 0).toLocaleString('es-CL')}`}
                    trend={kpis.ticket?.trend}
                    icon={<Activity size={24} />}
                    color="bg-violet-500"
                />
                <StatCard
                    title="Reclamos (Mes)"
                    value={kpis.reclamos?.value || 0}
                    trend={kpis.reclamos?.trend}
                    icon={<MessageSquare size={24} />}
                    color="bg-rose-500"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6 md:gap-8 mb-8">

                <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Activity className="text-tenri-900" size={20} /> Tendencia de Ventas (10 días)
                    </h3>
                    <div className="h-64 md:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`$${value.toLocaleString('es-CL')}`, 'Ventas']}
                                    labelStyle={{ fontWeight: 'bold', color: '#1F2937' }}
                                />
                                <Area type="monotone" dataKey="ventas" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-tenri-900" size={20} /> Alertas del Sistema
                        </h3>
                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-72 lg:max-h-none">
                            {insights.map((insight, idx) => (
                                <div key={idx} className={`p-4 rounded-2xl flex gap-3 items-start transition-all hover:scale-[1.02] ${
                                    insight.type === 'warning' ? 'bg-red-50 text-red-700' :
                                    insight.type === 'success' ? 'bg-green-50 text-green-700' :
                                    'bg-blue-50 text-blue-700'
                                }`}>
                                    <div className="mt-1 flex-shrink-0">
                                        {insight.type === 'warning' && <AlertTriangle size={18} />}
                                        {insight.type === 'success' && <CheckCircle size={18} />}
                                        {insight.type === 'info' && <MapPin size={18} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm">{insight.title}</p>
                                        <p className="text-xs opacity-90 mt-1 leading-relaxed">{insight.message}</p>
                                    </div>
                                </div>
                            ))}
                            {insights.length === 0 && (
                                <div className="text-center py-10 text-gray-400">
                                    <CheckCircle size={40} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Todo opera con normalidad.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">

                <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Package className="text-tenri-900" size={20} /> Top Productos
                        </h3>
                        <Link to="/admin/productos" className="text-xs font-bold text-tenri-600 hover:text-tenri-900 flex items-center gap-1 hover:bg-tenri-50 px-3 py-1.5 rounded-lg transition-colors">
                            Ver todos <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {topProducts.map((prod, idx) => (
                            <Link
                                key={idx}
                                to="/admin/productos"
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold shrink-0 ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                                        #{idx+1}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-gray-900 group-hover:text-tenri-600 transition-colors truncate">{prod.nombre}</p>
                                        <p className="text-xs text-gray-500 font-medium">Stock: {prod.stock}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                    <p className="font-bold text-tenri-900 text-sm">${parseInt(prod.ingresos).toLocaleString('es-CL')}</p>
                                    <p className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md inline-block mt-1">
                                        {prod.ventas} unid.
                                    </p>
                                </div>
                            </Link>
                        ))}
                        {topProducts.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No hay ventas registradas aún.</p>}
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <MapPin className="text-tenri-900" size={20} /> Zonas de Mayor Demanda
                    </h3>
                    <div className="space-y-5">
                        {topZones.map((zona, idx) => (
                            <div key={idx} className="relative">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-bold text-gray-700 flex items-center gap-2 truncate">
                                        <span className="w-2 h-2 rounded-full bg-tenri-900 shrink-0"></span>
                                        <span className="truncate">{zona.comuna}</span>
                                    </span>
                                    <span className="font-bold text-tenri-900 shrink-0 ml-2">{zona.envios} <span className="text-gray-400 font-normal text-xs">({zona.porcentaje}%)</span></span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-tenri-900 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${zona.porcentaje}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {topZones.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No hay datos de envíos aún.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, trend, icon, color }) => (
    <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 relative overflow-hidden group cursor-default">
        <div className={`absolute -top-2 -right-2 p-4 opacity-[0.08] group-hover:opacity-20 transition-opacity ${color.replace('bg-', 'text-')} transform rotate-12 group-hover:rotate-0 transition-transform duration-500`}>
            {React.cloneElement(icon, { size: 64 })}
        </div>

        <div className="relative z-10">
            <div className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-white mb-4 ${color} shadow-lg shadow-gray-200 transition-shadow`}>
                {icon}
            </div>
            <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
            <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                <h4 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{value}</h4>
                {trend !== undefined && trend !== null && trend !== 0 && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
        </div>
    </div>
);

export default AdminDashboard;