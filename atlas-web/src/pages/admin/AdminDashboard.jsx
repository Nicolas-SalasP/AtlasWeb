import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { 
    TrendingUp, Users, Package, AlertTriangle, 
    Activity, DollarSign, Calendar, MapPin, CheckCircle, MessageSquare // Importamos MessageSquare para tickets
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer 
} from 'recharts';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Esta ruta apunta a DashboardController@index en tu backend
                const response = await api.get('/admin/dashboard'); 
                setData(response.data);
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-atlas-900"></div>
        </div>
    );

    if (!data) return <div className="p-10 text-center text-gray-500">No hay datos disponibles en este momento.</div>;

    // Transformamos los datos del gráfico (array de enteros) a objetos para Recharts
    const chartData = data.chart_data.map((value, index) => ({
        day: `Día ${index + 1}`,
        ventas: value
    }));

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50/50">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Atlas</h1>
                <p className="text-gray-500">Resumen de operaciones en tiempo real.</p>
            </div>

            {/* 1. KPIS PRINCIPALES (GRID DE 4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                {/* VENTAS */}
                <StatCard 
                    title="Ventas Mes" 
                    value={`$${data.kpis.ventas.value.toLocaleString('es-CL')}`} 
                    trend={data.kpis.ventas.trend} 
                    icon={<DollarSign size={24} />} 
                    color="bg-emerald-500"
                />
                
                {/* PEDIDOS (HISTÓRICO) */}
                <StatCard 
                    title="Pedidos Totales" 
                    value={data.kpis.pedidos.value} 
                    trend={data.kpis.pedidos.trend} 
                    icon={<Package size={24} />} 
                    color="bg-blue-500"
                />
                
                {/* VALOR PROMEDIO (TICKET) */}
                <StatCard 
                    title="Valor Promedio" 
                    value={`$${data.kpis.ticket.value.toLocaleString('es-CL')}`} 
                    trend={data.kpis.ticket.trend} 
                    icon={<Activity size={24} />} 
                    color="bg-violet-500"
                />
                
                {/* NUEVO KPI: RECLAMOS / TICKETS */}
                <StatCard 
                    title="Reclamos (Mes)" 
                    value={data.kpis.reclamos ? data.kpis.reclamos.value : 0} 
                    trend={data.kpis.reclamos ? data.kpis.reclamos.trend : 0} 
                    icon={<MessageSquare size={24} />} 
                    color="bg-rose-500"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-8">
                
                {/* 2. GRÁFICO DE VENTAS (Últimos 10 días) - Ocupa 2 columnas */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Activity className="text-atlas-900" size={20} /> Tendencia de Ventas (10 días)
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`$${value.toLocaleString('es-CL')}`, 'Ventas']}
                                />
                                <Area type="monotone" dataKey="ventas" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. INSIGHTS Y AVISOS - Ocupa 1 columna */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-atlas-900" size={20} /> Alertas del Sistema
                        </h3>
                        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {data.insights.map((insight, idx) => (
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
                                    <div>
                                        <p className="font-bold text-sm">{insight.title}</p>
                                        <p className="text-xs opacity-90 mt-1 leading-relaxed">{insight.message}</p>
                                    </div>
                                </div>
                            ))}
                            {data.insights.length === 0 && (
                                <div className="text-center py-10 text-gray-400">
                                    <CheckCircle size={40} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Todo opera con normalidad.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                
                {/* 4. TOP PRODUCTOS */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Package className="text-atlas-900" size={20} /> Top Productos
                    </h3>
                    <div className="space-y-3">
                        {data.top_products.map((prod, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                        #{idx+1}
                                    </span>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 group-hover:text-atlas-600 transition-colors">{prod.nombre}</p>
                                        <p className="text-xs text-gray-500 font-medium">Stock: {prod.stock}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-atlas-900">${parseInt(prod.ingresos).toLocaleString('es-CL')}</p>
                                    <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md inline-block mt-1">
                                        {prod.ventas} unid.
                                    </p>
                                </div>
                            </div>
                        ))}
                        {data.top_products.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No hay ventas registradas aún.</p>}
                    </div>
                </div>

                {/* 5. TOP ZONAS DE ENVÍO */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <MapPin className="text-atlas-900" size={20} /> Zonas de Mayor Demanda
                    </h3>
                    <div className="space-y-6">
                        {data.top_zones.map((zona, idx) => (
                            <div key={idx} className="relative">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-bold text-gray-700 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-atlas-900"></span>
                                        {zona.comuna}
                                    </span>
                                    <span className="font-bold text-atlas-900">{zona.envios} Envíos <span className="text-gray-400 font-normal">({zona.porcentaje}%)</span></span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className="bg-atlas-900 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                        style={{ width: `${zona.porcentaje}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {data.top_zones.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No hay datos de envíos aún.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente Tarjeta KPI
const StatCard = ({ title, value, trend, icon, color }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 relative overflow-hidden group cursor-default">
        {/* Icono de fondo decorativo */}
        <div className={`absolute -top-2 -right-2 p-4 opacity-[0.08] group-hover:opacity-20 transition-opacity ${color.replace('bg-', 'text-')} transform rotate-12 group-hover:rotate-0 transition-transform duration-500`}>
            {React.cloneElement(icon, { size: 64 })}
        </div>
        
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 ${color} shadow-lg shadow-gray-200 group-hover:shadow-${color.replace('bg-', '')}/30 transition-shadow`}>
                {icon}
            </div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
            <div className="flex items-baseline gap-3">
                <h4 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h4>
                {trend !== undefined && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
        </div>
    </div>
);

export default AdminDashboard;