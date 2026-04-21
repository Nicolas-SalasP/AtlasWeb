import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
    Ticket, MessageSquare, Clock, CheckCircle,
    AlertCircle, Search, User, Send, Paperclip, 
    Image as ImageIcon, X, FileText, Sparkles, 
    Mail, Building, Calendar, Loader2, Trash2, 
    AlertTriangle, ShieldCheck, ChevronLeft
} from 'lucide-react';
import { BASE_URL } from '../../api/constants';

const AdminTickets = () => {
    const { user: adminUser } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [ticketActivo, setTicketActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [busqueda, setBusqueda] = useState("");
    const [nuevaRespuesta, setNuevaRespuesta] = useState("");
    const [adjuntos, setAdjuntos] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const [usuarioDetalle, setUsuarioDetalle] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', action: null });
    const fileInputRef = useRef(null);
    const mensajesFinRef = useRef(null); 

    useEffect(() => {
        cargarTickets();
    }, []);

    useEffect(() => {
        if (ticketActivo && mensajesFinRef.current) {
            mensajesFinRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [ticketActivo?.messages]);

    useEffect(() => {
        const intervalo = setInterval(() => {
            if (!enviando && !drawerOpen && !confirmModal.show) {
                cargarTickets(true);
            }
        }, 8000); 
        return () => clearInterval(intervalo);
    }, [enviando, ticketActivo, drawerOpen, confirmModal.show]);

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

    const irAPerfilCompleto = () => {
        if (usuarioDetalle) {
            navigate('/admin/usuarios', { state: { abrirUsuarioId: usuarioDetalle.id } });
        }
    };

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

            const msgNuevo = { ...response.data, user: adminUser }; 
            
            const actualizado = {
                ...ticketActivo,
                status: 'abierto',
                messages: [...ticketActivo.messages, msgNuevo]
            };

            setTicketActivo(actualizado);
            setTickets(tickets.map(t => t.id === ticketActivo.id ? actualizado : t));

            setNuevaRespuesta("");
            setAdjuntos([]);
            showToast('success', 'Mensaje enviado');

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
            showToast('success', `Ticket ${nuevoEstado === 'cerrado' ? 'resuelto' : 'reabierto'}`);
        } catch (error) {
            console.error(error);
            showToast('error', 'No se pudo cambiar el estado');
        }
    };

    const eliminarTicket = (id) => {
        pedirConfirmacion("¿Estás seguro de eliminar este ticket y todo su historial? Esta acción no se puede deshacer.", async () => {
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

    const getPriorityColor = (priority) => {
        switch(priority?.toLowerCase()) {
            case 'alta': return 'text-red-600 bg-red-50 border-red-200';
            case 'media': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'baja': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'nuevo': return 'bg-emerald-500 shadow-emerald-200 shadow-md';
            case 'abierto': return 'bg-blue-500 shadow-blue-200 shadow-md';
            case 'cerrado': return 'bg-gray-400';
            default: return 'bg-gray-300';
        }
    };

    const ticketsFiltrados = tickets.filter(t => {
        const coincideEstado = filtroEstado === 'todos' ? true : t.status === filtroEstado;
        const query = busqueda.toLowerCase();
        const coincideBusqueda =
            t.user?.name?.toLowerCase().includes(query) ||
            t.subject?.toLowerCase().includes(query) ||
            t.ticket_code?.toLowerCase().includes(query);

        return coincideEstado && coincideBusqueda;
    });

    if (loading) return <div className="h-screen flex items-center justify-center gap-2 text-tenri-900"><Loader2 className="animate-spin" /> Cargando Centro de Soporte...</div>;

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 p-4 md:p-6 bg-gray-100 overflow-hidden relative">

            {/* TOAST NOTIFICACIONES */}
            {toast.show && (
                <div className={`fixed top-24 right-4 md:right-10 z-[100] px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-tenri-900 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            {/* MODAL DE CONFIRMACIÓN */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-md">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar Acción</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button onClick={cerrarConfirmacion} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={ejecutarAccionConfirmada} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg transition-all">Eliminar Definitivamente</button>
                        </div>
                    </div>
                </div>
            )}

            {/* PANEL IZQUIERDO: LISTA DE TICKETS */}
            <div className={`w-full md:w-[350px] lg:w-[400px] flex flex-col h-full flex-shrink-0 ${ticketActivo ? 'hidden md:flex' : 'flex'}`}>
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 flex flex-col h-full overflow-hidden border border-white">
                    
                    <div className="p-6 pb-4 border-b border-gray-100 bg-white z-10 flex-shrink-0">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Soporte</h2>
                                <p className="text-sm text-gray-500 font-medium">{tickets.length} solicitudes activas</p>
                            </div>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar ticket o cliente..." 
                                value={busqueda} 
                                onChange={(e) => setBusqueda(e.target.value)} 
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-tenri-300 focus:bg-white outline-none text-sm font-medium transition-all" 
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                            {['todos', 'nuevo', 'abierto', 'cerrado'].map(f => (
                                <button 
                                    key={f} 
                                    onClick={() => setFiltroEstado(f)} 
                                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap border ${filtroEstado === f ? 'bg-tenri-900 text-white border-tenri-900 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
                                >
                                    {f === 'todos' ? 'Todos' : f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-gray-50/30">
                        {ticketsFiltrados.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                                <CheckCircle size={48} className="text-emerald-300 mb-4 opacity-50" />
                                <p className="font-bold text-gray-600">Bandeja Vacía</p>
                                <p className="text-sm mt-1">No hay tickets que coincidan.</p>
                            </div>
                        ) : (
                            ticketsFiltrados.map(t => (
                                <div 
                                    key={t.id} 
                                    onClick={() => setTicketActivo(t)} 
                                    className={`p-4 rounded-2xl cursor-pointer transition-all border group relative ${ticketActivo?.id === t.id ? 'bg-white border-tenri-400 shadow-lg shadow-tenri-200/20 scale-[1.02]' : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md'}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="relative shrink-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 border-white shadow-sm ${ticketActivo?.id === t.id ? 'bg-tenri-100 text-tenri-900' : 'bg-gray-100 text-gray-600'}`}>
                                                {t.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${getStatusColor(t.status)}`}></span>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-xs font-bold text-gray-900 truncate pr-2">{t.user?.name}</p>
                                                <span className="text-[10px] font-mono text-gray-400 shrink-0">{new Date(t.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                            </div>
                                            <h3 className="font-bold text-sm text-gray-700 leading-tight mb-2 truncate">{t.subject}</h3>
                                            
                                            <div className="flex justify-between items-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(t.priority)}`}>
                                                    {t.priority}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.ticket_code}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); eliminarTicket(t.id); }}
                                        className="absolute -top-2 -right-2 p-1.5 bg-white text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full border border-gray-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                        title="Eliminar Ticket"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* PANEL DERECHO: CHAT DEL TICKET */}
            <div className={`flex-1 flex flex-col bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 overflow-hidden relative border border-white ${!ticketActivo ? 'hidden md:flex' : 'flex'}`}>
                {ticketActivo ? (
                    <>
                        <div className="p-4 md:p-6 border-b border-gray-100 bg-white z-20 flex justify-between items-center flex-shrink-0 shadow-sm">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setTicketActivo(null)} className="md:hidden p-2 text-gray-400 hover:text-gray-800 bg-gray-50 rounded-full"><ChevronLeft size={24} /></button>
                                
                                <div onClick={() => verPerfilCliente(ticketActivo.user)} className="w-12 h-12 rounded-full bg-tenri-900 text-white flex items-center justify-center font-bold text-xl shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0">
                                    {ticketActivo.user?.name?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-lg md:text-xl font-black text-gray-900 truncate" title={ticketActivo.subject}>{ticketActivo.subject}</h2>
                                        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded hidden sm:block">{ticketActivo.ticket_code}</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                                        <span onClick={() => verPerfilCliente(ticketActivo.user)} className="hover:text-tenri-900 font-bold cursor-pointer hover:underline truncate">{ticketActivo.user?.name}</span>
                                        • <span className="capitalize">{ticketActivo.category}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 ml-4">
                                {ticketActivo.status !== 'cerrado' ? (
                                    <button 
                                        onClick={() => cambiarEstado('cerrado')} 
                                        className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 hover:bg-green-500 hover:text-white rounded-xl font-bold text-sm transition-all border border-green-200 hover:border-green-500 shadow-sm group"
                                    >
                                        <CheckCircle size={18} className="group-hover:scale-110 transition-transform"/> <span className="hidden sm:inline">Resolver Ticket</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => cambiarEstado('abierto')} 
                                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white rounded-xl font-bold text-sm transition-all border border-amber-200 hover:border-amber-500 shadow-sm group"
                                    >
                                        <Clock size={18} className="group-hover:-rotate-90 transition-transform"/> <span className="hidden sm:inline">Reabrir Ticket</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Área de Mensajes */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/50 custom-scrollbar">
                            {ticketActivo.messages?.map((msg, idx) => {
                                const esAdmin = Number(msg.user?.role_id) === 1;

                                return (
                                    <div key={msg.id || idx} className={`flex ${esAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[90%] md:max-w-[75%] ${esAdmin ? 'order-1' : ''}`}>
                                            {/* AGREGADO: min-w-[140px] para que la burbuja nunca sea más pequeña que la etiqueta */}
                                            <div className={`px-4 py-2.5 md:px-5 md:py-3 min-w-[140px] rounded-[1.5rem] shadow-sm relative ${esAdmin ? 'bg-tenri-900 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                                                
                                                {esAdmin && (
                                                    // AGREGADO: whitespace-nowrap para que el texto de Staff no haga saltos de línea
                                                    <div className="absolute -top-3 right-4 bg-tenri-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap">
                                                        <ShieldCheck size={10} /> Tenri Staff
                                                    </div>
                                                )}

                                                <p className="text-sm leading-normal whitespace-pre-wrap">{msg.message}</p>
                                                
                                                {msg.attachments && (
                                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {(() => {
                                                            let adjuntosSeguros = [];
                                                            try {
                                                                adjuntosSeguros = typeof msg.attachments === 'string' ? JSON.parse(msg.attachments) : msg.attachments;
                                                            } catch (e) { adjuntosSeguros = []; }

                                                            if (!Array.isArray(adjuntosSeguros)) return null;

                                                            return adjuntosSeguros.map((file, index) => {
                                                                const filePath = typeof file === 'string' ? file : file.path;
                                                                const fileName = typeof file === 'string' ? 'Archivo Adjunto' : file.name;
                                                                if (!filePath) return null;

                                                                return (
                                                                    <a key={index} href={`${BASE_URL}${filePath}`} target="_blank" rel="noopener noreferrer" download={fileName} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all hover:scale-[1.02] ${esAdmin ? 'border-white/20 bg-black/10 hover:bg-black/20' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                                                                        <div className={`${esAdmin ? 'text-white' : 'text-tenri-500'}`}>
                                                                            {filePath.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? <ImageIcon size={20} /> : <FileText size={20} />}
                                                                        </div>
                                                                        <div className="flex-1 overflow-hidden">
                                                                            <p className="text-xs font-bold truncate">{fileName}</p>
                                                                            <p className={`text-[10px] ${esAdmin ? 'text-tenri-200' : 'text-gray-400'}`}>Descargar</p>
                                                                        </div>
                                                                    </a>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            {/* MOSTRAR EL NOMBRE REAL DE QUIEN RESPONDIÓ (Cliente o Administrador) */}
                                            <p className={`text-[10px] mt-1 font-bold tracking-wide text-gray-400 ${esAdmin ? 'text-right pr-2' : 'text-left pl-2'}`}>
                                                {msg.user?.name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={mensajesFinRef} /> 
                        </div>

                        {/* Input Area de Respuesta */}
                        <div className="p-4 bg-white border-t border-gray-100 relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                            {ticketActivo.status === 'cerrado' && (
                                <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                    <p className="text-sm font-bold text-gray-500 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100">Este ticket está cerrado. Reábrelo para responder.</p>
                                </div>
                            )}

                            {adjuntos.length > 0 && (
                                <div className="flex gap-2 mb-3 overflow-x-auto custom-scrollbar pb-2">
                                    {adjuntos.map((file, i) => (
                                        <div key={i} className="relative bg-tenri-50 text-tenri-900 rounded-xl p-2.5 border border-tenri-100 flex items-center gap-2 shrink-0 shadow-sm animate-in zoom-in-95">
                                            <div className="bg-white p-1.5 rounded-lg shadow-sm">{file.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}</div>
                                            <span className="text-xs font-bold truncate max-w-[120px]">{file.name}</span>
                                            <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-transform hover:scale-110"><X size={12} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={enviarMensaje} className="bg-gray-50 p-2 md:p-2.5 rounded-3xl border border-gray-200 flex items-end gap-3 focus-within:ring-4 focus-within:ring-tenri-100 focus-within:border-tenri-300 transition-all shadow-inner">
                                <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 text-gray-400 hover:text-tenri-900 hover:bg-white rounded-full transition-all shrink-0"><Paperclip size={22} /></button>
                                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                
                                <textarea 
                                    rows="1" 
                                    placeholder="Escribe tu respuesta oficial aquí..." 
                                    className="flex-1 bg-transparent border-0 outline-none py-3 text-sm md:text-base font-medium text-gray-700 resize-none max-h-32 custom-scrollbar placeholder:text-gray-400" 
                                    value={nuevaRespuesta} 
                                    onChange={(e) => {
                                        setNuevaRespuesta(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                    }} 
                                    disabled={enviando} 
                                />
                                
                                <button type="submit" disabled={(!nuevaRespuesta.trim() && adjuntos.length === 0) || enviando} className="bg-tenri-900 text-white p-3.5 rounded-full shadow-lg hover:bg-tenri-800 hover:scale-105 transition-all shrink-0 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center">
                                    {enviando ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-white to-gray-50">
                        <div className="w-32 h-32 bg-tenri-50 text-tenri-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <MessageSquare size={64} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Centro de Soporte</h2>
                        <p className="text-gray-500 max-w-sm">Selecciona un ticket de la lista lateral para leer el historial y responder a tus clientes.</p>
                    </div>
                )}
            </div>

            {/* --- DRAWER PERFIL CLIENTE --- */}
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setDrawerOpen(false)} />

            <div className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {usuarioDetalle && (
                    <div className="h-full flex flex-col relative">
                        <div className="h-40 bg-tenri-900 relative flex-shrink-0 rounded-bl-[3rem]">
                            <button onClick={() => setDrawerOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-md transition-colors"><X size={20} /></button>
                            <div className="absolute -bottom-12 left-8 flex items-end gap-4">
                                <div className="w-24 h-24 bg-white rounded-[1.5rem] p-1.5 shadow-xl">
                                    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-4xl font-black text-gray-400">{usuarioDetalle.name.charAt(0)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 px-8 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">{usuarioDetalle.name}</h2>
                                <p className="text-sm text-gray-500 font-medium flex items-center gap-1">{usuarioDetalle.company_name || 'Cliente Particular'}</p>
                                <span className={`inline-flex items-center gap-1 mt-3 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${Number(usuarioDetalle.role_id) === 1 ? 'bg-tenri-900 text-white' : 'bg-blue-50 text-blue-600'}`}>
                                    {Number(usuarioDetalle.role_id) === 1 ? <ShieldCheck size={12}/> : <User size={12}/>}
                                    {Number(usuarioDetalle.role_id) === 1 ? 'Administrador' : 'Cliente'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                    <div className="p-3 bg-white rounded-xl text-tenri-500 shadow-sm"><Mail size={20} /></div>
                                    <div className="overflow-hidden"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Correo Electrónico</p><p className="text-sm font-bold text-gray-800 truncate" title={usuarioDetalle.email}>{usuarioDetalle.email}</p></div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                    <div className="p-3 bg-white rounded-xl text-tenri-500 shadow-sm"><Building size={20} /></div>
                                    <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Razón Social</p><p className="text-sm font-bold text-gray-800">{usuarioDetalle.company_name || 'No registrada'}</p></div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                    <div className="p-3 bg-white rounded-xl text-tenri-500 shadow-sm"><Calendar size={20} /></div>
                                    <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Fecha de Registro</p><p className="text-sm font-bold text-gray-800">{new Date(usuarioDetalle.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}</p></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-white">
                            <button
                                onClick={irAPerfilCompleto}
                                className="w-full py-4 bg-tenri-900 text-white rounded-2xl font-bold hover:bg-tenri-800 hover:-translate-y-1 transition-all shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] text-sm flex justify-center items-center gap-2"
                            >
                                <User size={18} /> Ver Perfil Detallado
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminTickets;