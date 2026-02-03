import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
    Ticket, MessageSquare, Clock, CheckCircle,
    AlertCircle, Filter, Search, User, MoreVertical,
    Send, Paperclip, Image as ImageIcon, X, FileText,
    Download, Sparkles, Mail, Shield, Building, Calendar, Loader2
} from 'lucide-react';

const AdminTickets = () => {
    const { user: adminUser } = useAuth();
    // URL Base para las imágenes
    const BASE_URL = 'http://127.0.0.1:8000';

    // --- ESTADOS ---
    const [tickets, setTickets] = useState([]);
    const [ticketActivo, setTicketActivo] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- FILTROS Y CHAT ---
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [busqueda, setBusqueda] = useState("");
    const [nuevaRespuesta, setNuevaRespuesta] = useState("");
    const [adjuntos, setAdjuntos] = useState([]); 
    const [enviando, setEnviando] = useState(false);

    // --- MODALES Y REFS ---
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const fileInputRef = useRef(null);

    // 1. CARGA INICIAL
    useEffect(() => {
        cargarTickets();
    }, []);

    // 2. POLLING
    useEffect(() => {
        const intervalo = setInterval(() => {
            if (!enviando && !usuarioSeleccionado) {
                cargarTickets(true); 
            }
        }, 5000);
        return () => clearInterval(intervalo);
    }, [enviando, ticketActivo, usuarioSeleccionado]);

    // Función cargarTickets
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
            } else if (!silent && response.data.length > 0) {
                setTicketActivo(response.data[0]);
            }
        } catch (error) {
            console.error("Error cargando tickets:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // --- MANEJO DE ARCHIVOS ---
    const handleFileChange = (e) => {
        if (e.target.files) {
            setAdjuntos(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index) => {
        setAdjuntos(prev => prev.filter((_, i) => i !== index));
    };

    // --- ENVIAR MENSAJE ---
    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!nuevaRespuesta.trim() && adjuntos.length === 0) return;
        
        setEnviando(true);

        try {
            const formData = new FormData();
            formData.append('mensaje', nuevaRespuesta);
            
            adjuntos.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });

            const response = await api.post(`/tickets/${ticketActivo.id}/reply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

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

            if (ticketActivo.status === 'nuevo') {
                api.put(`/admin/tickets/${ticketActivo.id}/status`, { status: 'abierto' });
            }

        } catch (error) {
            console.error(error);
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
        } catch (error) {
            console.error(error);
        }
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

    if (loading) return <div className="h-screen flex items-center justify-center gap-2 text-atlas-900"><Loader2 className="animate-spin" /> Cargando Panel...</div>;

    return (
        <div className="h-[calc(100vh-80px)] flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-6 bg-gray-50/50 overflow-hidden">

            {/* 1. LISTA LATERAL */}
            <div className="w-full md:w-1/3 flex flex-col gap-4 h-full">
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
                        {ticketsFiltrados.map(t => (
                            <div key={t.id} onClick={() => setTicketActivo(t)} className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${ticketActivo?.id === t.id ? 'bg-atlas-50 border-atlas-200 shadow-md' : 'bg-white border-transparent hover:bg-gray-50'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-mono font-bold text-gray-400">{t.ticket_code}</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${t.priority === 'alta' ? 'bg-red-100 text-red-600' : t.priority === 'media' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{t.priority}</span>
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm truncate">{t.subject}</h3>
                                <div className="relative group w-fit mt-1">
                                    <button onClick={(e) => { e.stopPropagation(); setUsuarioSeleccionado(t.user); }} className="text-xs text-atlas-500 font-bold hover:underline cursor-pointer flex items-center gap-1"><User size={12} /> {t.user?.name}</button>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[10px] text-gray-400 font-medium">{t.category}</span>
                                    <span className={`w-2 h-2 rounded-full ${t.status === 'nuevo' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. ÁREA DE CONVERSACIÓN */}
            <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100/50 border border-gray-100 overflow-hidden relative isolate h-full">
                {ticketActivo ? (
                    <>
                        {/* Header Chat */}
                        <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div onClick={() => setUsuarioSeleccionado(ticketActivo.user)} className="w-12 h-12 rounded-2xl bg-atlas-900 text-white flex items-center justify-center font-bold text-xl shadow-lg cursor-pointer hover:scale-105 transition-transform">
                                    {ticketActivo.user?.name?.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 leading-none">{ticketActivo.subject}</h2>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><span onClick={() => setUsuarioSeleccionado(ticketActivo.user)} className="hover:text-atlas-900 cursor-pointer hover:underline">{ticketActivo.user?.name}</span> • {ticketActivo.category}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {ticketActivo.status !== 'cerrado' ? (
                                    <button onClick={() => cambiarEstado('cerrado')} className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-green-600 hover:border-green-200 transition-all" title="Marcar Resuelto"><CheckCircle size={20} /></button>
                                ) : (
                                    <button onClick={() => cambiarEstado('abierto')} className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all" title="Reabrir"><Clock size={20} /></button>
                                )}
                            </div>
                        </div>

                        {/* Mensajes */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-gray-50/30 flex flex-col-reverse">
                            {[...ticketActivo.messages].reverse().map((msg) => {
                                const esAdmin = msg.user_id === adminUser.id;

                                return (
                                    <div key={msg.id} className={`flex ${esAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] ${esAdmin ? 'order-1' : ''}`}>
                                            <div className={`p-5 rounded-[1.5rem] shadow-sm ${esAdmin ? 'bg-atlas-900 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                                                <p className="text-sm leading-relaxed">{msg.message}</p>

                                                {/* --- VISUALIZACIÓN ADJUNTOS BLINDADA --- */}
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {msg.attachments.map((file, index) => {
                                                            // SEGURIDAD: Detectar formato antiguo (string) vs nuevo (objeto)
                                                            const filePath = typeof file === 'string' ? file : file.path;
                                                            const fileName = typeof file === 'string' ? 'Archivo Adjunto' : file.name;
                                                            
                                                            if (!filePath) return null;

                                                            return (
                                                                <div key={index} className="rounded-lg overflow-hidden border border-gray-200 bg-white/50 hover:bg-white transition-colors">
                                                                    <a 
                                                                        href={`${BASE_URL}${filePath}`} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        download={fileName}
                                                                        className="flex items-center gap-3 p-3 group"
                                                                    >
                                                                        <div className="bg-gray-100 p-2 rounded-lg text-atlas-500 group-hover:bg-atlas-50 group-hover:text-atlas-600 transition-colors">
                                                                            {filePath.match(/\.(jpeg|jpg|gif|png)$/i) ? <ImageIcon size={20}/> : <FileText size={20}/>}
                                                                        </div>
                                                                        <div className="flex-1 overflow-hidden">
                                                                            <p className="text-xs font-bold text-gray-700 truncate group-hover:text-atlas-900">{fileName}</p>
                                                                            <p className="text-[10px] text-gray-400">Clic para descargar</p>
                                                                        </div>
                                                                        {filePath.match(/\.(jpeg|jpg|gif|png)$/i) && (
                                                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100">
                                                                                <img src={`${BASE_URL}${filePath}`} alt="preview" className="w-full h-full object-cover"/>
                                                                            </div>
                                                                        )}
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
                        <div className="p-8 bg-white border-t border-gray-100 relative z-20 flex-shrink-0">
                            {/* Preview Archivos */}
                            {adjuntos.length > 0 && (
                                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                                    {adjuntos.map((file, i) => (
                                        <div key={i} className="relative bg-gray-50 rounded-lg p-2 border border-gray-200 flex items-center gap-2 min-w-[100px]">
                                            <div className="bg-white p-1 rounded shadow-sm text-atlas-500">
                                                {file.type.startsWith('image/') ? <ImageIcon size={14}/> : <FileText size={14}/>}
                                            </div>
                                            <span className="text-[10px] font-medium text-gray-600 truncate max-w-[100px]">{file.name}</span>
                                            <button onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 bg-white text-red-500 border border-red-100 rounded-full p-0.5 hover:bg-red-50 shadow-sm"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={enviarMensaje} className="bg-gray-50 p-2 rounded-[2rem] border border-gray-100 flex items-end gap-2 focus-within:ring-2 focus-within:ring-atlas-200 transition-all">
                                <button type="button" onClick={() => fileInputRef.current.click()} className="p-4 text-gray-400 hover:text-atlas-900 transition-colors">
                                    <Paperclip size={22} />
                                </button>
                                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                <textarea rows="1" placeholder="Respuesta oficial..." className="flex-1 bg-transparent border-0 outline-none py-4 text-sm resize-none custom-scrollbar" value={nuevaRespuesta} onChange={(e) => setNuevaRespuesta(e.target.value)} disabled={enviando} />
                                <button type="submit" disabled={(!nuevaRespuesta.trim() && adjuntos.length === 0) || enviando} className="bg-atlas-900 text-white p-4 rounded-[1.5rem] shadow-lg hover:bg-atlas-800 transition-all flex items-center justify-center disabled:opacity-50">
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

            {/* MODAL USUARIO */}
            {usuarioSeleccionado && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setUsuarioSeleccionado(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="h-24 bg-gradient-to-br from-atlas-900 to-atlas-700 relative">
                            <button onClick={() => setUsuarioSeleccionado(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 p-1.5 rounded-full backdrop-blur-md transition-colors"><X size={18} /></button>
                        </div>
                        <div className="px-6 pb-6 -mt-10 relative">
                            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg mx-auto mb-4">
                                <div className="w-full h-full bg-atlas-100 rounded-xl flex items-center justify-center text-atlas-900 text-2xl font-black">{usuarioSeleccionado.name.charAt(0)}</div>
                            </div>
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">{usuarioSeleccionado.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">{usuarioSeleccionado.company_name || 'Particular'}</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wide">{usuarioSeleccionado.role_id === 1 ? 'Administrador' : 'Cliente'}</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><Mail size={16} /></div>
                                    <div className="overflow-hidden"><p className="text-xs text-gray-400 font-bold uppercase">Correo</p><p className="text-sm font-medium text-gray-800 truncate" title={usuarioSeleccionado.email}>{usuarioSeleccionado.email}</p></div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><Building size={16} /></div>
                                    <div><p className="text-xs text-gray-400 font-bold uppercase">Empresa</p><p className="text-sm font-medium text-gray-800">{usuarioSeleccionado.company_name || 'No registrada'}</p></div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><Calendar size={16} /></div>
                                    <div><p className="text-xs text-gray-400 font-bold uppercase">Miembro desde</p><p className="text-sm font-medium text-gray-800">{new Date(usuarioSeleccionado.created_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })}</p></div>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-3 bg-atlas-900 text-white rounded-xl font-bold hover:bg-atlas-800 transition-all shadow-lg shadow-atlas-900/20 active:scale-95 text-sm">Ver Perfil Completo</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTickets;