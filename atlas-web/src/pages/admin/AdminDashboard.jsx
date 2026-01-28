import React, { useState } from 'react';
import {
    TrendingUp, Users, ShoppingBag, DollarSign,
    MapPin, ArrowUpRight, ArrowDownRight, Package, AlertTriangle, Sparkles
} from 'lucide-react';

// --- DATOS MOCK ---
const KPI_DATA = {
    ventas: { value: 4599000, trend: +12.5 },
    pedidos: { value: 84, trend: +5.2 },
    ticketPromedio: { value: 54750, trend: -2.1 },
    conversion: { value: "3.2%", trend: +0.8 }
};

const TOP_PRODUCTOS = [
    { id: 1, nombre: "Kit 4 Cámaras Hilook", ventas: 24, ingresos: 3599760, stock: 5, img: "📹" },
    { id: 2, nombre: "Router MikroTik hAP", ventas: 18, ingresos: 1187820, stock: 12, img: "📡" },
    { id: 3, nombre: "Bobina Cable UTP Cat6", ventas: 15, ingresos: 1348500, stock: 20, img: "➰" },
    { id: 4, nombre: "Switch PoE 8 Puertos", ventas: 8, ingresos: 360000, stock: 2, img: "🔌" },
];

const TOP_ZONAS = [
    { comuna: "Santiago Centro", envios: 35, porcentaje: 42 },
    { comuna: "Providencia", envios: 20, porcentaje: 24 },
    { comuna: "Las Condes", envios: 15, porcentaje: 18 },
    { comuna: "La Florida", envios: 8, porcentaje: 10 },
    { comuna: "Concepción", envios: 6, porcentaje: 6 },
];

const AdminDashboard = () => {
    const [periodo, setPeriodo] = useState('mes');

    return (
        <div className="space-y-8 pb-10 animate-in slide-in-from-bottom-4 fade-in duration-700">

            {/* HEADER + FILTROS */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Ejecutivo</h1>
                    <p className="text-gray-500 mt-1">Visión general del rendimiento de Atlas Digital Tech</p>
                </div>
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex text-sm font-medium">
                    {['semana', 'mes', 'anio'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriodo(p)}
                            className={`px-5 py-2 rounded-xl capitalize transition-all ${periodo === p ? 'bg-atlas-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {p === 'anio' ? 'Año' : p}
                        </button>
                    ))}
                </div>
            </div>

            {/* 1. TARJETAS KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Ventas Totales"
                    value={`$${KPI_DATA.ventas.value.toLocaleString('es-CL')}`}
                    trend={KPI_DATA.ventas.trend}
                    icon={<DollarSign size={28} />}
                    gradientBg="bg-gradient-to-br from-white to-green-50/50"
                    iconColor="text-green-600"
                    trendColor="text-green-600 bg-green-100/50"
                />
                <KpiCard
                    title="Pedidos"
                    value={KPI_DATA.pedidos.value}
                    trend={KPI_DATA.pedidos.trend}
                    icon={<ShoppingBag size={28} />}
                    gradientBg="bg-gradient-to-br from-white to-blue-50/50"
                    iconColor="text-blue-600"
                    trendColor="text-blue-600 bg-blue-100/50"
                />
                <KpiCard
                    title="Ticket Promedio"
                    value={`$${KPI_DATA.ticketPromedio.value.toLocaleString('es-CL')}`}
                    trend={KPI_DATA.ticketPromedio.trend}
                    icon={<TrendingUp size={28} />}
                    gradientBg="bg-gradient-to-br from-white to-purple-50/50"
                    iconColor="text-purple-600"
                    trendColor="text-red-600 bg-red-100/50"
                />
                <KpiCard
                    title="Tasa Conversión"
                    value={KPI_DATA.conversion.value}
                    trend={KPI_DATA.conversion.trend}
                    icon={<Users size={28} />}
                    gradientBg="bg-gradient-to-br from-white to-orange-50/50"
                    iconColor="text-orange-600"
                    trendColor="text-orange-600 bg-orange-100/50"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {/* 2. GRÁFICO DE INGRESOS (NUEVA VERSIÓN SUAVE) */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border-0 relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-100/30 transition-all duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-bold text-gray-900 text-xl">Tendencia de Ingresos</h3>
                            <p className="text-gray-400 text-sm">Últimos 30 días</p>
                        </div>
                        <span className="flex items-center gap-1 text-sm text-green-700 font-bold bg-green-100/80 px-3 py-1.5 rounded-full">
                            <ArrowUpRight size={16} /> 12.5% vs mes anterior
                        </span>
                    </div>
                    {/* Contenedor del Gráfico */}
                    <div className="relative h-80 w-full">
                        <SmoothAreaChart />
                    </div>
                </div>

                {/* 3. INSIGHTS */}
                <div className="bg-gradient-to-br from-atlas-900 via-blue-900 to-atlas-800 text-white p-8 rounded-[2rem] shadow-2xl shadow-blue-900/30 flex flex-col justify-between relative overflow-hidden isolate">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-30 -z-10"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 -z-10"></div>

                    <div>
                        <h3 className="font-bold text-2xl mb-2 flex items-center gap-3">
                            <Sparkles className="text-yellow-300" size={24} /> Atlas AI Insights
                        </h3>
                        <p className="text-blue-200 text-sm mb-8 leading-relaxed">
                            Análisis predictivo y alertas estratégicas para tu negocio.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg transition-transform hover:scale-105">
                                <p className="text-base font-bold text-yellow-300 mb-1 flex items-center gap-2">
                                    <AlertTriangle size={18} className="animate-pulse" /> Stock Crítico
                                </p>
                                <p className="text-sm text-gray-100/90 leading-snug">
                                    Quedan solo <strong>2 unidades</strong> del "Switch PoE 8 Puertos". Reponer urgente.
                                </p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg transition-transform hover:scale-105">
                                <p className="text-base font-bold text-green-300 mb-1 flex items-center gap-2">
                                    <MapPin size={18} /> Oportunidad Local
                                </p>
                                <p className="text-sm text-gray-100/90 leading-snug">
                                    El 42% de ventas son en <strong>Santiago Centro</strong>. Activa una promo de envío local.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button className="mt-8 w-full bg-white/90 hover:bg-white text-atlas-900 font-bold py-3 rounded-xl text-sm transition-all shadow-lg active:scale-95">
                        Ver Análisis Detallado
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* 4. PRODUCTOS MÁS VENDIDOS */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border-0">
                    <h3 className="font-bold text-gray-900 text-xl mb-8 flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><Package size={24} /></div>
                        Top Productos
                    </h3>
                    <div className="space-y-8">
                        {TOP_PRODUCTOS.map((prod, index) => (
                            <div key={prod.id} className="relative group">
                                <div className="flex justify-between items-center mb-2 z-10 relative">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl shadow-sm bg-gray-50 w-10 h-10 flex items-center justify-center rounded-full">{prod.img}</span>
                                        <div>
                                            <span className="font-bold text-gray-800 block">{prod.nombre}</span>
                                            <span className="text-xs text-gray-400">{prod.ventas} ventas totales</span>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-900">${prod.ingresos.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-atlas-500 to-blue-400 h-3 rounded-full group-hover:brightness-110 transition-all duration-1000 relative"
                                        style={{ width: `${(prod.ventas / 30) * 100}%` }}
                                    >
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. ZONAS CALIENTES */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border-0 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 text-xl mb-8 flex items-center gap-3">
                            <div className="bg-red-100 p-2 rounded-xl text-red-600"><MapPin size={24} /></div>
                            Zonas Calientes
                        </h3>
                        <div className="space-y-6">
                            {TOP_ZONAS.map((zona) => (
                                <div key={zona.comuna} className="group">
                                    <div className="flex justify-between mb-2 items-end">
                                        <span className="font-bold text-gray-700 text-base">{zona.comuna}</span>
                                        <span className="text-sm font-medium text-gray-500">{zona.porcentaje}% ({zona.envios} envíos)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden p-0.5">
                                        <div
                                            className={`h-full rounded-full shadow-sm transition-all duration-1000 relative overflow-hidden ${zona.porcentaje > 30 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
                                            style={{ width: `${zona.porcentaje}%` }}
                                        >
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50 flex gap-4 items-start shadow-sm">
                        <div className="bg-white p-2 rounded-full shadow-sm text-blue-600 mt-1">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 mb-1">Conclusión Operativa:</h4>
                            <p className="text-sm text-blue-800/80 leading-relaxed">
                                La alta concentración en la <strong>RM (76%)</strong> sugiere optimizar costos con logística propia local.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- COMPONENTES AUXILIARES --- */

const KpiCard = ({ title, value, trend, icon, gradientBg, iconColor, trendColor }) => (
    <div className={`relative overflow-hidden p-6 rounded-[2rem] shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 group ${gradientBg} border-0`}>
        <div className={`absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500 ${iconColor}`}>
            {React.cloneElement(icon, { size: 80 })}
        </div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-white shadow-sm ${iconColor} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full ${trendColor}`}>
                    {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                    {Math.abs(trend)}%
                </div>
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium mb-2">{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
            </div>
        </div>
    </div>
);

// --- NUEVO GRÁFICO SUAVE (CURVA BÉZIER) ---
const SmoothAreaChart = () => {
    // Datos simulados (puedes cambiarlos y la curva se adapta)
    const data = [20, 45, 30, 60, 55, 80, 70, 95, 85, 100];

    // Función simple para generar curva SVG
    const getPath = (data, width, height) => {
        const maxX = data.length - 1;
        const maxY = Math.max(...data);

        // Convertir datos a coordenadas XY
        const points = data.map((val, i) => {
            const x = (i / maxX) * width;
            const y = height - (val / maxY) * height; // Invertir Y (SVG 0 es arriba)
            return [x, y];
        });

        // Generar path Bézier (comando C)
        // Usamos una lógica simplificada para mockups visuales: 
        // "Curve To" el punto medio entre el actual y el siguiente
        let d = `M ${points[0][0]},${points[0][1]}`;

        for (let i = 0; i < points.length - 1; i++) {
            const [x0, y0] = points[i];
            const [x1, y1] = points[i + 1];
            // Puntos de control para la curva (suavizado al 20% del ancho)
            const cp1x = x0 + (x1 - x0) * 0.4;
            const cp1y = y0;
            const cp2x = x1 - (x1 - x0) * 0.4;
            const cp2y = y1;

            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x1},${y1}`;
        }

        return { path: d, points };
    };

    const width = 800; // Ancho interno del SVG
    const height = 300; // Alto interno
    const { path, points } = getPath(data, width, height * 0.7); // Usamos 70% de altura para dejar margen

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
                {/* Gradiente Azul Suave */}
                <linearGradient id="blueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Líneas de Guía */}
            <line x1="0" y1={height * 0.2} x2={width} y2={height * 0.2} stroke="#f3f4f6" strokeWidth="1" />
            <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#f3f4f6" strokeWidth="1" />
            <line x1="0" y1={height * 0.8} x2={width} y2={height * 0.8} stroke="#f3f4f6" strokeWidth="1" />

            {/* Área Rellena (Cerrar el path hacia abajo) */}
            <path d={`${path} L ${width},${height} L 0,${height} Z`} fill="url(#blueGradient)" />

            {/* Línea Principal Brillante */}
            <path
                d={path}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#glow)"
                className="drop-shadow-lg"
            />

            {/* Puntos Interactivos */}
            {points.map(([x, y], i) => (
                <g key={i} className="group cursor-pointer">
                    {/* Halo invisible para facilitar hover */}
                    <circle cx={x} cy={y} r="15" fill="transparent" />
                    {/* Punto visible */}
                    <circle
                        cx={x} cy={y} r="5"
                        className="fill-white stroke-blue-600 stroke-[3px] transition-all duration-300 group-hover:r-7 group-hover:fill-blue-50"
                    />
                    {/* Tooltip simple */}
                    <rect x={x - 20} y={y - 40} width="40" height="25" rx="5" className="fill-atlas-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <text x={x} y={y - 23} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        {data[i]}
                    </text>
                </g>
            ))}
        </svg>
    );
};

export default AdminDashboard;