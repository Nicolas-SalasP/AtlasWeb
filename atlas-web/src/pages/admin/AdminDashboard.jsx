import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
    TrendingUp, Users, ShoppingBag, DollarSign,
    MapPin, ArrowUpRight, ArrowDownRight, Package, AlertTriangle, Sparkles, Loader2, CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [periodo, setPeriodo] = useState('mes');

    useEffect(() => {
        const fetchData = async () => {
            try {
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

    if (loading) return <div className="h-screen flex items-center justify-center gap-2 text-atlas-900"><Loader2 className="animate-spin" /> Analizando Datos...</div>;

    // Data Safalguard
    const kpi = data?.kpis || { ventas: { value: 0 }, pedidos: { value: 0 }, ticket: { value: 0 }, conversion: { value: 0 } };
    const chartData = data?.chart_data || [];
    const topProducts = data?.top_products || [];
    const topZones = data?.top_zones || [];
    const insights = data?.insights || [];

    return (
        <div className="space-y-8 pb-10 animate-in slide-in-from-bottom-4 fade-in duration-700 p-6 md:p-10">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Ejecutivo</h1>
                    <p className="text-gray-500 mt-1">Visión general en tiempo real</p>
                </div>
                {/* Filtro visual (no funcional en back por ahora) */}
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex text-sm font-medium">
                    {['semana', 'mes', 'anio'].map((p) => (
                        <button key={p} onClick={() => setPeriodo(p)} className={`px-5 py-2 rounded-xl capitalize transition-all ${periodo === p ? 'bg-atlas-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                            {p === 'anio' ? 'Año' : p}
                        </button>
                    ))}
                </div>
            </div>

            {/* 1. KPIs REALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Ventas" value={`$${kpi.ventas.value.toLocaleString('es-CL')}`} trend={kpi.ventas.trend} icon={<DollarSign size={28} />} gradientBg="bg-gradient-to-br from-white to-green-50/50" iconColor="text-green-600" trendColor="text-green-600 bg-green-100/50" />
                <KpiCard title="Pedidos" value={kpi.pedidos.value} trend={kpi.pedidos.trend} icon={<ShoppingBag size={28} />} gradientBg="bg-gradient-to-br from-white to-blue-50/50" iconColor="text-blue-600" trendColor="text-blue-600 bg-blue-100/50" />
                <KpiCard title="Ticket Prom." value={`$${kpi.ticket.value.toLocaleString('es-CL')}`} trend={kpi.ticket.trend} icon={<TrendingUp size={28} />} gradientBg="bg-gradient-to-br from-white to-purple-50/50" iconColor="text-purple-600" trendColor="text-red-600 bg-red-100/50" />
                <KpiCard title="Conversión" value={kpi.conversion.value} trend={kpi.conversion.trend} icon={<Users size={28} />} gradientBg="bg-gradient-to-br from-white to-orange-50/50" iconColor="text-orange-600" trendColor="text-orange-600 bg-orange-100/50" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* 2. GRÁFICO (TOOLTIP SOLO AL PASAR MOUSE) */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border-0 relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-100/30 transition-all duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-bold text-gray-900 text-xl">Tendencia de Ingresos</h3>
                            <p className="text-gray-400 text-sm">Últimos 10 días</p>
                        </div>
                        <span className="flex items-center gap-1 text-sm text-green-700 font-bold bg-green-100/80 px-3 py-1.5 rounded-full"><ArrowUpRight size={16} /> Dinámico</span>
                    </div>
                    <div className="relative h-80 w-full">
                        <SmoothAreaChart data={chartData} />
                    </div>
                </div>

                {/* 3. ATLAS AI INSIGHTS (GENERADOS POR BACKEND) */}
                <div className="bg-gradient-to-br from-atlas-900 via-blue-900 to-atlas-800 text-white p-8 rounded-[2rem] shadow-2xl shadow-blue-900/30 flex flex-col justify-between relative overflow-hidden isolate">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-30 -z-10"></div>
                    <div>
                        <h3 className="font-bold text-2xl mb-2 flex items-center gap-3"><Sparkles className="text-yellow-300" size={24} /> Atlas AI</h3>
                        <p className="text-blue-200 text-sm mb-8">Análisis automático de tu negocio.</p>
                        <div className="space-y-4">
                            {insights.map((insight, idx) => (
                                <div key={idx} className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg transition-transform hover:scale-105">
                                    <p className={`text-base font-bold mb-1 flex items-center gap-2 ${insight.type === 'warning' ? 'text-yellow-300' : insight.type === 'success' ? 'text-green-300' : 'text-blue-200'}`}>
                                        {insight.icon === 'alert' ? <AlertTriangle size={18} className="animate-pulse" /> : insight.icon === 'check' ? <CheckCircle size={18}/> : <MapPin size={18} />} 
                                        {insight.title}
                                    </p>
                                    <p className="text-sm text-gray-100/90 leading-snug">{insight.message}</p>
                                </div>
                            ))}
                            {insights.length === 0 && <p className="text-sm text-white/50 italic">Sin alertas por el momento.</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* 4. TOP PRODUCTOS (REAL) */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border-0">
                    <h3 className="font-bold text-gray-900 text-xl mb-8 flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><Package size={24} /></div> Top Productos
                    </h3>
                    <div className="space-y-8">
                        {topProducts.map((prod, i) => (
                            <div key={i} className="relative group">
                                <div className="flex justify-between items-center mb-2 z-10 relative">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl shadow-sm bg-gray-50 w-10 h-10 flex items-center justify-center rounded-full">📦</span>
                                        <div><span className="font-bold text-gray-800 block text-sm">{prod.nombre}</span><span className="text-xs text-gray-400">{prod.ventas} ventas • {prod.stock} stock</span></div>
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm">${parseInt(prod.ingresos).toLocaleString('es-CL')}</span>
                                </div>
                                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-atlas-500 to-blue-400 h-3 rounded-full relative" style={{ width: `${Math.min((prod.ventas / 10) * 100, 100)}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. ZONAS CALIENTES (REAL) */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border-0 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 text-xl mb-8 flex items-center gap-3">
                            <div className="bg-red-100 p-2 rounded-xl text-red-600"><MapPin size={24} /></div> Zonas Calientes
                        </h3>
                        <div className="space-y-6">
                            {topZones.length > 0 ? topZones.map((zona, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between mb-2 items-end">
                                        <span className="font-bold text-gray-700 text-base">{zona.comuna}</span>
                                        <span className="text-sm font-medium text-gray-500">{zona.porcentaje}% ({zona.envios} envíos)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden p-0.5">
                                        <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000" style={{ width: `${zona.porcentaje}%` }}></div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <MapPin size={32} className="mx-auto mb-2 opacity-20"/>
                                    <p className="text-sm">Sin datos geográficos suficientes.</p>
                                    <p className="text-[10px] mt-1">Las órdenes deben tener dirección asociada.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- KPI CARD --- */
const KpiCard = ({ title, value, trend, icon, gradientBg, iconColor, trendColor }) => (
    <div className={`relative overflow-hidden p-6 rounded-[2rem] shadow-xl shadow-gray-100/50 hover:shadow-2xl transition-all duration-300 group ${gradientBg} border-0`}>
        <div className={`absolute -right-4 -top-4 opacity-10 group-hover:scale-110 duration-500 ${iconColor}`}>{React.cloneElement(icon, { size: 80 })}</div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-white shadow-sm ${iconColor} group-hover:scale-110 transition-transform`}>{icon}</div>
                <div className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full ${trendColor}`}>{trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}{Math.abs(trend)}%</div>
            </div>
            <div><p className="text-sm text-gray-500 font-medium mb-2">{title}</p><h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3></div>
        </div>
    </div>
);

/* --- GRÁFICO SUAVE CON INTERACCIÓN HOVER --- */
const SmoothAreaChart = ({ data }) => {
    const safeData = data && data.length > 0 ? data : [0, 0, 0, 0, 0];
    const width = 800; const height = 300;
    
    // Calcular path
    const maxX = safeData.length > 1 ? safeData.length - 1 : 1;
    const maxY = Math.max(...safeData) || 100;
    const points = safeData.map((val, i) => {
        const x = (i / maxX) * width;
        const y = height - (val / maxY) * height * 0.7; // 70% altura para dejar espacio arriba
        return [x, y];
    });
    
    let d = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
        const [x0, y0] = points[i];
        const [x1, y1] = points[i + 1];
        const cp1x = x0 + (x1 - x0) * 0.4; const cp1y = y0;
        const cp2x = x1 - (x1 - x0) * 0.4; const cp2y = y1;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x1},${y1}`;
    }

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
                <linearGradient id="blueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <path d={`${d} L ${width},${height} L 0,${height} Z`} fill="url(#blueGradient)" />
            <path d={d} fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" filter="url(#glow)" className="drop-shadow-lg" />
            
            {/* PUNTOS INTERACTIVOS */}
            {points.map(([x, y], i) => (
                <g key={i} className="group cursor-pointer">
                    {/* Área invisible grande para facilitar el hover */}
                    <circle cx={x} cy={y} r="20" fill="transparent" />
                    
                    {/* Punto Visible (se agranda al hover) */}
                    <circle cx={x} cy={y} r="5" className="fill-white stroke-blue-600 stroke-[3px] transition-all duration-300 group-hover:r-8 group-hover:fill-blue-50" />
                    
                    {/* TOOLTIP (Solo visible en group-hover) */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none transform group-hover:-translate-y-2 transition-transform">
                        <rect x={x - 35} y={y - 50} width="70" height="35" rx="8" className="fill-atlas-900 shadow-xl" />
                        {/* Triángulo abajo */}
                        <path d={`M ${x},${y - 15} L ${x - 6},${y - 20} L ${x + 6},${y - 20} Z`} className="fill-atlas-900" />
                        <text x={x} y={y - 28} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" style={{fontFamily: 'sans-serif'}}>
                            ${safeData[i].toLocaleString('es-CL')}
                        </text>
                    </g>
                </g>
            ))}
        </svg>
    );
};

export default AdminDashboard;