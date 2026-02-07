import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
    Plus, Search, Send, Paperclip, X, Clock, MessageSquare,
    MoreVertical, ArrowLeft, Layout, Tag, AlignLeft, Loader2,
    FileText, Image as ImageIcon
} from 'lucide-react';

const MisTickets = () => {
    const { user } = useAuth();
    // URL Base para las imágenes
    const BASE_URL = 'http://127.0.0.1:8000';

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

    // 2. POLLING
    useEffect(() => {
        const intervalo = setInterval(() => {
            if (!enviandoMensaje && !crearModalOpen) {
                cargarTickets(true);
            }
        }, 5000);
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

            const nuevoMsg = response.data;
            const ticketActualizado = {
                ...ticketActivo,
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

    const filtrados = tickets.filter(t =>
        t.subject?.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.ticket_code?.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) return <div className="h-screen flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Cargando...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 h-[calc(100vh-10px)] flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className={`flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 ${vistaMovil === 'chat' ? 'hidden md:flex' : 'flex'}`}>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mis Solicitudes</h1>
                    <p className="text-gray-500 text-xs mt-1">Gestiona tus incidencias</p>
                </div>
                <button onClick={() => setCrearModalOpen(true)} className="bg-atlas-900 text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:bg-atlas-800 transition-all flex items-center gap-2 text-sm">
                    <Plus size={18} /> Nuevo Ticket
                </button>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">

                {/* LISTA LATERAL */}
                <div className={`w-full md:w-[320px] flex flex-col gap-4 ${vistaMovil === 'lista' ? 'flex' : 'hidden md:flex'}`}>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                        <div className="relative mb-3 flex-shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-atlas-100 outline-none transition-all" />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {filtrados.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 text-sm">No hay tickets.</div>
                            ) : (
                                filtrados.map(t => (
                                    <div key={t.id} onClick={() => { setTicketActivo(t); setVistaMovil('chat'); }} className={`p-3 rounded-xl cursor-pointer transition-all border ${ticketActivo?.id === t.id ? 'bg-atlas-50 border-atlas-200' : 'bg-white border-transparent hover:bg-gray-50'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-gray-400 tracking-wide">{t.ticket_code}</span>
                                            <span className={`w-2 h-2 rounded-full ${t.status === 'nuevo' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        </div>
                                        <h3 className={`text-sm font-bold truncate ${ticketActivo?.id === t.id ? 'text-atlas-900' : 'text-gray-700'}`}>{t.subject}</h3>
                                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">{t.category}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* CHAT */}
                <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative ${vistaMovil === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                    {ticketActivo ? (
                        <>
                            {/* Header Chat */}
                            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-white flex-shrink-0">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <button onClick={() => setVistaMovil('lista')} className="md:hidden p-1 -ml-1 text-gray-500"><ArrowLeft size={20} /></button>
                                    <div className="min-w-0">
                                        <h2 className="text-base font-bold text-gray-900 truncate">{ticketActivo.subject}</h2>
                                        <p className="text-xs text-gray-400 uppercase font-medium">{ticketActivo.status} • {ticketActivo.ticket_code}</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-atlas-900"><MoreVertical size={20} /></button>
                            </div>

                            {/* Mensajes */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 custom-scrollbar flex flex-col-reverse">
                                {[...ticketActivo.messages].reverse().map((msg) => {
                                    const esMio = msg.user_id === user.id;
                                    return (
                                        <div key={msg.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] md:max-w-[70%] ${esMio ? 'items-end' : 'items-start'} flex flex-col`}>
                                                <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${esMio ? 'bg-atlas-900 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'}`}>
                                                    <p>{msg.message}</p>

                                                    {/* --- VISUALIZACIÓN DE ADJUNTOS BLINDADA --- */}
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className="mt-3 space-y-2">
                                                            {msg.attachments.map((file, index) => {
                                                                // LÓGICA DE SEGURIDAD: Detectar si es string antiguo o objeto nuevo
                                                                const filePath = typeof file === 'string' ? file : file.path;
                                                                const fileName = typeof file === 'string' ? 'Archivo Adjunto' : file.name;

                                                                // Si no hay path, saltamos este archivo para que no rompa la app
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
                                                                                {filePath.match(/\.(jpeg|jpg|gif|png)$/i) ? <ImageIcon size={20} /> : <FileText size={20} />}
                                                                            </div>
                                                                            <div className="flex-1 overflow-hidden">
                                                                                <p className="text-xs font-bold text-gray-700 truncate group-hover:text-atlas-900">{fileName}</p>
                                                                                <p className="text-[10px] text-gray-400">Clic para descargar</p>
                                                                            </div>
                                                                            {/* Preview solo si es imagen */}
                                                                            {filePath.match(/\.(jpeg|jpg|gif|png)$/i) && (
                                                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100">
                                                                                    <img src={`${BASE_URL}${filePath}`} alt="preview" className="w-full h-full object-cover" />
                                                                                </div>
                                                                            )}
                                                                        </a>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                <span className="text-[10px] text-gray-400 mt-1 px-1 flex items-center gap-1">
                                                    {!esMio && <span className="font-bold">{msg.user?.name}</span>}
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-gray-50 flex-shrink-0">
                                {adjuntos.length > 0 && (
                                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2 custom-scrollbar">
                                        {adjuntos.map((file, i) => (
                                            <div key={i} className="relative bg-gray-100 rounded-lg p-2 border border-gray-200 flex items-center gap-2 group min-w-[120px]">
                                                <div className="bg-white p-1 rounded">
                                                    {file.type.startsWith('image/') ? <ImageIcon size={14} className="text-blue-500" /> : <FileText size={14} className="text-gray-500" />}
                                                </div>
                                                <span className="text-[10px] truncate max-w-[80px] text-gray-600">{file.name}</span>
                                                <button onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 bg-white text-red-500 border border-red-100 rounded-full p-0.5 hover:bg-red-50 shadow-sm"><X size={10} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={enviarRespuesta} className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-2 pl-4 rounded-xl focus-within:ring-2 focus-within:ring-atlas-100 transition-all">
                                    <button type="button" onClick={() => fileInputRef.current.click()} className="text-gray-400 hover:text-atlas-600 p-1 hover:bg-white rounded-full transition-colors">
                                        <Paperclip size={20} />
                                    </button>

                                    <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />

                                    <input
                                        type="text"
                                        placeholder="Escribe un mensaje..."
                                        className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-700"
                                        value={mensaje}
                                        onChange={e => setMensaje(e.target.value)}
                                        disabled={enviandoMensaje}
                                    />

                                    <button type="submit" disabled={(!mensaje.trim() && adjuntos.length === 0) || enviandoMensaje} className="bg-atlas-900 text-white p-2 rounded-lg hover:bg-atlas-800 disabled:opacity-50 transition-all shadow-md">
                                        {enviandoMensaje ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                            <MessageSquare size={40} className="mb-2 opacity-20" />
                            <p className="text-sm">Selecciona una solicitud</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Crear Ticket */}
            {crearModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Nueva Solicitud</h2>
                            <button onClick={() => setCrearModalOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
                        </div>
                        <form onSubmit={handleCrearTicket} className="space-y-4">
                            <div className="relative group">
                                <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input required className="w-full pl-9 p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-100 outline-none text-sm" placeholder="Asunto" value={nuevoForm.asunto} onChange={e => setNuevoForm({ ...nuevoForm, asunto: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <Layout className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select className="w-full pl-9 p-3 bg-gray-50 rounded-xl text-sm outline-none appearance-none" value={nuevoForm.categoria} onChange={e => setNuevoForm({ ...nuevoForm, categoria: e.target.value })}>
                                        <option value="ERP">ERP</option><option value="Web">Web</option><option value="Soporte">Soporte</option><option value="Facturación">Facturación</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select className="w-full pl-9 p-3 bg-gray-50 rounded-xl text-sm outline-none appearance-none" value={nuevoForm.prioridad} onChange={e => setNuevoForm({ ...nuevoForm, prioridad: e.target.value })}>
                                        <option value="media">Media</option><option value="alta">Alta</option><option value="baja">Baja</option>
                                    </select>
                                </div>
                            </div>

                            <textarea required rows="4" className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-atlas-100 outline-none text-sm resize-none" placeholder="Detalle de la solicitud..." value={nuevoForm.mensaje} onChange={e => setNuevoForm({ ...nuevoForm, mensaje: e.target.value })} />

                            <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center gap-1 text-[10px] text-gray-400"><Clock size={12} /> Respuesta {'<'} 24h</div>
                                <button type="submit" className="bg-atlas-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-atlas-800 transition-colors shadow-lg">Crear Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisTickets;