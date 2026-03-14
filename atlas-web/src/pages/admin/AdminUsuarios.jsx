import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
    Search, User, Mail, Building, Calendar,
    Shield, Ticket, Loader2, Users,
    Eye, Edit, Trash2, X, ShoppingBag, Phone, CheckCircle, XCircle,
    Filter, ArrowDownUp
} from 'lucide-react';

const PERMISOS_DISPONIBLES = [
    { id: 'all', label: '👑 Acceso Total (Super Admin)' },
    { id: 'manage_products', label: '📦 Gestionar Productos' },
    { id: 'manage_services', label: '⚡ Gestionar Servicios' },
    { id: 'view_orders', label: '🛒 Ver Pedidos' },
    { id: 'view_users', label: '👥 Ver Usuarios y Clientes' },
    { id: 'view_tickets', label: '🎧 Responder Soporte' },
    { id: 'manage_settings', label: '⚙️ Configuración del Sistema' }
];

const AdminUsuarios = () => {
    const location = useLocation();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    
    // --- NUEVOS ESTADOS DE FILTROS ---
    const [filtroRol, setFiltroRol] = useState("all");
    const [filtroEstado, setFiltroEstado] = useState("all");
    const [filtroTipo, setFiltroTipo] = useState("all"); // Empresa vs Particular
    const [ordenTickets, setOrdenTickets] = useState("default"); // desc, asc
    const [mostrarFiltros, setMostrarFiltros] = useState(false); // Para móviles

    // Estados de UI
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [usuarioDetalle, setUsuarioDetalle] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [activeTab, setActiveTab] = useState('perfil');
    
    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState(null);
    const [permisosEdit, setPermisosEdit] = useState({});

    useEffect(() => {
        cargarUsuarios();
    }, []);

    useEffect(() => {
        if (location.state?.abrirUsuarioId) {
            abrirDetalle(location.state.abrirUsuarioId);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const cargarUsuarios = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const abrirDetalle = async (id) => {
        setDrawerOpen(true);
        setLoadingDetalle(true);
        setActiveTab('perfil');
        try {
            const response = await api.get(`/admin/users/${id}`);
            setUsuarioDetalle(response.data);
        } catch (error) {
            console.error("Error cargando detalle:", error);
        } finally {
            setLoadingDetalle(false);
        }
    };

    const abrirEditar = (usuario) => {
        setUsuarioEditar({
            ...usuario,
            company_name: usuario.company_name || ''
        });

        let parsedPerms = {};
        if (usuario.permissions) {
            parsedPerms = typeof usuario.permissions === 'string' 
                ? JSON.parse(usuario.permissions) 
                : usuario.permissions;
        }
        setPermisosEdit(parsedPerms || {});

        setModalEditarOpen(true);
        setDrawerOpen(false);
    };

    const handleTogglePermiso = (id) => {
        setPermisosEdit(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const guardarEdicion = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/admin/users/${usuarioEditar.id}`, {
                name: usuarioEditar.name,
                email: usuarioEditar.email,
                role_id: parseInt(usuarioEditar.role_id),
                is_active: usuarioEditar.is_active,
                company_name: usuarioEditar.company_name,
                phone: usuarioEditar.phone,
                permissions: permisosEdit
            });

            setUsuarios(usuarios.map(u => u.id === usuarioEditar.id ? response.data : u));
            setModalEditarOpen(false);
        } catch (error) {
            console.error("Error actualizando:", error);
            alert("Error al actualizar usuario.");
        }
    };

    // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
    let usuariosFiltrados = usuarios.filter(u => {
        const coincideBusqueda = u.name.toLowerCase().includes(busqueda.toLowerCase()) ||
                                 u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
                                 (u.company_name && u.company_name.toLowerCase().includes(busqueda.toLowerCase()));
        
        const coincideRol = filtroRol === "all" || Number(u.role_id) === Number(filtroRol);
        const coincideEstado = filtroEstado === "all" || 
                               (filtroEstado === "active" ? u.is_active : !u.is_active);
        const coincideTipo = filtroTipo === "all" || 
                             (filtroTipo === "empresa" ? !!u.company_name : !u.company_name);

        return coincideBusqueda && coincideRol && coincideEstado && coincideTipo;
    });

    if (ordenTickets === "desc") {
        usuariosFiltrados.sort((a, b) => (b.tickets_count || 0) - (a.tickets_count || 0));
    } else if (ordenTickets === "asc") {
        usuariosFiltrados.sort((a, b) => (a.tickets_count || 0) - (b.tickets_count || 0));
    }

    const totalClientes = usuarios.length;
    // Fix: Asegurar de convertir a número para el conteo de total de admins
    const totalAdmins = usuarios.filter(u => Number(u.role_id) === 1).length;

    if (loading) return <div className="h-screen flex items-center justify-center gap-2 text-atlas-900"><Loader2 className="animate-spin" /> Cargando Directorio...</div>;

    return (
        <div className="h-[calc(100vh-80px)] p-4 md:p-10 bg-gray-50/50 flex flex-col overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Directorio</h1>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">Gestión de clientes y accesos</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 flex-1 md:flex-none">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg hidden sm:block"><Users size={18} /></div>
                        <div><p className="text-[10px] uppercase text-gray-400 font-bold">Total</p><p className="font-bold text-gray-900">{totalClientes}</p></div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 flex-1 md:flex-none">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg hidden sm:block"><Shield size={18} /></div>
                        <div><p className="text-[10px] uppercase text-gray-400 font-bold">Admins</p><p className="font-bold text-gray-900">{totalAdmins}</p></div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col flex-1">
                
                {/* --- BARRA DE BÚSQUEDA Y FILTROS --- */}
                <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col gap-4 flex-shrink-0 transition-all">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre, correo o empresa..." 
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-atlas-300 outline-none text-sm md:text-base transition-all" 
                                value={busqueda} 
                                onChange={(e) => setBusqueda(e.target.value)} 
                            />
                        </div>
                        <button 
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            className={`md:hidden p-3 rounded-xl border transition-colors ${mostrarFiltros ? 'bg-atlas-900 text-white border-atlas-900' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>

                    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${mostrarFiltros ? 'flex' : 'hidden md:grid'}`}>
                        <select 
                            value={filtroRol} 
                            onChange={e => setFiltroRol(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-600 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-atlas-300 cursor-pointer"
                        >
                            <option value="all">Todos los Roles</option>
                            <option value="1">Solo Administradores</option>
                            <option value="2">Solo Clientes</option>
                        </select>

                        <select 
                            value={filtroTipo} 
                            onChange={e => setFiltroTipo(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-600 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-atlas-300 cursor-pointer"
                        >
                            <option value="all">Todas las Entidades</option>
                            <option value="empresa">Empresas</option>
                            <option value="particular">Particulares</option>
                        </select>

                        <select 
                            value={filtroEstado} 
                            onChange={e => setFiltroEstado(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-600 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-atlas-300 cursor-pointer"
                        >
                            <option value="all">Cualquier Estado</option>
                            <option value="active">Cuentas Activas</option>
                            <option value="inactive">Cuentas Inactivas</option>
                        </select>

                        <select 
                            value={ordenTickets} 
                            onChange={e => setOrdenTickets(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-600 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-atlas-300 cursor-pointer flex items-center"
                        >
                            <option value="default">Tickets: Por Defecto</option>
                            <option value="desc">Mayor cant. Tickets</option>
                            <option value="asc">Menor cant. Tickets</option>
                        </select>
                    </div>
                </div>

                {/* --- TABLA --- */}
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-100 text-left sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Usuario</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Empresa</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Rol</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50 text-center">Tickets</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {usuariosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-16 text-gray-400">
                                        <Filter size={40} className="mx-auto mb-3 opacity-20"/>
                                        <p>No se encontraron usuarios con esos filtros.</p>
                                    </td>
                                </tr>
                            )}
                            {usuariosFiltrados.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{u.name}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {u.company_name ? <span className="flex items-center gap-2 font-medium"><Building size={14} className="text-gray-400" /> {u.company_name}</span> : <span className="italic text-gray-400">Particular</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* FIX: Parsear a Number para evitar bug de string vs int */}
                                        {Number(u.role_id) === 1 ?
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-atlas-900 text-white"><Shield size={10} /> ADMIN</span> :
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100"><User size={10} /> CLIENTE</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.is_active ?
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-lg w-fit"><CheckCircle size={12} /> Activo</span> :
                                            <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-1 rounded-lg w-fit"><XCircle size={12} /> Inactivo</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold ${u.tickets_count > 0 ? 'bg-orange-50 text-orange-600' : 'text-gray-400 bg-gray-50'}`}>
                                            <Ticket size={14} /> {u.tickets_count || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => abrirDetalle(u.id)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors" title="Ver Detalles"><Eye size={18} /></button>
                                            <button onClick={() => abrirEditar(u)} className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors" title="Editar"><Edit size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DRAWER DETALLE (Sin Cambios Estructurales) */}
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setDrawerOpen(false)} />
            <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {loadingDetalle || !usuarioDetalle ? (
                    <div className="h-full flex items-center justify-center text-atlas-900 gap-2"><Loader2 className="animate-spin" /> Cargando...</div>
                ) : (
                    <>
                        <div className="h-40 md:h-48 bg-atlas-900 relative flex-shrink-0">
                            <button onClick={() => setDrawerOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-md transition-colors"><X size={20} /></button>
                            <div className="absolute -bottom-10 left-6 md:left-8 flex items-end gap-4">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl p-1.5 shadow-lg">
                                    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-3xl md:text-4xl font-black text-gray-400">{usuarioDetalle.name.charAt(0)}</div>
                                </div>
                                <div className="mb-3">
                                    <h2 className="text-xl md:text-2xl font-bold text-white leading-none">{usuarioDetalle.name}</h2>
                                    <p className="text-atlas-300 text-xs md:text-sm mt-1">{usuarioDetalle.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-14 px-6 md:px-8 border-b border-gray-100 flex gap-6 flex-shrink-0 overflow-x-auto custom-scrollbar">
                            {['perfil', 'tickets', 'compras'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-sm font-bold capitalize transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-atlas-900 text-atlas-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{tab}</button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gray-50/50">
                            {activeTab === 'perfil' && (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Información General</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                                            <div><p className="text-xs text-gray-400 uppercase font-bold mb-1">Empresa</p><p className="text-gray-800 font-medium flex items-center gap-2"><Building size={16} className="text-gray-400" /> {usuarioDetalle.company_name || 'No registrada'}</p></div>
                                            <div><p className="text-xs text-gray-400 uppercase font-bold mb-1">Rol</p><span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{Number(usuarioDetalle.role_id) === 1 ? 'Admin' : 'Cliente'}</span></div>
                                            <div><p className="text-xs text-gray-400 uppercase font-bold mb-1">Teléfono</p><p className="text-gray-800 font-medium flex items-center gap-2"><Phone size={16} className="text-gray-400" /> {usuarioDetalle.phone || 'Sin teléfono'}</p></div>
                                            <div><p className="text-xs text-gray-400 uppercase font-bold mb-1">Estado</p><span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${usuarioDetalle.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{usuarioDetalle.is_active ? 'Activo' : 'Inactivo'}</span></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'tickets' && (
                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                    {usuarioDetalle.tickets?.length > 0 ? (
                                        usuarioDetalle.tickets.map(t => (
                                            <div key={t.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-gray-400">{t.ticket_code}</span>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${t.status === 'nuevo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{t.status}</span>
                                                </div>
                                                <h4 className="font-bold text-gray-800 text-sm mb-1">{t.subject}</h4>
                                                <p className="text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()} • {t.category}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-gray-400"><Ticket size={40} className="mx-auto mb-2 opacity-20" /><p>Sin tickets.</p></div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'compras' && (
                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                    {usuarioDetalle.orders?.length > 0 ? (
                                        usuarioDetalle.orders.map(orden => (
                                            <div key={orden.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:shadow-md transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><ShoppingBag size={20} /></div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{orden.order_number}</p>
                                                        <p className="text-xs text-gray-500">{new Date(orden.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-left sm:text-right ml-14 sm:ml-0">
                                                    <p className="font-bold text-gray-900">${parseInt(orden.total).toLocaleString('es-CL')}</p>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${orden.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{orden.status}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-gray-400"><ShoppingBag size={40} className="mx-auto mb-2 opacity-20" /><p>Sin compras.</p></div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* MODAL EDITAR USUARIO */}
            {modalEditarOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Editar Usuario</h2>
                            <button onClick={() => setModalEditarOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500"><X size={20}/></button>
                        </div>

                        <form onSubmit={guardarEdicion} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-900 outline-none" value={usuarioEditar.name} onChange={e => setUsuarioEditar({ ...usuarioEditar, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Empresa</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-900 outline-none" value={usuarioEditar.company_name} onChange={e => setUsuarioEditar({ ...usuarioEditar, company_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Rol</label>
                                    <select className="w-full p-3 bg-gray-50 rounded-xl outline-none" value={usuarioEditar.role_id} onChange={e => setUsuarioEditar({ ...usuarioEditar, role_id: parseInt(e.target.value) })}>
                                        <option value={1}>Admin</option>
                                        <option value={2}>Cliente</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Estado</label>
                                    <select className="w-full p-3 bg-gray-50 rounded-xl outline-none" value={usuarioEditar.is_active ? 1 : 0} onChange={e => setUsuarioEditar({ ...usuarioEditar, is_active: e.target.value == 1 })}>
                                        <option value={1}>Activo</option>
                                        <option value={0}>Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            {Number(usuarioEditar.role_id) === 1 && (
                                <div className="mt-4">
                                    <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                                        <Shield size={16} /> Permisos de Acceso Administrativo
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 md:p-5 bg-gray-50/70 rounded-2xl border border-gray-200">
                                        {PERMISOS_DISPONIBLES.map(permiso => (
                                            <label key={permiso.id} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center shrink-0">
                                                    <input 
                                                        type="checkbox" 
                                                        className="peer w-5 h-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:bg-atlas-900 checked:border-atlas-900 transition-all"
                                                        checked={permisosEdit[permiso.id] || false}
                                                        onChange={() => handleTogglePermiso(permiso.id)}
                                                    />
                                                    <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className={`text-sm leading-tight font-medium transition-colors ${permisosEdit[permiso.id] ? 'text-atlas-900 font-bold' : 'text-gray-600 group-hover:text-atlas-900'}`}>
                                                    {permiso.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 italic leading-relaxed">
                                        * Nota: "Acceso Total" (Super Admin) anula todos los demás permisos y otorga control absoluto.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setModalEditarOpen(false)} className="flex-1 py-3.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-3.5 bg-atlas-900 text-white font-bold rounded-xl hover:bg-atlas-800 shadow-lg transition-all">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminUsuarios;