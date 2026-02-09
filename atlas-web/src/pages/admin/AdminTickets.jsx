import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
    Ticket, MessageSquare, Clock, CheckCircle,
    AlertCircle, Search, User, MoreVertical,
    Send, Paperclip, Image as ImageIcon, X, FileText,
    Sparkles, Mail, Building, Calendar, Loader2,
    Trash2, AlertTriangle
} from 'lucide-react';
import { BASE_URL } from '../api/constants';

const AdminTickets = () => {
    const { user: adminUser } = useAuth();
    const navigate = useNavigate();

    // --- ESTADOS DE DATOS ---
    const [tickets, setTickets] = useState([]);
    const [ticketActivo, setTicketActivo] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS UI ---
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [busqueda, setBusqueda] = useState("");
    const [nuevaRespuesta, setNuevaRespuesta] = useState("");
    const [adjuntos, setAdjuntos] = useState([]); 
    const [enviando, setEnviando] = useState(false);

    // --- MODALES Y UX ---
    const [usuarioDetalle, setUsuarioDetalle] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false); 
    
    // Sistema de Notificaciones
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
    
    // Modal de Confirmación
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', action: null });

    const fileInputRef = useRef(null);

    // 1. CARGA INICIAL
    useEffect(() => {
        cargarTickets();
    }, []);

    // 2. POLLING (Auto-actualización)
    useEffect(() => {
        const intervalo = setInterval(() => {
            if (!enviando && !drawerOpen && !confirmModal.show) {
                cargarTickets(true); 
            }
        }, 5000);
        return () => clearInterval(intervalo);
    }, [enviando, ticketActivo, drawerOpen, confirmModal.show]);

    // --- HELPERS UX (TOASTS & MODALES) ---
    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const pedirConfirmacion = (message, action) => {
        setConfirmModal({ show: true, message, action });
    };

    const cerrarConfirmacion = () => {
        setConfirmModal({ show: false, message: '', action: null });
    };

    const ejecutarAccionConfirmada = async () => {
        if (confirmModal.action) await confirmModal.action();
        cerrarConfirmacion();
    };

    // --- LOGICA DE DATOS ---
    const cargarTickets = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get('/admin/tickets');
            setTickets(response.data);

            if (ticketActivo) {
                const ticketActualizado = response.data.find(t => t.id === ticketActivo.id);
                if (ticketActualizado && ticketActualizado.messages.length !== ticketActivo.messages.length) {
                    setTicketActivo(ticketActualizado);
                }
            }
        } catch (error) {
            console.error("Error:", error);
            if (!silent) showToast('error', 'Error de conexión');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) setAdjuntos(prev => [...prev, ...Array.from(e.target.files)]);
    };

    const removeFile = (index) => {
        setAdjuntos(prev => prev.filter((_, i) => i !== index));
    };

    const verPerfilCliente = (usuario) => {
        setUsuarioDetalle(usuario);
        setDrawerOpen(true);
    };

    // --- NAVEGACIÓN A PERFIL COMPLETO ---
    const irAPerfilCompleto = () => {
        if (usuarioDetalle) {
            navigate('/admin/usuarios', { state: { abrirUsuarioId: usuarioDetalle.id } });
        }
    };

    // --- ACCIONES PRINCIPALES ---

    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!nuevaRespuesta.trim() && adjuntos.length === 0) return;
        
        setEnviando(true);
        try {
            const formData = new FormData();
            formData.append('mensaje', nuevaRespuesta);
            adjuntos.forEach((file, index) => formData.append(`attachments[${index}]`, file));

            const response = await api.post(`/tickets/${ticketActivo.id}/reply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Actualización Optimista
            const msgNuevo = response.data;
            const actualizado = {
                ...ticketActivo,
                status: 'abierto',
                messages: [...ticketActivo.messages, msgNuevo]
            };

            setTicketActivo(actualizado);
            setTickets(tickets.map(t => t.id === ticketActivo.id ? actualizado : t));
            
            setNuevaRespuesta("");
            setAdjuntos([]);
            showToast('success', 'Respuesta enviada');

            if (ticketActivo.status === 'nuevo') {
                api.put(`/admin/tickets/${ticketActivo.id}/status`, { status: 'abierto' });
            }

        } catch (error) {
            console.error(error);
            showToast('error', 'Error al enviar mensaje');
        } finally {
            setEnviando(false);
            setTimeout(() => cargarTickets(true), 1000);
        }
    };

    const cambiarEstado = async (nuevoEstado) => {
        try {
            await api.put(`/admin/tickets/${ticketActivo.id}/status`, { status: nuevoEstado });
            const actualizado = { ...ticketActivo, status: nuevoEstado };
            setTicketActivo(actualizado);
            setTickets(tickets.map(t => t.id === ticketActivo.id ? actualizado : t));
            showToast('success', `Ticket marcado como ${nuevoEstado}`);
        } catch (error) {
            console.error(error);
            showToast('error', 'No se pudo cambiar el estado');
        }
    };

    const eliminarTicket = (id) => {
        pedirConfirmacion("¿Estás seguro de eliminar este ticket y todo su historial?", async () => {
            try {
                await api.delete(`/admin/tickets/${id}`);
                setTickets(prev => prev.filter(t => t.id !== id));
                if (ticketActivo?.id === id) setTicketActivo(null);
                showToast('success', 'Ticket eliminado correctamente');
            } catch (error) {
                console.error(error);
                showToast('error', 'Error al eliminar ticket');
            }
        });
    };

    const ticketsFiltrados = tickets.filter(t => {
        const coincideEstado = filtroEstado === 'todos' ? true : t.status === filtroEstado;
        const query = busqueda.toLowerCase();
        const coincideBusqueda =
            t.user?.name.toLowerCase().includes(query) ||
            t.subject?.toLowerCase().includes(query) ||
            t.category?.toLowerCase().includes(query) ||
            t.ticket_code?.toLowerCase().includes(query);

        return coincideEstado && coincideBusqueda;
    });

    if (loading) return <div className="h-screen flex items-center justify-center gap-2 text-atlas-900"><Loader2 className="animate-spin" /> Cargando Soporte...</div>;

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-6 bg-gray-50/50 overflow-hidden relative">

            {/* --- NOTIFICACIÓN TOAST --- */}
            {toast.show && (
                <div className={`fixed top-24 right-4 md:right-10 z-[100] px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                    <span className="font-medium text-sm">{toast.message}</span>
                </div>
            )}

            {/* --- MODAL CONFIRMACIÓN --- */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 text-center">
                        <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
                        <p className="text-gray-500 text-sm mb-6">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button onClick={cerrarConfirmacion} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={ejecutarAccionConfirmada} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg transition-all">Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. LISTA LATERAL (Tickets) */}
            <div className={`w-full md:w-1/3 flex flex-col gap-4 h-full ${ticketActivo ? 'hidden md:flex' : 'flex'}`}>
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 flex flex-col h-full overflow-hidden">
                    
                    <div className="flex justify-between items-center mb-6 flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-900">Tickets</h2>
                        <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
                            {['todos', 'nuevo', 'cerrado'].map(f => (
                                <button key={f} onClick={() => setFiltroEstado(f)} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${filtroEstado === f ? 'bg-atlas-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative mb-4 flex-shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-atlas-300 outline-none text-sm transition-all"/>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {ticketsFiltrados.length === 0 ? (
                            <div className="text-center py-10 text-gray-400"><Ticket size={32} className="mx-auto mb-2 opacity-20"/><p className="text-xs">No hay tickets</p></div>
                        ) : (
                            ticketsFiltrados.map(t => (
                                <div key={t.id} onClick={() => setTicketActivo(t)} className={`p-4 rounded-2xl cursor-pointer transition-all border-2 group relative ${ticketActivo?.id === t.id ? 'bg-atlas-50 border-atlas-200 shadow-md' : 'bg-white border-transparent hover:bg-gray-50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-mono font-bold text-gray-400">{t.ticket_code}</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${t.priority === 'alta' ? 'bg-red-100 text-red-600' : t.priority === 'media' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{t.priority}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-sm truncate pr-6">{t.subject}</h3>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); eliminarTicket(t.id); }}
                                        className="absolute right-2 top-10 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Eliminar Ticket"
                                    >
                                        <Trash2 size={16}/>
                                    </button>

                                    <div className="relative group/user w-fit mt-1">
                                        <button onClick={(e) => { e.stopPropagation(); verPerfilCliente(t.user); }} className="text-xs text-atlas-500 font-bold hover:underline cursor-pointer flex items-center gap-1"><User size={12} /> {t.user?.name}</button>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] text-gray-400 font-medium">{t.category}</span>
                                        <span className={`w-2 h-2 rounded-full ${t.status === 'nuevo' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 2. ÁREA DE CONVERSACIÓN */}
            <div className={`flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100/50 border border-gray-100 overflow-hidden relative isolate h-full ${!ticketActivo ? 'hidden md:flex' : 'flex'}`}>
                {ticketActivo ? (
                    <>
                        {/* Header Chat */}
                        <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setTicketActivo(null)} className="md:hidden p-2 text-gray-500"><X size={20}/></button>
                                <div onClick={() => verPerfilCliente(ticketActivo.user)} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-atlas-900 text-white flex items-center justify-center font-bold text-xl shadow-lg cursor-pointer hover:scale-105 transition-transform">
                                    {ticketActivo.user?.name?.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <h2 className="text-base md:text-xl font-bold text-gray-900 leading-none truncate max-w-[180px] md:max-w-md" title={ticketActivo.subject}>{ticketActivo.subject}</h2>
                                    <p className="text-xs md:text-sm text-gray-500 mt-1 flex items-center gap-2">
                                        <span onClick={() => verPerfilCliente(ticketActivo.user)} className="hover:text-atlas-900 cursor-pointer hover:underline truncate">{ticketActivo.user?.name}</span> 
                                        • {ticketActivo.category}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {ticketActivo.status !== 'cerrado' ? (
                                    <button onClick={() => cambiarEstado('cerrado')} className="p-2 md:p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-green-600 hover:border-green-200 transition-all" title="Marcar Resuelto"><CheckCircle size={20} /></button>
                                ) : (
                                    <button onClick={() => cambiarEstado('abierto')} className="p-2 md:p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all" title="Reabrir"><Clock size={20} /></button>
                                )}
                            </div>
                        </div>

                        {/* Mensajes */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-gray-50/30 flex flex-col-reverse">
                            {[...ticketActivo.messages].reverse().map((msg) => {
                                const esAdmin = msg.user_id === adminUser.id;

                                return (
                                    <div key={msg.id} className={`flex ${esAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] md:max-w-[70%] ${esAdmin ? 'order-1' : ''}`}>
                                            <div className={`p-4 md:p-5 rounded-[1.5rem] shadow-sm ${esAdmin ? 'bg-atlas-900 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                                                <p className="text-sm leading-relaxed">{msg.message}</p>
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {msg.attachments.map((file, index) => {
                                                            const filePath = typeof file === 'string' ? file : file.path;
                                                            const fileName = typeof file === 'string' ? 'Archivo Adjunto' : file.name;
                                                            if (!filePath) return null;

                                                            return (
                                                                <div key={index} className="rounded-lg overflow-hidden border border-white/20 bg-black/5">
                                                                    <a href={`${BASE_URL}${filePath}`} target="_blank" rel="noopener noreferrer" download={fileName} className="flex items-center gap-3 p-3 group">
                                                                        <div className="bg-white/10 p-2 rounded-lg text-current">{filePath.match(/\.(jpeg|jpg|gif|png)$/i) ? <ImageIcon size={20}/> : <FileText size={20}/>}</div>
                                                                        <div className="flex-1 overflow-hidden">
                                                                            <p className="text-xs font-bold truncate">{fileName}</p>
                                                                            <p className="text-[10px] opacity-70">Clic para descargar</p>
                                                                        </div>
                                                                    </a>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest text-gray-400 ${esAdmin ? 'text-right' : 'text-left'}`}>
                                                {!esAdmin && msg.user?.name + ' • '}
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-8 bg-white border-t border-gray-100 relative z-20 flex-shrink-0">
                            {adjuntos.length > 0 && (
                                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                                    {adjuntos.map((file, i) => (
                                        <div key={i} className="relative bg-gray-50 rounded-lg p-2 border border-gray-200 flex items-center gap-2 min-w-[100px]">
                                            <div className="bg-white p-1 rounded shadow-sm text-atlas-500">{file.type.startsWith('image/') ? <ImageIcon size={14}/> : <FileText size={14}/>}</div>
                                            <span className="text-[10px] font-medium text-gray-600 truncate max-w-[100px]">{file.name}</span>
                                            <button onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 bg-white text-red-500 border border-red-100 rounded-full p-0.5 hover:bg-red-50 shadow-sm"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={enviarMensaje} className="bg-gray-50 p-2 rounded-[2rem] border border-gray-100 flex items-end gap-2 focus-within:ring-2 focus-within:ring-atlas-200 transition-all">
                                <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 md:p-4 text-gray-400 hover:text-atlas-900 transition-colors"><Paperclip size={22} /></button>
                                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                <textarea rows="1" placeholder="Respuesta oficial..." className="flex-1 bg-transparent border-0 outline-none py-3 md:py-4 text-sm resize-none custom-scrollbar" value={nuevaRespuesta} onChange={(e) => setNuevaRespuesta(e.target.value)} disabled={enviando} />
                                <button type="submit" disabled={(!nuevaRespuesta.trim() && adjuntos.length === 0) || enviando} className="bg-atlas-900 text-white p-3 md:p-4 rounded-[1.5rem] shadow-lg hover:bg-atlas-800 transition-all flex items-center justify-center disabled:opacity-50">
                                    {enviando ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </form>
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none z-0"><Sparkles size={200} className="text-atlas-900" /></div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400"><MessageSquare size={64} className="mb-4 opacity-10" /><p>Selecciona un ticket para comenzar</p></div>
                )}
            </div>

            {/* --- DRAWER PERFIL CLIENTE --- */}
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setDrawerOpen(false)}/>
            
            <div className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {usuarioDetalle && (
                    <div className="h-full flex flex-col relative">
                        {/* Header Panel */}
                        <div className="h-40 bg-atlas-900 relative flex-shrink-0">
                            <button onClick={() => setDrawerOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-md transition-colors"><X size={20}/></button>
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-lg mb-3">
                                    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-4xl font-black text-gray-400">{usuarioDetalle.name.charAt(0)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Info Panel */}
                        <div className="mt-16 px-8 flex-1 overflow-y-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold text-gray-900">{usuarioDetalle.name}</h2>
                                <p className="text-sm text-gray-500 font-medium">{usuarioDetalle.company_name || 'Particular'}</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wide">{usuarioDetalle.role_id === 1 ? 'Administrador' : 'Cliente'}</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><Mail size={18} /></div>
                                    <div className="overflow-hidden"><p className="text-xs text-gray-400 font-bold uppercase">Correo</p><p className="text-sm font-medium text-gray-800 truncate" title={usuarioDetalle.email}>{usuarioDetalle.email}</p></div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><Building size={18} /></div>
                                    <div><p className="text-xs text-gray-400 font-bold uppercase">Empresa</p><p className="text-sm font-medium text-gray-800">{usuarioDetalle.company_name || 'No registrada'}</p></div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><Calendar size={18} /></div>
                                    <div><p className="text-xs text-gray-400 font-bold uppercase">Miembro desde</p><p className="text-sm font-medium text-gray-800">{new Date(usuarioDetalle.created_at).toLocaleDateString()}</p></div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Panel */}
                        <div className="p-6 border-t border-gray-100 bg-white">
                            <button 
                                onClick={irAPerfilCompleto}
                                className="w-full py-3 bg-atlas-900 text-white rounded-xl font-bold hover:bg-atlas-800 transition-all shadow-lg text-sm"
                            >
                                Ver Perfil Completo
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminTickets;