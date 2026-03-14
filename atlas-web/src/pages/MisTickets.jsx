import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
    Plus, Search, Send, Paperclip, X, Clock, MessageSquare,
    MoreVertical, ArrowLeft, Layout, Tag, AlignLeft, Loader2,
    FileText, Image as ImageIcon, ShieldCheck, CheckCircle
} from 'lucide-react';
import { BASE_URL } from '../api/constants';

const MisTickets = () => {
    const { user } = useAuth();

    // --- ESTADOS DE DATOS ---
    const [tickets, setTickets] = useState([]);
    const [ticketActivo, setTicketActivo] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS DE UI ---
    const [busqueda, setBusqueda] = useState("");
    const [vistaMovil, setVistaMovil] = useState('lista');
    const [crearModalOpen, setCrearModalOpen] = useState(false);

    // --- ESTADOS DEL CHAT ---
    const [mensaje, setMensaje] = useState("");
    const [adjuntos, setAdjuntos] = useState([]);
    const [enviandoMensaje, setEnviandoMensaje] = useState(false);

    const fileInputRef = useRef(null);
    const mensajesFinRef = useRef(null); // Ref para auto-scroll

    // Formulario Nuevo Ticket
    const [nuevoForm, setNuevoForm] = useState({
        asunto: '',
        categoria: 'ERP',
        prioridad: 'media',
        mensaje: ''
    });

    // 1. CARGA INICIAL
    useEffect(() => {
        cargarTickets();
    }, []);

    // 2. AUTO-SCROLL EN CHAT
    useEffect(() => {
        if (ticketActivo && mensajesFinRef.current) {
            mensajesFinRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [ticketActivo?.messages]);

    // 3. POLLING
    useEffect(() => {
        const intervalo = setInterval(() => {
            if (!enviandoMensaje && !crearModalOpen) {
                cargarTickets(true);
            }
        }, 8000); // Polling relajado a 8 segundos
        return () => clearInterval(intervalo);
    }, [enviandoMensaje, ticketActivo, crearModalOpen]);

    const cargarTickets = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get('/tickets');
            setTickets(response.data);

            if (ticketActivo) {
                const actualizado = response.data.find(t => t.id === ticketActivo.id);
                if (actualizado && actualizado.messages.length !== ticketActivo.messages.length) {
                    setTicketActivo(actualizado);
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

    // --- ENVIAR RESPUESTA ---
    const enviarRespuesta = async (e) => {
        e.preventDefault();
        if (!mensaje.trim() && adjuntos.length === 0) return;

        setEnviandoMensaje(true);
        try {
            const formData = new FormData();
            formData.append('mensaje', mensaje);

            adjuntos.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });

            const response = await api.post(`/tickets/${ticketActivo.id}/reply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Forzar inyección del usuario actual para la UI local
            const nuevoMsg = { ...response.data, user };

            const ticketActualizado = {
                ...ticketActivo,
                status: 'abierto', // Al responder, asumimos que sigue abierto
                messages: [...ticketActivo.messages, nuevoMsg]
            };

            setTicketActivo(ticketActualizado);
            setTickets(tickets.map(t => t.id === ticketActivo.id ? ticketActualizado : t));

            setMensaje("");
            setAdjuntos([]);

        } catch (error) {
            console.error("Error enviando mensaje:", error);
        } finally {
            setEnviandoMensaje(false);
            setTimeout(() => cargarTickets(true), 1000);
        }
    };

    const handleCrearTicket = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/tickets', nuevoForm);
            setTickets([response.data, ...tickets]);
            setTicketActivo(response.data);
            setCrearModalOpen(false);
            setNuevoForm({ asunto: '', categoria: 'ERP', prioridad: 'media', mensaje: '' });
            setVistaMovil('chat');
        } catch (error) {
            console.error("Error creando ticket:", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'nuevo': return 'bg-emerald-500 shadow-emerald-200 shadow-md';
            case 'abierto': return 'bg-blue-500 shadow-blue-200 shadow-md';
            case 'cerrado': return 'bg-gray-400';
            default: return 'bg-gray-300';
        }
    };

    const filtrados = tickets.filter(t =>
        t.subject?.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.ticket_code?.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) return <div className="h-screen flex items-center justify-center gap-2"><Loader2 className="animate-spin text-atlas-900" /> <span className="text-atlas-900 font-medium">Cargando Centro de Soporte...</span></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 h-[calc(100vh-10px)] flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className={`flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 ${vistaMovil === 'chat' ? 'hidden md:flex' : 'flex'}`}>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mis Solicitudes</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Gestiona y haz seguimiento a tus incidencias</p>
                </div>
                <button onClick={() => setCrearModalOpen(true)} className="bg-atlas-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-atlas-800 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm">
                    <Plus size={18} /> Nuevo Ticket
                </button>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">

                {/* LISTA LATERAL */}
                <div className={`w-full md:w-[320px] flex flex-col gap-4 ${vistaMovil === 'lista' ? 'flex' : 'hidden md:flex'}`}>
                    <div className="bg-white p-4 rounded-[1.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col h-full overflow-hidden">
                        <div className="relative mb-3 flex-shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar tickets..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-atlas-200 focus:bg-white outline-none transition-all"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {filtrados.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                                    <CheckCircle size={32} className="mb-2 opacity-30 text-emerald-500" />
                                    <span className="text-sm font-medium">No hay tickets.</span>
                                </div>
                            ) : (
                                filtrados.map(t => (
                                    <div key={t.id} onClick={() => { setTicketActivo(t); setVistaMovil('chat'); }} className={`p-4 rounded-2xl cursor-pointer transition-all border group ${ticketActivo?.id === t.id ? 'bg-white border-atlas-300 shadow-md scale-[1.02]' : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{t.ticket_code}</span>
                                            <span className={`w-2.5 h-2.5 rounded-full border border-white ${getStatusColor(t.status)}`}></span>
                                        </div>
                                        <h3 className={`text-sm font-bold truncate leading-tight ${ticketActivo?.id === t.id ? 'text-atlas-900' : 'text-gray-800 group-hover:text-atlas-700'}`}>{t.subject}</h3>
                                        <div className="flex justify-between mt-2 items-center">
                                            <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-block">{t.category}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">{new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* CHAT DEL TICKET */}
                <div className={`flex-1 flex flex-col bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden relative isolate ${vistaMovil === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                    {ticketActivo ? (
                        <>
                            {/* Header Chat */}
                            <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0 z-20 shadow-sm">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <button onClick={() => setVistaMovil('lista')} className="md:hidden p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-full"><ArrowLeft size={20} /></button>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h2 className="text-base md:text-lg font-black text-gray-900 truncate">{ticketActivo.subject}</h2>
                                            <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded hidden sm:block">{ticketActivo.ticket_code}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${getStatusColor(ticketActivo.status)}`}></span>
                                            <span className="uppercase tracking-wide">{ticketActivo.status}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Mensajes */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/50 custom-scrollbar flex flex-col-reverse">
                                {[...ticketActivo.messages].reverse().map((msg, idx) => {
                                    const esMio = msg.user_id === user.id;
                                    const esAdmin = Number(msg.user?.role_id) === 1;

                                    return (
                                        <div key={msg.id || idx} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[90%] md:max-w-[75%] ${esMio ? 'order-1' : ''}`}>
                                                <div className={`px-4 py-2.5 md:px-5 md:py-3 min-w-[140px] rounded-[1.5rem] shadow-sm relative ${esMio ? 'bg-atlas-900 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>

                                                    {/* Etiqueta de Staff si es un Admin */}
                                                    {esAdmin && !esMio && (
                                                        <div className="absolute -top-3 left-4 bg-atlas-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap">
                                                            <ShieldCheck size={10} /> Atlas Staff
                                                        </div>
                                                    )}

                                                    <p className="text-sm leading-normal whitespace-pre-wrap">{msg.message}</p>

                                                    {/* Visualización de Adjuntos */}
                                                    {msg.attachments && msg.attachments.length > 0 && (
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
                                                                        <a key={index} href={`${BASE_URL}${filePath}`} target="_blank" rel="noopener noreferrer" download={fileName} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all hover:scale-[1.02] ${esMio ? 'border-white/20 bg-black/10 hover:bg-black/20' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                                                                            <div className={`${esMio ? 'text-white' : 'text-atlas-500'}`}>
                                                                                {filePath.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? <ImageIcon size={20} /> : <FileText size={20} />}
                                                                            </div>
                                                                            <div className="flex-1 overflow-hidden">
                                                                                <p className="text-xs font-bold truncate">{fileName}</p>
                                                                                <p className={`text-[10px] ${esMio ? 'text-atlas-200' : 'text-gray-400'}`}>Descargar</p>
                                                                            </div>
                                                                        </a>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>

                                                <p className={`text-[10px] mt-1 font-bold tracking-wide text-gray-400 ${esMio ? 'text-right pr-2' : 'text-left pl-2'}`}>
                                                    {!esMio && msg.user?.name + ' • '}
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={mensajesFinRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-gray-100 relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">

                                {/* Overlay Ticket Cerrado */}
                                {ticketActivo.status === 'cerrado' && (
                                    <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                        <p className="text-sm font-bold text-gray-500 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
                                            <CheckCircle size={16} className="text-green-500" />
                                            Este caso ha sido resuelto y cerrado.
                                        </p>
                                    </div>
                                )}

                                {adjuntos.length > 0 && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto custom-scrollbar pb-2">
                                        {adjuntos.map((file, i) => (
                                            <div key={i} className="relative bg-gray-50 text-gray-800 rounded-xl p-2.5 border border-gray-200 flex items-center gap-2 shrink-0 shadow-sm animate-in zoom-in-95">
                                                <div className="bg-white p-1.5 rounded-lg shadow-sm text-atlas-500">{file.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}</div>
                                                <span className="text-xs font-bold truncate max-w-[120px]">{file.name}</span>
                                                <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-transform hover:scale-110"><X size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={enviarRespuesta} className="bg-gray-50 p-2 md:p-2.5 rounded-3xl border border-gray-200 flex items-end gap-3 focus-within:ring-4 focus-within:ring-atlas-100 focus-within:border-atlas-300 transition-all shadow-inner">
                                    <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 text-gray-400 hover:text-atlas-900 hover:bg-white rounded-full transition-all shrink-0">
                                        <Paperclip size={22} />
                                    </button>

                                    <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />

                                    <textarea
                                        rows="1"
                                        placeholder="Escribe un mensaje para soporte..."
                                        className="flex-1 bg-transparent border-0 outline-none py-3 md:py-4 text-sm md:text-base font-medium text-gray-700 resize-none max-h-32 custom-scrollbar placeholder:text-gray-400"
                                        value={mensaje}
                                        onChange={(e) => {
                                            setMensaje(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                        }}
                                        disabled={enviandoMensaje}
                                    />

                                    <button type="submit" disabled={(!mensaje.trim() && adjuntos.length === 0) || enviandoMensaje} className="bg-atlas-900 text-white p-3.5 rounded-full shadow-lg hover:bg-atlas-800 hover:scale-105 transition-all shrink-0 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center">
                                        {enviandoMensaje ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={48} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-400 mb-1">Selecciona un ticket</h2>
                            <p className="text-sm text-gray-400 max-w-xs">Elige una solicitud del panel lateral para ver el historial y comunicarte con el equipo técnico.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL CREAR TICKET (Mejorado) */}
            {crearModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 leading-tight">Nueva Solicitud</h2>
                                <p className="text-sm text-gray-500 font-medium">Ingresa los detalles para ayudarte.</p>
                            </div>
                            <button onClick={() => setCrearModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCrearTicket} className="space-y-4">
                            <div className="relative group">
                                <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-atlas-900 transition-colors" size={18} />
                                <input required className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-300 outline-none text-sm font-medium transition-all" placeholder="Asunto principal" value={nuevoForm.asunto} onChange={e => setNuevoForm({ ...nuevoForm, asunto: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative group">
                                    <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-atlas-900 transition-colors" size={18} />
                                    <select className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-300 outline-none text-sm font-medium appearance-none cursor-pointer transition-all" value={nuevoForm.categoria} onChange={e => setNuevoForm({ ...nuevoForm, categoria: e.target.value })}>
                                        <option value="ERP">ERP</option>
                                        <option value="Web">Desarrollo Web</option>
                                        <option value="Soporte">Soporte Técnico</option>
                                        <option value="Facturación">Facturación / Pagos</option>
                                    </select>
                                </div>
                                <div className="relative group">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-atlas-900 transition-colors" size={18} />
                                    <select className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-300 outline-none text-sm font-medium appearance-none cursor-pointer transition-all" value={nuevoForm.prioridad} onChange={e => setNuevoForm({ ...nuevoForm, prioridad: e.target.value })}>
                                        <option value="baja">Baja</option>
                                        <option value="media">Media</option>
                                        <option value="alta">Alta</option>
                                    </select>
                                </div>
                            </div>

                            <textarea required rows="5" className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-300 outline-none text-sm font-medium resize-none custom-scrollbar transition-all" placeholder="Describe detalladamente el problema o requerimiento..." value={nuevoForm.mensaje} onChange={e => setNuevoForm({ ...nuevoForm, mensaje: e.target.value })} />

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Clock size={14} /> Respuesta estimada {'<'} 24h
                                </div>
                                <button type="submit" className="bg-atlas-900 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-atlas-800 hover:-translate-y-0.5 transition-all shadow-lg flex items-center gap-2">
                                    <Send size={16} /> Enviar Solicitud
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisTickets;