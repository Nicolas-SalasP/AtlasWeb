import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // <--- 1. IMPORTAR ESTO
import api from '../../api/axiosConfig';
import {
    Search, User, Mail, Building, Calendar,
    Shield, Ticket, Loader2, Users,
    Eye, Edit, Trash2, X, ShoppingBag, Phone, CheckCircle, XCircle
} from 'lucide-react';

const AdminUsuarios = () => {
    // --- HOOKS ---
    const location = useLocation(); // <--- 2. NECESARIO PARA LEER LA NAVEGACIÓN

    // --- ESTADOS ---
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    // --- ESTADOS DEL DRAWER (VER DETALLE) ---
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [usuarioDetalle, setUsuarioDetalle] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [activeTab, setActiveTab] = useState('perfil');

    // --- ESTADOS DEL MODAL (EDITAR) ---
    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState(null);

    // 1. CARGAR USUARIOS AL INICIO
    useEffect(() => {
        cargarUsuarios();
    }, []);

    // 2. EFECTO MAGICO: DETECTAR NAVEGACIÓN DESDE TICKETS
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

    // 3. ABRIR DRAWER (VER DETALLES)
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

    // 4. ABRIR MODAL (EDITAR)
    const abrirEditar = (usuario) => {
        setUsuarioEditar({
            ...usuario,
            company_name: usuario.company_name || ''
        });
        setModalEditarOpen(true);
        setDrawerOpen(false);
    };

    // 5. GUARDAR EDICIÓN (PUT)
    const guardarEdicion = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/admin/users/${usuarioEditar.id}`, {
                name: usuarioEditar.name,
                email: usuarioEditar.email,
                role_id: parseInt(usuarioEditar.role_id),
                is_active: usuarioEditar.is_active,
                company_name: usuarioEditar.company_name,
                phone: usuarioEditar.phone
            });

            setUsuarios(usuarios.map(u => u.id === usuarioEditar.id ? response.data : u));
            setModalEditarOpen(false);
        } catch (error) {
            console.error("Error actualizando:", error);
            alert("Error al actualizar usuario.");
        }
    };

    // FILTRO
    const usuariosFiltrados = usuarios.filter(u =>
        u.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        (u.company_name && u.company_name.toLowerCase().includes(busqueda.toLowerCase()))
    );

    // CONTADORES
    const totalClientes = usuarios.length;
    const totalAdmins = usuarios.filter(u => u.role_id === 1).length;

    if (loading) return <div className="h-screen flex items-center justify-center gap-2 text-atlas-900"><Loader2 className="animate-spin" /> Cargando Directorio...</div>;

    return (
        <div className="h-[calc(100vh-80px)] p-4 md:p-10 bg-gray-50/50 flex flex-col overflow-hidden relative">

            {/* HEADER Y STATS */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Directorio</h1>
                    <p className="text-gray-500 mt-1">Gestión de clientes y accesos</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={18} /></div>
                        <div><p className="text-[10px] uppercase text-gray-400 font-bold">Total</p><p className="font-bold text-gray-900">{totalClientes}</p></div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Shield size={18} /></div>
                        <div><p className="text-[10px] uppercase text-gray-400 font-bold">Admins</p><p className="font-bold text-gray-900">{totalAdmins}</p></div>
                    </div>
                </div>
            </div>

            {/* TABLA PRINCIPAL */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col flex-1">
                {/* Buscador */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex-shrink-0">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Buscar cliente..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-atlas-200 outline-none text-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                </div>

                {/* Tabla Scrolleable */}
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-100 text-left sticky top-0 z-10">
                            <tr>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Usuario</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Empresa</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Rol</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50 text-center">Tickets</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase bg-gray-50 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {usuariosFiltrados.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
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
                                        {u.role_id === 1 ?
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-atlas-900 text-white"><Shield size={10} /> ADMIN</span> :
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100"><User size={10} /> CLIENTE</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.is_active ?
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg w-fit"><CheckCircle size={12} /> Activo</span> :
                                            <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg w-fit"><XCircle size={12} /> Inactivo</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold ${u.tickets_count > 0 ? 'bg-orange-50 text-orange-600' : 'text-gray-400 bg-gray-50'}`}>
                                            <Ticket size={14} /> {u.tickets_count}
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

            {/* --- DRAWER (PANEL LATERAL) --- */}
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setDrawerOpen(false)} />
            <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {loadingDetalle || !usuarioDetalle ? (
                    <div className="h-full flex items-center justify-center text-atlas-900 gap-2"><Loader2 className="animate-spin" /> Cargando...</div>
                ) : (
                    <>
                        <div className="h-48 bg-atlas-900 relative flex-shrink-0">
                            <button onClick={() => setDrawerOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-md transition-colors"><X size={20} /></button>
                            <div className="absolute -bottom-10 left-8 flex items-end gap-4">
                                <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-lg">
                                    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-4xl font-black text-gray-400">{usuarioDetalle.name.charAt(0)}</div>
                                </div>
                                <div className="mb-3">
                                    <h2 className="text-2xl font-bold text-white leading-none">{usuarioDetalle.name}</h2>
                                    <p className="text-atlas-300 text-sm mt-1">{usuarioDetalle.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-14 px-8 border-b border-gray-100 flex gap-6 flex-shrink-0">
                            {['perfil', 'tickets', 'compras'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-sm font-bold capitalize transition-colors border-b-2 ${activeTab === tab ? 'border-atlas-900 text-atlas-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{tab}</button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50">
                            {/* TAB PERFIL */}
                            {activeTab === 'perfil' && (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Información General</h3>
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                            <div><p className="text-xs text-gray-400 uppercase font-bold mb-1">Empresa</p><p className="text-gray-800 font-medium flex items-center gap-2"><Building size={16} className="text-gray-400" /> {usuarioDetalle.company_name || 'No registrada'}</p></div>
                                            <div><p className="text-xs text-gray-400 uppercase font-bold mb-1">Rol</p><span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{usuarioDetalle.role_id === 1 ? 'Admin' : 'Cliente'}</span></div>
                                            <div><p className="text-xs text-gray-400 uppercase font-bold mb-1">Teléfono</p><p className="text-gray-800 font-medium flex items-center gap-2"><Phone size={16} className="text-gray-400" /> {usuarioDetalle.phone || 'Sin teléfono'}</p></div>
                                            <div><p className="text-xs text-gray-400 uppercase font-bold mb-1">Estado</p><span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${usuarioDetalle.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{usuarioDetalle.is_active ? 'Activo' : 'Inactivo'}</span></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB TICKETS */}
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

                            {/* TAB COMPRAS (ORDENES) */}
                            {activeTab === 'compras' && (
                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                    {usuarioDetalle.orders?.length > 0 ? (
                                        usuarioDetalle.orders.map(orden => (
                                            <div key={orden.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><ShoppingBag size={20} /></div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{orden.order_number}</p>
                                                        <p className="text-xs text-gray-500">{new Date(orden.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
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

            {/* --- MODAL EDITAR USUARIO --- */}
            {modalEditarOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Editar Usuario</h2>
                        <form onSubmit={guardarEdicion} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
                                <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-900 outline-none bg-gray-100" value={usuarioEditar.name} onChange={e => setUsuarioEditar({ ...usuarioEditar, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Empresa</label>
                                <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-900 outline-none bg-gray-100" value={usuarioEditar.company_name} onChange={e => setUsuarioEditar({ ...usuarioEditar, company_name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Rol</label>
                                    <select className="w-full p-3 bg-gray-50 rounded-xl outline-none bg-gray-100" value={usuarioEditar.role_id} onChange={e => setUsuarioEditar({ ...usuarioEditar, role_id: e.target.value })}>
                                        <option value={1}>Admin</option>
                                        <option value={2}>Cliente</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Estado</label>
                                    <select className="w-full p-3 bg-gray-50 rounded-xl outline-none bg-gray-100" value={usuarioEditar.is_active ? 1 : 0} onChange={e => setUsuarioEditar({ ...usuarioEditar, is_active: e.target.value == 1 })}>
                                        <option value={1}>Activo</option>
                                        <option value={0}>Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setModalEditarOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-atlas-900 text-white font-bold rounded-xl hover:bg-atlas-800 shadow-lg transition-all">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminUsuarios;