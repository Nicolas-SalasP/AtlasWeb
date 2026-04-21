import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
    Search, ShoppingBag, User, ChevronRight,
    Package, X, Loader2, Edit2, Save,
    MapPin, Phone, Mail, FileText, CheckCircle, AlertCircle, Truck, ExternalLink,
    Inbox, Link as LinkIcon, FileCode, RefreshCw
} from 'lucide-react';

const ESTADOS_ORDEN = [
    { value: 'pending', label: 'Pendiente (Pago)' },
    { value: 'paid', label: 'Pagado' },
    { value: 'preparing', label: 'En Preparación' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Anulado' },
    { value: 'refunded', label: 'Reembolsado' }
];

const PROVEEDORES_ENVIO = [
    { value: 'propio', label: 'Reparto Propio / Interno' },
    { value: 'bluexpress', label: 'BlueExpress' },
    { value: 'starken', label: 'Starken' },
    { value: 'chilexpress', label: 'Chilexpress' },
    { value: 'correos', label: 'Correos de Chile' }
];

const FLUJO_ESTADOS = ['pending', 'paid', 'preparing', 'shipped', 'delivered'];

const getStatusColor = (status) => {
    const colors = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        preparing: 'bg-blue-100 text-blue-700 border-blue-200',
        shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        delivered: 'bg-gray-100 text-gray-700 border-gray-300',
        cancelled: 'bg-red-100 text-red-700 border-red-200',
        refunded: 'bg-rose-100 text-rose-700 border-rose-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
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

const AdminPedidos = () => {
    // --- ESTADOS PRINCIPALES ---
    const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' | 'comprobantes'
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [busqueda, setBusqueda] = useState("");

    // --- ESTADOS DE PEDIDOS ---
    const [pedidos, setPedidos] = useState([]);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [editandoNotas, setEditandoNotas] = useState(false);
    const [notasTemp, setNotasTemp] = useState("");
    const [editandoTracking, setEditandoTracking] = useState(false);
    const [trackingData, setTrackingData] = useState({ provider: '', number: '' });

    // --- ESTADOS DE COMPROBANTES ---
    const [comprobantes, setComprobantes] = useState([]);
    const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null);
    const [ordenAsociarId, setOrdenAsociarId] = useState("");

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [resPedidos, resComprobantes] = await Promise.all([
                api.get('/admin/orders'),
                api.get('/admin/bank-receipts/unmatched').catch(() => ({ data: [] }))
            ]);
            setPedidos(resPedidos.data);
            setComprobantes(resComprobantes.data);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE PEDIDOS ---
    const cambiarEstado = async (nuevoEstado) => {
        setProcesando(true);
        try {
            const { data } = await api.put(`/admin/orders/${pedidoSeleccionado.id}`, { status: nuevoEstado });
            setPedidoSeleccionado(data.order);
            setPedidos(pedidos.map(p => p.id === data.order.id ? data.order : p));
        } catch (error) {
            console.error("Error actualizando estado:", error);
            alert("No se pudo actualizar el estado.");
        } finally {
            setProcesando(false);
        }
    };

    const guardarNotas = async () => {
        setProcesando(true);
        try {
            const { data } = await api.put(`/admin/orders/${pedidoSeleccionado.id}`, { notes: notasTemp });
            setPedidoSeleccionado(data.order);
            setPedidos(pedidos.map(p => p.id === data.order.id ? data.order : p));
            setEditandoNotas(false);
        } catch (error) {
            console.error("Error guardando notas:", error);
            alert("No se pudieron guardar las notas.");
        } finally {
            setProcesando(false);
        }
    };

    const guardarTracking = async () => {
        setProcesando(true);
        try {
            const { data } = await api.put(`/admin/orders/${pedidoSeleccionado.id}`, {
                shipping_provider: trackingData.provider,
                tracking_number: trackingData.number
            });
            setPedidoSeleccionado(data.order);
            setPedidos(pedidos.map(p => p.id === data.order.id ? data.order : p));
            setEditandoTracking(false);
        } catch (error) {
            console.error("Error guardando tracking:", error);
            alert("No se pudo guardar la información de envío.");
        } finally {
            setProcesando(false);
        }
    };

    const abrirDetallePedido = (pedido) => {
        setPedidoSeleccionado(pedido);
        setNotasTemp(pedido.notes || "");
        setTrackingData({
            provider: pedido.shipping_provider || '',
            number: pedido.tracking_number || ''
        });
        setEditandoNotas(false);
        setEditandoTracking(false);
    };

    // --- LÓGICA DE COMPROBANTES ---
    const abrirDetalleComprobante = (comp) => {
        setComprobanteSeleccionado(comp);
        setOrdenAsociarId("");
    };

    const asociarComprobanteManual = async () => {
        if (!ordenAsociarId) return alert("Selecciona una orden primero");
        setProcesando(true);
        try {
            await api.post(`/admin/bank-receipts/${comprobanteSeleccionado.id}/match`, {
                order_id: ordenAsociarId
            });
            alert("¡Comprobante asociado exitosamente!");
            setComprobanteSeleccionado(null);
            cargarDatos();
        } catch (error) {
            console.error("Error asociando comprobante:", error);
            alert(error.response?.data?.message || "Ocurrió un error al asociar.");
        } finally {
            setProcesando(false);
        }
    };

    // --- FILTROS Y AYUDANTES ---
    const filtradosPedidos = pedidos.filter(p => {
        const query = busqueda.toLowerCase();
        const orderNum = p.order_number?.toLowerCase() || "";
        const userName = p.user?.name?.toLowerCase() || p.customer_data?.nombre?.toLowerCase() || "";
        return orderNum.includes(query) || userName.includes(query);
    });

    const filtradosComprobantes = comprobantes.filter(c => {
        const query = busqueda.toLowerCase();
        return (c.transaction_number || "").includes(query) ||
            (c.sender_name || "").toLowerCase().includes(query) ||
            (c.glosa || "").toLowerCase().includes(query);
    });

    const ordenesPendientesTransferencia = pedidos.filter(p => p.status === 'pending' && p.payment_method === 'transfer');

    const getNextStateInfo = (currentStatus) => {
        const currentIndex = FLUJO_ESTADOS.indexOf(currentStatus);
        if (currentIndex >= 0 && currentIndex < FLUJO_ESTADOS.length - 1) {
            const nextValue = FLUJO_ESTADOS[currentIndex + 1];
            const nextLabel = ESTADOS_ORDEN.find(e => e.value === nextValue)?.label;
            return { value: nextValue, label: nextLabel };
        }
        return null;
    };

    if (loading) return <div className="h-screen flex items-center justify-center gap-2 text-tenri-900"><Loader2 className="animate-spin" /> Cargando Módulo...</div>;

    const nextState = pedidoSeleccionado ? getNextStateInfo(pedidoSeleccionado.status) : null;

    return (
        <div className="h-[calc(100vh-80px)] p-4 md:p-10 bg-gray-50/50 flex flex-col overflow-hidden relative">

            {/* ENCABEZADO Y TABS */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Centro de Operaciones</h1>
                    <p className="text-gray-500">Gestión de despachos y conciliación bancaria</p>
                </div>

                <div className="flex bg-gray-200/50 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('pedidos')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'pedidos' ? 'bg-white text-tenri-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Package size={16} /> Pedidos
                    </button>
                    <button
                        onClick={() => setActiveTab('comprobantes')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'comprobantes' ? 'bg-white text-tenri-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="relative">
                            <Inbox size={16} />
                            {comprobantes.length > 0 && <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        </div>
                        Standby ({comprobantes.length})
                    </button>
                </div>
            </div>

            {/* CAJA PRINCIPAL DE LA TABLA */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 flex flex-col flex-1 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={activeTab === 'pedidos' ? "Buscar por Orden o Cliente..." : "Buscar por Transacción, Nombre o Glosa..."}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-tenri-200 outline-none text-sm md:text-base"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>
                    <button onClick={cargarDatos} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors ml-4" title="Actualizar datos">
                        <RefreshCw size={20} />
                    </button>
                </div>

                <div className="overflow-auto flex-1 custom-scrollbar">
                    {/* --- TABLA DE PEDIDOS --- */}
                    {activeTab === 'pedidos' && (
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50 text-left sticky top-0 z-10 border-b border-gray-100">
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
                                {filtradosPedidos.length === 0 && (
                                    <tr><td colSpan="6" className="text-center py-10 text-gray-400">No se encontraron pedidos.</td></tr>
                                )}
                                {filtradosPedidos.map((p) => (
                                    <tr key={p.id} onClick={() => abrirDetallePedido(p)} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                                        <td className="px-8 py-4 font-mono font-bold text-tenri-900">{p.order_number}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {p.user ? p.user.name.charAt(0) : 'I'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{p.user ? p.user.name : p.customer_data?.nombre || 'Invitado'}</p>
                                                    <p className="text-[10px] md:text-xs text-gray-500 truncate max-w-[150px] md:max-w-none">{p.customer_data?.email || p.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(p.status)}`}>
                                                {ESTADOS_ORDEN.find(e => e.value === p.status)?.label || p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-gray-900">${parseInt(p.total).toLocaleString('es-CL')}</td>
                                        <td className="px-6 py-4 text-gray-400 group-hover:text-tenri-900"><ChevronRight size={20} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* --- TABLA DE COMPROBANTES (STANDBY) --- */}
                    {activeTab === 'comprobantes' && (
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50 text-left sticky top-0 z-10 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">N° Transacción</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Banco Origen</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Remitente / Glosa</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Fecha Correo</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Monto</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtradosComprobantes.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20 text-gray-400 flex flex-col items-center">
                                            <CheckCircle size={48} className="text-emerald-400 mb-3 opacity-50" />
                                            <p className="text-lg font-bold">Todo al día</p>
                                            <p className="text-sm">No hay comprobantes huérfanos en la bandeja.</p>
                                        </td>
                                    </tr>
                                )}
                                {filtradosComprobantes.map((c) => (
                                    <tr key={c.id} onClick={() => abrirDetalleComprobante(c)} className="hover:bg-amber-50/50 cursor-pointer transition-colors group">
                                        <td className="px-8 py-4 font-mono font-bold text-amber-700">{c.transaction_number || 'S/N'}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{c.bank_domain}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900">{c.sender_name || 'Desconocido'}</p>
                                            <p className="text-xs text-gray-500 italic max-w-[200px] truncate">"{c.glosa || 'Sin glosa'}"</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.transfer_date).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-black text-gray-900">${parseInt(c.amount).toLocaleString('es-CL')}</td>
                                        <td className="px-6 py-4 text-amber-400 group-hover:text-amber-600"><ChevronRight size={20} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ========================================================= */}
            {/* DRAWER DETALLE DE PEDIDO (EL ORIGINAL MEJORADO) */}
            {/* ========================================================= */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-3/4 lg:w-[800px] xl:w-[900px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${pedidoSeleccionado ? 'translate-x-0' : 'translate-x-full'}`}>
                {pedidoSeleccionado && (
                    <>
                        <div className="h-20 md:h-24 bg-tenri-900 flex items-center justify-between px-6 md:px-10 text-white flex-shrink-0">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                                    {pedidoSeleccionado.order_number}
                                    {procesando && <Loader2 size={18} className="animate-spin text-tenri-300" />}
                                </h2>
                                <p className="text-tenri-300 text-xs md:text-sm mt-1">{new Date(pedidoSeleccionado.created_at).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setPedidoSeleccionado(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-gray-50/50">

                            {/* ACCIÓN PRINCIPAL: FLUJO DE ESTADO */}
                            <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Fase Actual</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full shadow-inner ${getStatusColor(pedidoSeleccionado.status).split(' ')[0]}`}></span>
                                        <span className="font-bold text-gray-900 text-lg">
                                            {ESTADOS_ORDEN.find(e => e.value === pedidoSeleccionado.status)?.label || pedidoSeleccionado.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    {nextState ? (
                                        <button
                                            onClick={() => cambiarEstado(nextState.value)}
                                            disabled={procesando}
                                            className="bg-tenri-900 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-tenri-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-70"
                                        >
                                            {procesando ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                            Avanzar a {nextState.label}
                                        </button>
                                    ) : (
                                        <div className="bg-gray-100 text-gray-500 px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-gray-200">
                                            <AlertCircle size={18} /> Flujo Finalizado
                                        </div>
                                    )}

                                    <div className="relative">
                                        <select
                                            value={pedidoSeleccionado.status}
                                            onChange={(e) => cambiarEstado(e.target.value)}
                                            disabled={procesando}
                                            className="w-full sm:w-auto appearance-none text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-3 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <option value="" disabled>Opciones...</option>
                                            {ESTADOS_ORDEN.map(est => (
                                                <option key={est.value} value={est.value}>{est.label}</option>
                                            ))}
                                        </select>
                                        <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* DATOS DEL CLIENTE Y ENVÍO */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><User size={18} className="text-tenri-500" /> Cliente</h3>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded-md">
                                            {pedidoSeleccionado.payment_method === 'webpay' ? '💳 Webpay' : '🏦 Transferencia'}
                                        </span>
                                    </div>
                                    <div className="space-y-3 text-sm text-gray-600 flex-1">
                                        <p className="font-bold text-gray-800 text-base">{pedidoSeleccionado.customer_data?.nombre || pedidoSeleccionado.user?.name}</p>
                                        <p className="flex items-center gap-3"><Mail size={16} className="text-gray-400" /> {pedidoSeleccionado.customer_data?.email || pedidoSeleccionado.user?.email}</p>
                                        <p className="flex items-center gap-3"><Phone size={16} className="text-gray-400" /> {pedidoSeleccionado.customer_data?.phone || 'Sin teléfono'}</p>
                                        <p className="flex items-center gap-3"><FileText size={16} className="text-gray-400" /> RUT: {pedidoSeleccionado.customer_data?.rut || 'No ingresado'}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-tenri-500" /> Dirección de Despacho</h3>
                                    <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex items-center mb-4">
                                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                            {pedidoSeleccionado.shipping_address || 'Retiro en tienda o sin dirección registrada en la orden.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* --- SECCIÓN DE TRACKING / DESPACHO --- */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Truck size={18} className="text-tenri-500" /> Tracking de Envío</h3>
                                    {!editandoTracking ? (
                                        <button onClick={() => setEditandoTracking(true)} className="text-xs font-bold text-tenri-600 flex items-center gap-1 hover:text-tenri-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                            <Edit2 size={14} /> Editar Tracking
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button onClick={() => {
                                                setEditandoTracking(false);
                                                setTrackingData({ provider: pedidoSeleccionado.shipping_provider || '', number: pedidoSeleccionado.tracking_number || '' });
                                            }} className="flex-1 sm:flex-none text-xs font-bold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">Cancelar</button>
                                            <button onClick={guardarTracking} disabled={procesando} className="flex-1 sm:flex-none text-xs font-bold text-white bg-tenri-900 flex items-center justify-center gap-1 hover:bg-tenri-800 px-4 py-1.5 rounded-lg transition-colors">
                                                {procesando ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Guardar</>}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {!editandoTracking ? (
                                    <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Empresa / Courier</p>
                                            <p className="font-medium text-gray-800">
                                                {PROVEEDORES_ENVIO.find(p => p.value === pedidoSeleccionado.shipping_provider)?.label || 'No asignado'}
                                            </p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Código de Seguimiento</p>
                                            {pedidoSeleccionado.tracking_number ? (
                                                <div className="flex items-center gap-3">
                                                    <p className="font-mono font-bold text-tenri-900">{pedidoSeleccionado.tracking_number}</p>
                                                    {pedidoSeleccionado.shipping_provider !== 'propio' && (
                                                        <a
                                                            href={getTrackingLink(pedidoSeleccionado.shipping_provider, pedidoSeleccionado.tracking_number)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] bg-tenri-100 text-tenri-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-tenri-200 transition-colors"
                                                        >
                                                            Rastrear <ExternalLink size={10} />
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 italic text-sm">Sin código de envío</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Empresa de Envío</label>
                                            <select
                                                value={trackingData.provider}
                                                onChange={(e) => setTrackingData({ ...trackingData, provider: e.target.value })}
                                                className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-tenri-300"
                                            >
                                                <option value="">Selecciona Courier...</option>
                                                {PROVEEDORES_ENVIO.map(p => (
                                                    <option key={p.value} value={p.value}>{p.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">N° de Seguimiento</label>
                                            <input
                                                type="text"
                                                value={trackingData.number}
                                                onChange={(e) => setTrackingData({ ...trackingData, number: e.target.value })}
                                                placeholder="Ej: 9923847291"
                                                className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-tenri-300 font-mono"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SECCIÓN DE NOTAS */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><FileText size={18} className="text-tenri-500" /> Notas del Pedido</h3>
                                    {!editandoNotas ? (
                                        <button onClick={() => setEditandoNotas(true)} className="text-xs font-bold text-tenri-600 flex items-center gap-1 hover:text-tenri-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                            <Edit2 size={14} /> Editar Notas
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button onClick={() => { setEditandoNotas(false); setNotasTemp(pedidoSeleccionado.notes); }} className="flex-1 sm:flex-none text-xs font-bold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">Cancelar</button>
                                            <button onClick={guardarNotas} disabled={procesando} className="flex-1 sm:flex-none text-xs font-bold text-white bg-tenri-900 flex items-center justify-center gap-1 hover:bg-tenri-800 px-4 py-1.5 rounded-lg transition-colors">
                                                {procesando ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Guardar</>}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {!editandoNotas ? (
                                    <div className="text-sm text-gray-700 bg-yellow-50 p-4 rounded-xl border border-yellow-200/60 whitespace-pre-wrap min-h-[4rem]">
                                        {pedidoSeleccionado.notes ? (
                                            <span className="italic">{pedidoSeleccionado.notes}</span>
                                        ) : (
                                            <span className="text-gray-400 flex items-center gap-2"><AlertCircle size={14} /> Sin anotaciones.</span>
                                        )}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full p-4 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-tenri-300 resize-none h-28 custom-scrollbar"
                                        value={notasTemp}
                                        onChange={(e) => setNotasTemp(e.target.value)}
                                        placeholder="Escribe anotaciones internas, incidencias o instrucciones del cliente..."
                                    />
                                )}
                            </div>

                            {/* LISTA DE PRODUCTOS Y TOTALES */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Package size={18} className="text-tenri-500" /> Detalle de Productos</h3>
                                <div className="space-y-3 mb-6">
                                    {pedidoSeleccionado.items?.map((item) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm md:text-base">{item.product_name}</p>
                                                <p className="text-xs text-gray-500 font-mono mt-1">SKU: {item.sku_snapshot}</p>
                                            </div>
                                            <div className="text-left sm:text-right border-t border-gray-100 sm:border-0 pt-2 sm:pt-0">
                                                <p className="text-xs text-gray-500 mb-1">{item.quantity} x ${parseInt(item.unit_price).toLocaleString('es-CL')}</p>
                                                <p className="font-black text-tenri-900 text-sm md:text-base">${parseInt(item.total_line).toLocaleString('es-CL')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-3 md:w-1/2 ml-auto">
                                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                                        <span>Subtotal</span>
                                        <span>${parseInt(pedidoSeleccionado.subtotal).toLocaleString('es-CL')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 font-medium border-b border-gray-200 pb-3 mb-2">
                                        <span>Despacho</span>
                                        <span>${parseInt(pedidoSeleccionado.shipping_cost).toLocaleString('es-CL')}</span>
                                    </div>
                                    <div className="flex justify-between text-xl md:text-2xl font-black text-gray-900 pt-1">
                                        <span>Total</span>
                                        <span>${parseInt(pedidoSeleccionado.total).toLocaleString('es-CL')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-10"></div>
                        </div>
                    </>
                )}
            </div>
            {pedidoSeleccionado && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setPedidoSeleccionado(null)} />}

            {/* ========================================================= */}
            {/* DRAWER DETALLE DE COMPROBANTE STANDBY (NUEVO) */}
            {/* ========================================================= */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] lg:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${comprobanteSeleccionado ? 'translate-x-0' : 'translate-x-full'}`}>
                {comprobanteSeleccionado && (
                    <>
                        <div className="h-20 bg-amber-500 flex items-center justify-between px-6 text-white flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    Revisión Manual
                                </h2>
                                <p className="text-amber-100 text-sm mt-1">Comprobante #{comprobanteSeleccionado.transaction_number || 'S/N'}</p>
                            </div>
                            <button onClick={() => setComprobanteSeleccionado(null)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar">

                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 flex items-start gap-3">
                                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                                <p className="text-sm text-amber-800">
                                    Este pago ingresó a la cuenta bancaria, pero el bot no pudo asociarlo a una orden automáticamente. Revisa los datos y asócialo manualmente.
                                </p>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6 space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                    <span className="text-gray-500 text-sm">Monto Transferido:</span>
                                    <span className="text-2xl font-black text-gray-900">${parseInt(comprobanteSeleccionado.amount).toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Banco Origen:</span>
                                    <span className="font-bold text-gray-800">{comprobanteSeleccionado.bank_domain}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Remitente:</span>
                                    <span className="font-bold text-gray-800">{comprobanteSeleccionado.sender_name || 'No detectado'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Fecha del Correo:</span>
                                    <span className="font-bold text-gray-800">{new Date(comprobanteSeleccionado.transfer_date).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-8">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FileCode size={16} className="text-gray-400" /> Lectura del Bot (Glosa)</h3>
                                <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                                    {comprobanteSeleccionado.glosa ? (
                                        <p>GLOSA DETECTADA: "{comprobanteSeleccionado.glosa}"</p>
                                    ) : (
                                        <p className="text-gray-500">Sin glosa o asunto detectado...</p>
                                    )}
                                    <hr className="border-gray-700 my-3" />
                                    <p className="text-gray-400">--- CUERPO DEL CORREO ---</p>
                                    {comprobanteSeleccionado.raw_content}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-tenri-200 shadow-md">
                                <h3 className="font-bold text-tenri-900 mb-2 flex items-center gap-2"><LinkIcon size={18} /> Asociar a una Orden</h3>
                                <p className="text-xs text-gray-500 mb-4">Selecciona la orden a la cual pertenece este pago. Al asociarla, pasará automáticamente a estado "Pagado".</p>

                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-tenri-400"
                                    value={ordenAsociarId}
                                    onChange={(e) => setOrdenAsociarId(e.target.value)}
                                    disabled={procesando}
                                >
                                    <option value="">-- Selecciona una Orden Pendiente --</option>
                                    {ordenesPendientesTransferencia.map(ord => (
                                        <option key={ord.id} value={ord.id}>
                                            {ord.order_number} - {ord.customer_data?.nombre || ord.user?.name} - Total: ${parseInt(ord.total).toLocaleString('es-CL')}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={asociarComprobanteManual}
                                    disabled={!ordenAsociarId || procesando}
                                    className="w-full bg-tenri-900 text-white font-bold py-3 rounded-xl hover:bg-tenri-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {procesando ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Confirmar Asociación</>}
                                </button>
                            </div>
                            <div className="h-10"></div>
                        </div>
                    </>
                )}
            </div>
            {comprobanteSeleccionado && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setComprobanteSeleccionado(null)} />}

        </div>
    );
};

export default AdminPedidos;