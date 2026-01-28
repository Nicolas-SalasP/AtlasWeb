import React, { useState } from 'react';
import { Search, User, Shield, Lock, Unlock, Eye, MapPin, Calendar, DollarSign, Ban } from 'lucide-react';
import AlertModal from '../../components/AlertModal';

// DATOS SIMULADOS (MOCK)
const INITIAL_USERS = [
    {
        id: 1,
        nombre: "Juan Pérez",
        email: "juan@gmail.com",
        rol: "cliente",
        estado: "activo",
        ip: "192.168.1.50",
        ubicacion: "Santiago, RM",
        totalGastado: 1540000,
        ordenes: 12,
        ultimaConexion: "Hace 2 horas",
        historialCompras: [
            { id: "#ORD-099", fecha: "10/01/2026", total: 450000, items: 3 },
            { id: "#ORD-045", fecha: "05/12/2025", total: 120000, items: 1 }
        ]
    },
    {
        id: 2,
        nombre: "Administrador Principal",
        email: "admin@atlas.cl",
        rol: "admin",
        estado: "activo",
        ip: "200.14.55.12",
        ubicacion: "Oficina Central",
        totalGastado: 0,
        ordenes: 0,
        ultimaConexion: "En línea",
        historialCompras: []
    },
    {
        id: 3,
        nombre: "Carlos Estafador",
        email: "hacker@evil.com",
        rol: "cliente",
        estado: "bloqueado",
        ip: "185.20.1.1",
        ubicacion: "Desconocido",
        totalGastado: 0,
        ordenes: 0,
        ultimaConexion: "Hace 5 días",
        historialCompras: []
    },
    {
        id: 4,
        nombre: "Empresa SpA",
        email: "contacto@empresa.cl",
        rol: "cliente",
        estado: "activo",
        ip: "190.100.22.4",
        ubicacion: "Concepción, Biobío",
        totalGastado: 3500000,
        ordenes: 5,
        ultimaConexion: "Ayer",
        historialCompras: [
            { id: "#ORD-102", fecha: "20/01/2026", total: 2000000, items: 10 },
            { id: "#ORD-080", fecha: "15/01/2026", total: 1500000, items: 5 }
        ]
    },
];

const AdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState(INITIAL_USERS);
    const [busqueda, setBusqueda] = useState("");
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null); // Para el modal
    const [modalAlert, setModalAlert] = useState({ open: false, title: '', msg: '', type: 'info' });

    // Filtrado
    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.ip.includes(busqueda)
    );

    // Función para Bloquear/Desbloquear
    const toggleBloqueo = (id) => {
        const usuario = usuarios.find(u => u.id === id);
        if (!usuario) return;

        if (usuario.rol === 'admin') {
            setModalAlert({ open: true, title: 'Acción Denegada', msg: 'No puedes bloquear a un administrador.', type: 'error' });
            return;
        }

        const nuevoEstado = usuario.estado === 'activo' ? 'bloqueado' : 'activo';

        setUsuarios(usuarios.map(u => u.id === id ? { ...u, estado: nuevoEstado } : u));

        setModalAlert({
            open: true,
            title: nuevoEstado === 'bloqueado' ? 'Usuario Bloqueado' : 'Usuario Reactivado',
            msg: `El usuario ha sido ${nuevoEstado} exitosamente. Su IP ${usuario.ip} ha sido actualizada en el firewall.`,
            type: nuevoEstado === 'bloqueado' ? 'error' : 'success'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Alerta Modal (Reutilizamos tu componente) */}
            <AlertModal
                isOpen={modalAlert.open}
                onClose={() => setModalAlert({ ...modalAlert, open: false })}
                type={modalAlert.type}
                title={modalAlert.title}
                message={modalAlert.msg}
            />

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios y Clientes</h1>
                <p className="text-gray-500">Administra accesos, revisa historiales de compra y seguridad.</p>
            </div>

            {/* Buscador */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o dirección IP..."
                    className="w-full outline-none text-gray-700"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {/* Tabla de Usuarios */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Rol / Estado</th>
                                <th className="p-4">Seguridad (IP)</th>
                                <th className="p-4 text-center">Compras</th>
                                <th className="p-4 text-center">Total Gastado (LTV)</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usuariosFiltrados.map((user) => (
                                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.estado === 'bloqueado' ? 'bg-red-50/30' : ''}`}>

                                    {/* Usuario */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.rol === 'admin' ? 'bg-atlas-900' : 'bg-blue-500'}`}>
                                                {user.nombre.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{user.nombre}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Rol y Estado */}
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {user.rol}
                                            </span>
                                            {user.estado === 'activo' ? (
                                                <span className="flex items-center gap-1 text-xs text-green-600 font-bold">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Activo
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-red-600 font-bold">
                                                    <Ban size={12} /> Bloqueado
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Seguridad */}
                                    <td className="p-4">
                                        <div className="text-xs">
                                            <p className="text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded inline-block mb-1">{user.ip}</p>
                                            <p className="text-gray-400 flex items-center gap-1"><MapPin size={10} /> {user.ubicacion}</p>
                                            <p className="text-gray-400 mt-1">Ult: {user.ultimaConexion}</p>
                                        </div>
                                    </td>

                                    {/* Compras */}
                                    <td className="p-4 text-center">
                                        <span className="font-bold text-gray-700">{user.ordenes}</span>
                                    </td>

                                    {/* Total Gastado (LTV) */}
                                    <td className="p-4 text-center">
                                        <span className={`font-bold ${user.totalGastado > 1000000 ? 'text-green-600' : 'text-gray-600'}`}>
                                            ${user.totalGastado.toLocaleString('es-CL')}
                                        </span>
                                    </td>

                                    {/* Acciones */}
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setUsuarioSeleccionado(user)}
                                                className="p-2 text-gray-400 hover:text-atlas-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Ver Detalles"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            <button
                                                onClick={() => toggleBloqueo(user.id)}
                                                className={`p-2 rounded-lg transition-colors ${user.estado === 'activo'
                                                        ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                                        : 'text-red-500 bg-red-50 hover:bg-green-100 hover:text-green-600'
                                                    }`}
                                                title={user.estado === 'activo' ? "Bloquear Usuario" : "Desbloquear Usuario"}
                                            >
                                                {user.estado === 'activo' ? <Lock size={18} /> : <Unlock size={18} />}
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DETALLE USUARIO */}
            {usuarioSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">

                        {/* Modal Header con gradiente */}
                        <div className="bg-atlas-900 text-white p-6 relative overflow-hidden">
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white text-atlas-900 flex items-center justify-center text-2xl font-bold shadow-lg">
                                    {usuarioSeleccionado.nombre.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{usuarioSeleccionado.nombre}</h2>
                                    <p className="text-atlas-300 text-sm">{usuarioSeleccionado.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs backdrop-blur-sm border border-white/10">
                                            ID: #{usuarioSeleccionado.id}
                                        </span>
                                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs backdrop-blur-sm border border-white/10">
                                            {usuarioSeleccionado.rol.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Botón cerrar absoluto */}
                            <button
                                onClick={() => setUsuarioSeleccionado(null)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                <Ban size={24} className="rotate-45" /> {/* Usamos Ban rotado como X */}
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Total Gastado</p>
                                    <p className="text-lg font-bold text-atlas-900 flex items-center gap-1">
                                        <DollarSign size={16} className="text-green-500" />
                                        {usuarioSeleccionado.totalGastado.toLocaleString('es-CL')}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Dirección IP</p>
                                    <p className="text-lg font-bold text-gray-700 flex items-center gap-1 font-mono">
                                        <Shield size={16} className="text-blue-500" />
                                        {usuarioSeleccionado.ip}
                                    </p>
                                </div>
                            </div>

                            {/* Historial de Compras */}
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Calendar size={18} /> Últimas Actividades
                            </h3>

                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {usuarioSeleccionado.historialCompras.length > 0 ? (
                                    usuarioSeleccionado.historialCompras.map((compra, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{compra.id}</p>
                                                <p className="text-xs text-gray-500">{compra.fecha} • {compra.items} productos</p>
                                            </div>
                                            <span className="font-bold text-sm text-green-600">
                                                ${compra.total.toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                        <p>No hay historial de compras reciente.</p>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <p className="text-xs text-gray-400">
                                Última conexión: {usuarioSeleccionado.ultimaConexion}
                            </p>
                            <button
                                onClick={() => { toggleBloqueo(usuarioSeleccionado.id); setUsuarioSeleccionado(null); }}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${usuarioSeleccionado.estado === 'activo'
                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                        : 'border-green-200 text-green-600 hover:bg-green-50'
                                    }`}
                            >
                                {usuarioSeleccionado.estado === 'activo' ? 'Bloquear Acceso' : 'Desbloquear Acceso'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminUsuarios;