import React, { useState } from 'react';
import { Search, Eye, Filter, CheckCircle, Clock, Truck, XCircle, FileText, X } from 'lucide-react';

// DATOS SIMULADOS (MOCK)
const INITIAL_ORDERS = [
    {
        id: "#ORD-001",
        fecha: "28/01/2026",
        cliente: "Juan Pérez",
        email: "juan@gmail.com",
        total: 154980,
        estado: "pagado",
        items: [
            { nombre: "Kit 4 Cámaras Hilook", cantidad: 1, precio: 149990 },
            { nombre: "Conector DC", cantidad: 5, precio: 998 }
        ],
        direccion: "General Gana 1379, Santiago"
    },
    {
        id: "#ORD-002",
        fecha: "27/01/2026",
        cliente: "Empresa SpA",
        email: "contacto@empresa.cl",
        total: 299000,
        estado: "pendiente",
        items: [
            { nombre: "Licencia ERP Pyme", cantidad: 1, precio: 299000 }
        ],
        direccion: "Av. Providencia 1234, Of 601"
    },
    {
        id: "#ORD-003",
        fecha: "26/01/2026",
        cliente: "Carlos Díaz",
        email: "carlos@outlook.com",
        total: 45000,
        estado: "enviado",
        items: [
            { nombre: "Switch PoE 8 Puertos", cantidad: 1, precio: 45000 }
        ],
        direccion: "Calle Falsa 123, Valparaíso"
    },
];

const AdminPedidos = () => {
    const [pedidos, setPedidos] = useState(INITIAL_ORDERS);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [modalOpen, setModalOpen] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

    // Filtrado
    const pedidosFiltrados = pedidos.filter(p =>
        filtroEstado === 'todos' ? true : p.estado === filtroEstado
    );

    // Cambiar Estado
    const cambiarEstado = (nuevoEstado) => {
        setPedidos(pedidos.map(p =>
            p.id === pedidoSeleccionado.id ? { ...p, estado: nuevoEstado } : p
        ));
        setModalOpen(false);
    };

    // Renderizar Badge de Estado
    const StatusBadge = ({ estado }) => {
        const estilos = {
            pendiente: "bg-yellow-100 text-yellow-700 border-yellow-200",
            pagado: "bg-blue-100 text-blue-700 border-blue-200",
            enviado: "bg-purple-100 text-purple-700 border-purple-200",
            entregado: "bg-green-100 text-green-700 border-green-200",
            cancelado: "bg-red-100 text-red-700 border-red-200",
        };

        const iconos = {
            pendiente: <Clock size={14} />,
            pagado: <CheckCircle size={14} />,
            enviado: <Truck size={14} />,
            entregado: <CheckCircle size={14} />,
            cancelado: <XCircle size={14} />,
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit capitalize ${estilos[estado] || estilos.pendiente}`}>
                {iconos[estado]} {estado}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h1>
                    <p className="text-gray-500">Monitorea y actualiza el estado de las ventas</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-gray-50">
                        <FileText size={18} /> Exportar Reporte
                    </button>
                </div>
            </div>

            {/* Filtros Rápidos */}
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex overflow-x-auto">
                {['todos', 'pendiente', 'pagado', 'enviado', 'entregado'].map(estado => (
                    <button
                        key={estado}
                        onClick={() => setFiltroEstado(estado)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${filtroEstado === estado ? 'bg-atlas-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        {estado}
                    </button>
                ))}
            </div>

            {/* Tabla de Pedidos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4">ID Pedido</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Total</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pedidosFiltrados.map((pedido) => (
                                <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-mono font-bold text-atlas-600">{pedido.id}</td>
                                    <td className="p-4 text-sm text-gray-600">{pedido.fecha}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{pedido.cliente}</span>
                                            <span className="text-xs text-gray-400">{pedido.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge estado={pedido.estado} />
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">${pedido.total.toLocaleString('es-CL')}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => { setPedidoSeleccionado(pedido); setModalOpen(true); }}
                                            className="text-gray-400 hover:text-atlas-500 p-2 hover:bg-atlas-50 rounded-full transition-all"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {pedidosFiltrados.length === 0 && (
                        <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                            <Filter size={48} className="opacity-20 mb-4" />
                            <p>No hay pedidos con este estado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DE DETALLE DEL PEDIDO */}
            {modalOpen && pedidoSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">

                        {/* Header Modal */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Detalle Pedido {pedidoSeleccionado.id}</h2>
                                <p className="text-sm text-gray-500">Realizado el {pedidoSeleccionado.fecha}</p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="bg-white p-2 rounded-full shadow-sm hover:bg-gray-200 text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body Modal (Scrollable) */}
                        <div className="p-6 overflow-y-auto">

                            {/* Info Cliente */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <h3 className="font-bold text-atlas-900 mb-2 flex items-center gap-2"><Truck size={16} /> Datos de Envío</h3>
                                    <p className="text-sm text-gray-600"><span className="font-semibold">Dirección:</span> {pedidoSeleccionado.direccion}</p>
                                    <p className="text-sm text-gray-600"><span className="font-semibold">Cliente:</span> {pedidoSeleccionado.cliente}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-2">Estado Actual</h3>
                                    <StatusBadge estado={pedidoSeleccionado.estado} />
                                    <div className="mt-4">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Cambiar Estado:</label>
                                        <select
                                            className="w-full mt-1 p-2 border rounded-lg text-sm"
                                            value={pedidoSeleccionado.estado}
                                            onChange={(e) => cambiarEstado(e.target.value)}
                                        >
                                            <option value="pendiente">Pendiente de Pago</option>
                                            <option value="pagado">Pagado</option>
                                            <option value="enviado">Enviado</option>
                                            <option value="entregado">Entregado</option>
                                            <option value="cancelado">Cancelado</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Lista de Items */}
                            <h3 className="font-bold text-gray-900 mb-3 border-b pb-2">Productos Comprados</h3>
                            <div className="space-y-3">
                                {pedidoSeleccionado.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <div className="flex gap-3 items-center">
                                            <div className="bg-gray-100 w-8 h-8 rounded flex items-center justify-center font-bold text-gray-500 text-xs">
                                                x{item.cantidad}
                                            </div>
                                            <span className="text-gray-700 font-medium">{item.nombre}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">${(item.precio * item.cantidad).toLocaleString('es-CL')}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Totales */}
                            <div className="mt-6 border-t pt-4 flex justify-end">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Envío: <span className="font-medium text-gray-900">$3.990</span></p>
                                    <p className="text-2xl font-bold text-atlas-900 mt-1">Total: ${pedidoSeleccionado.total.toLocaleString('es-CL')}</p>
                                </div>
                            </div>

                        </div>

                        {/* Footer Modal Actions */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                className="px-4 py-2 bg-atlas-900 text-white font-bold rounded-lg hover:bg-atlas-800 shadow-lg flex items-center gap-2"
                                onClick={() => window.print()} // Simulación de imprimir factura
                            >
                                <FileText size={18} /> Imprimir Orden
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminPedidos;