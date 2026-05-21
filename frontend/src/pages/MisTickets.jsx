import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
    Plus, Search, Send, Paperclip, X, Clock, MessageSquare,
    ArrowLeft, Layout, Tag, AlignLeft, Loader2,
    FileText, Image as ImageIcon, ShieldCheck, CheckCircle, AlertCircle
} from 'lucide-react';
import { BASE_URL } from '../api/constants';

const STATUS_DOT_COLORS = {
    nuevo:              'bg-emerald-500 shadow-emerald-200 shadow-md',
    abierto:            'bg-blue-500 shadow-blue-200 shadow-md',
    esperando_cliente:  'bg-amber-500 shadow-amber-200 shadow-md',
    resuelto:           'bg-violet-500 shadow-violet-200 shadow-md',
    cerrado:            'bg-gray-400',
};

const STATUS_PILL_COLORS = {
    nuevo:              'bg-emerald-50 text-emerald-700 border-emerald-100',
    abierto:            'bg-blue-50 text-blue-700 border-blue-100',
    esperando_cliente:  'bg-amber-50 text-amber-700 border-amber-100',
    resuelto:           'bg-violet-50 text-violet-700 border-violet-100',
    cerrado:            'bg-gray-100 text-gray-600 border-gray-200',
};

const CATEGORIAS = [
    { value: 'ERP',         label: 'ERP' },
    { value: 'Web',         label: 'Desarrollo Web' },
    { value: 'Soporte',     label: 'Soporte Técnico' },
    { value: 'Facturacion', label: 'Facturación / Pagos' },
];

const PRIORIDADES = [
    { value: 'baja',    label: 'Baja' },
    { value: 'media',   label: 'Media' },
    { value: 'alta',    label: 'Alta' },
    { value: 'critica', label: 'Crítica' },
];

const isTicketCerrado = (status) => status === 'cerrado' || status === 'resuelto';

const MisTickets = () => {
    const { user } = useAuth();

    const [tickets, setTickets] = useState([]);
    const [ticketActivo, setTicketActivo] = useState(null);
    const [loading, setLoading] = useState(true);

    const [busqueda, setBusqueda] = useState("");
    const [vistaMovil, setVistaMovil] = useState('lista');
    const [crearModalOpen, setCrearModalOpen] = useState(false);
    const [creando, setCreando] = useState(false);

    const [mensaje, setMensaje] = useState("");
    const [adjuntos, setAdjuntos] = useState([]);
    const [enviandoMensaje, setEnviandoMensaje] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState(null);

    const fileInputRef = useRef(null);
    const mensajesFinRef = useRef(null);

    const [nuevoForm, setNuevoForm] = useState({
        asunto: '',
        categoria: 'ERP',
        prioridad: 'media',
        mensaje: ''
    });

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
            if (!enviandoMensaje && !crearModalOpen) {
                cargarTickets(true);
            }
        }, 8000);
        return () => clearInterval(intervalo);
    }, [enviandoMensaje, ticketActivo, crearModalOpen]);

    const cargarTickets = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await api.get('/tickets');
            const data = response.data || [];
            setTickets(data);

            if (ticketActivo) {
                const actualizado = data.find(t => t.id === ticketActivo.id);
                if (actualizado && (actualizado.messages?.length !== ticketActivo.messages?.length || actualizado.status !== ticketActivo.status)) {
                    setTicketActivo(actualizado);
                }
            } else if (!silent && data.length > 0) {
                setTicketActivo(data[0]);
            }
        } catch (error) {
            console.error("Error cargando tickets:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const totalDespues = adjuntos.length + newFiles.length;
            if (totalDespues > 5) {
                setErrorEnvio('Máximo 5 archivos por mensaje');
                setTimeout(() => setErrorEnvio(null), 3000);
                return;
            }
            setAdjuntos(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index) => {
        setAdjuntos(prev => prev.filter((_, i) => i !== index));
    };

    const enviarRespuesta = async (e) => {
        e.preventDefault();
        if (!ticketActivo || isTicketCerrado(ticketActivo.status)) return;
        if (!mensaje.trim() && adjuntos.length === 0) return;

        setEnviandoMensaje(true);
        setErrorEnvio(null);
        try {
            const formData = new FormData();
            formData.append('mensaje', mensaje);
            adjuntos.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });

            const response = await api.post(`/tickets/${ticketActivo.id}/reply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const nuevoMsg = { ...response.data, user };
            const ticketActualizado = {
                ...ticketActivo,
                status: ticketActivo.status === 'esperando_cliente' ? 'abierto' : ticketActivo.status,
                messages: [...(ticketActivo.messages || []), nuevoMsg],
                messages_count: (ticketActivo.messages_count || 0) + 1,
            };

            setTicketActivo(ticketActualizado);
            setTickets(tickets.map(t => t.id === ticketActivo.id ? ticketActualizado : t));
            setMensaje("");
            setAdjuntos([]);
        } catch (error) {
            const msg = error.response?.data?.message || 'Error al enviar el mensaje';
            setErrorEnvio(msg);
            setTimeout(() => setErrorEnvio(null), 4000);
        } finally {
            setEnviandoMensaje(false);
            setTimeout(() => cargarTickets(true), 1000);
        }
    };

    const handleCrearTicket = async (e) => {
        e.preventDefault();
        setCreando(true);
        setErrorEnvio(null);
        try {
            const response = await api.post('/tickets', nuevoForm);
            setTickets([response.data, ...tickets]);
            setTicketActivo(response.data);
            setCrearModalOpen(false);
            setNuevoForm({ asunto: '', categoria: 'ERP', prioridad: 'media', mensaje: '' });
            setVistaMovil('chat');
        } catch (error) {
            const body = error.response?.data;
            const msg = body?.errors
                ? Object.values(body.errors).flat().join(' ')
                : (body?.message || 'Error al crear ticket');
            setErrorEnvio(msg);
        } finally {
            setCreando(false);
        }
    };

    const filtrados = tickets.filter(t =>
        t.subject?.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.ticket_code?.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) return (
        <div className="h-screen flex items-center justify-center gap-2">
            <Loader2 className="animate-spin text-tenri-900" />
            <span className="text-tenri-900 font-medium">Cargando centro de soporte...</span>
        </div>
    );

    const cerrado = ticketActivo && isTicketCerrado(ticketActivo.status);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 h-[calc(100vh-10px)] flex flex-col overflow-hidden">

            <div className={`flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 ${vistaMovil === 'chat' ? 'hidden md:flex' : 'flex'}`}>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mis solicitudes</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Gestiona y haz seguimiento a tus incidencias</p>
                </div>
                <button onClick={() => setCrearModalOpen(true)} className="bg-tenri-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-tenri-800 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm">
                    <Plus size={18} /> Nuevo ticket
                </button>
            </div>

            <div className="flex-1 flex gap-4 md:gap-6 min-h-0">

                <div className={`w-full md:w-[320px] flex flex-col gap-4 ${vistaMovil === 'lista' ? 'flex' : 'hidden md:flex'}`}>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                        <div className="relative mb-3 flex-shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar tickets..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-tenri-200 focus:bg-white outline-none transition-all"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {filtrados.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                                    <MessageSquare size={32} className="mb-2 opacity-30" />
                                    <span className="text-sm font-medium">{busqueda ? 'Sin coincidencias' : 'No hay tickets'}</span>
                                    {!busqueda && (
                                        <button onClick={() => setCrearModalOpen(true)} className="mt-3 text-xs font-bold text-tenri-700 hover:text-tenri-900">
                                            Crear el primero
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filtrados.map(t => {
                                    const dotClass = STATUS_DOT_COLORS[t.status] || 'bg-gray-300';
                                    const messagesCount = Number(t.messages_count ?? t.messages?.length ?? 0);
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => { setTicketActivo(t); setVistaMovil('chat'); }}
                                            className={`p-3.5 rounded-xl cursor-pointer transition-all border group ${ticketActivo?.id === t.id ? 'bg-white border-tenri-300 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase font-mono">{t.ticket_code}</span>
                                                <span className={`w-2.5 h-2.5 rounded-full border border-white ${dotClass}`}></span>
                                            </div>
                                            <h3 className={`text-sm font-bold truncate leading-tight ${ticketActivo?.id === t.id ? 'text-tenri-900' : 'text-gray-800 group-hover:text-tenri-700'}`}>
                                                {t.subject}
                                            </h3>
                                            <div className="flex justify-between mt-2 items-center">
                                                <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {t.category_label || t.category}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {messagesCount > 0 && (
                                                        <span className="text-[10px] text-gray-500 font-bold flex items-center gap-0.5">
                                                            <MessageSquare size={9} /> {messagesCount}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(t.created_at).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative isolate ${vistaMovil === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                    {ticketActivo ? (
                        <>
                            <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0 z-20">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <button
                                        onClick={() => setVistaMovil('lista')}
                                        className="md:hidden p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-full"
                                        aria-label="Volver a la lista"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h2 className="text-base md:text-lg font-black text-gray-900 truncate">{ticketActivo.subject}</h2>
                                            <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded hidden sm:inline-block">
                                                {ticketActivo.ticket_code}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${STATUS_PILL_COLORS[ticketActivo.status] || 'bg-gray-50 text-gray-500'}`}>
                                                {ticketActivo.status_label || ticketActivo.status}
                                            </span>
                                            {ticketActivo.category_label && (
                                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {ticketActivo.category_label}
                                                </span>
                                            )}
                                            {(ticketActivo.priority === 'alta' || ticketActivo.priority === 'critica') && (
                                                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-100 flex items-center gap-1">
                                                    <AlertCircle size={9} />
                                                    {ticketActivo.priority_label || ticketActivo.priority}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5 bg-gray-50/50 custom-scrollbar flex flex-col-reverse">
                                {[...(ticketActivo.messages || [])].reverse().map((msg, idx) => {
                                    const esMio = msg.user_id === user?.id;
                                    const esAdmin = Number(msg.user?.role_id) === 1;

                                    let adjuntosSeguros = [];
                                    try {
                                        adjuntosSeguros = typeof msg.attachments === 'string' ? JSON.parse(msg.attachments) : (msg.attachments || []);
                                    } catch (e) { adjuntosSeguros = []; }
                                    if (!Array.isArray(adjuntosSeguros)) adjuntosSeguros = [];

                                    return (
                                        <div key={msg.id || idx} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[90%] md:max-w-[75%] ${esMio ? 'order-1' : ''}`}>
                                                <div className={`px-4 py-2.5 md:px-5 md:py-3 min-w-[140px] rounded-2xl shadow-sm relative ${esMio ? 'bg-tenri-900 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>

                                                    {esAdmin && !esMio && (
                                                        <div className="absolute -top-3 left-4 bg-tenri-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap">
                                                            <ShieldCheck size={10} /> Tenri Staff
                                                        </div>
                                                    )}

                                                    <p className="text-sm leading-normal whitespace-pre-wrap">{msg.message}</p>

                                                    {adjuntosSeguros.length > 0 && (
                                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {adjuntosSeguros.map((file, index) => {
                                                                const filePath = typeof file === 'string' ? file : file.path;
                                                                const fileName = typeof file === 'string' ? 'Archivo adjunto' : (file.name || 'Adjunto');
                                                                if (!filePath) return null;
                                                                const esImagen = /\.(jpeg|jpg|gif|png|webp)$/i.test(filePath);
                                                                return (
                                                                    <a
                                                                        key={index}
                                                                        href={`${BASE_URL}${filePath}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        download={fileName}
                                                                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all hover:scale-[1.02] ${esMio ? 'border-white/20 bg-black/10 hover:bg-black/20' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
                                                                    >
                                                                        <div className={esMio ? 'text-white' : 'text-tenri-500'}>
                                                                            {esImagen ? <ImageIcon size={18} /> : <FileText size={18} />}
                                                                        </div>
                                                                        <div className="flex-1 overflow-hidden">
                                                                            <p className="text-xs font-bold truncate">{fileName}</p>
                                                                            <p className={`text-[10px] ${esMio ? 'text-tenri-200' : 'text-gray-400'}`}>Descargar</p>
                                                                        </div>
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                <p className={`text-[10px] mt-1 font-bold tracking-wide text-gray-400 ${esMio ? 'text-right pr-2' : 'text-left pl-2'}`}>
                                                    {!esMio && msg.user?.name && <span>{msg.user.name} • </span>}
                                                    {new Date(msg.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={mensajesFinRef} />
                            </div>

                            <div className="p-4 bg-white border-t border-gray-100 relative z-20">

                                {cerrado && (
                                    <div className="absolute inset-0 z-30 bg-white/85 backdrop-blur-sm flex items-center justify-center">
                                        <p className="text-sm font-bold text-gray-600 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
                                            <CheckCircle size={16} className="text-emerald-500" />
                                            {ticketActivo.status === 'resuelto' ? 'Este ticket está resuelto.' : 'Este ticket está cerrado.'}
                                        </p>
                                    </div>
                                )}

                                {errorEnvio && (
                                    <div className="mb-3 px-3 py-2 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-2">
                                        <AlertCircle size={14} /> {errorEnvio}
                                    </div>
                                )}

                                {adjuntos.length > 0 && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto custom-scrollbar pb-2">
                                        {adjuntos.map((file, i) => (
                                            <div key={i} className="relative bg-gray-50 text-gray-800 rounded-xl p-2.5 border border-gray-200 flex items-center gap-2 shrink-0 shadow-sm animate-in zoom-in-95">
                                                <div className="bg-white p-1.5 rounded-lg shadow-sm text-tenri-500">
                                                    {file.type?.startsWith('image/') ? <ImageIcon size={14} /> : <FileText size={14} />}
                                                </div>
                                                <span className="text-xs font-bold truncate max-w-[120px]">{file.name}</span>
                                                <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Quitar archivo">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={enviarRespuesta} className="flex items-end gap-2 bg-gray-50 rounded-2xl px-2 py-1 border border-gray-100 focus-within:bg-white focus-within:border-tenri-200 transition-all">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={enviandoMensaje || cerrado || adjuntos.length >= 5}
                                        className="p-2.5 text-gray-400 hover:text-tenri-900 hover:bg-tenri-50 rounded-full transition-colors shrink-0 disabled:opacity-50"
                                        aria-label="Adjuntar archivo"
                                    >
                                        <Paperclip size={20} />
                                    </button>

                                    <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx" />

                                    <textarea
                                        rows="1"
                                        placeholder="Escribe un mensaje para soporte..."
                                        className="flex-1 bg-transparent border-0 outline-none py-3 text-sm font-medium text-gray-700 resize-none max-h-32 custom-scrollbar placeholder:text-gray-400"
                                        value={mensaje}
                                        onChange={(e) => {
                                            setMensaje(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                        }}
                                        disabled={enviandoMensaje || cerrado}
                                    />

                                    <button
                                        type="submit"
                                        disabled={(!mensaje.trim() && adjuntos.length === 0) || enviandoMensaje || cerrado}
                                        className="bg-tenri-900 text-white p-3 rounded-full shadow-md hover:bg-tenri-800 transition-all shrink-0 disabled:opacity-50 flex items-center justify-center"
                                        aria-label="Enviar mensaje"
                                    >
                                        {enviandoMensaje ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={40} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-500 mb-1">Selecciona un ticket</h2>
                            <p className="text-sm text-gray-400 max-w-xs">
                                Elige una solicitud del panel lateral para ver el historial.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {crearModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setCrearModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">Nueva solicitud</h2>
                                <p className="text-sm text-gray-500 font-medium mt-0.5">Ingresá los detalles para ayudarte.</p>
                            </div>
                            <button onClick={() => setCrearModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors" aria-label="Cerrar">
                                <X size={18} />
                            </button>
                        </div>

                        {errorEnvio && (
                            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-2">
                                <AlertCircle size={14} /> {errorEnvio}
                            </div>
                        )}

                        <form onSubmit={handleCrearTicket} className="space-y-4">
                            <div className="relative group">
                                <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-tenri-900 transition-colors" size={16} />
                                <input
                                    required
                                    maxLength={255}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-tenri-300 outline-none text-sm font-medium transition-all"
                                    placeholder="Asunto principal"
                                    value={nuevoForm.asunto}
                                    onChange={e => setNuevoForm({ ...nuevoForm, asunto: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative group">
                                    <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-tenri-900 transition-colors" size={16} />
                                    <select
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-tenri-300 outline-none text-sm font-medium appearance-none cursor-pointer transition-all"
                                        value={nuevoForm.categoria}
                                        onChange={e => setNuevoForm({ ...nuevoForm, categoria: e.target.value })}
                                    >
                                        {CATEGORIAS.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative group">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-tenri-900 transition-colors" size={16} />
                                    <select
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-tenri-300 outline-none text-sm font-medium appearance-none cursor-pointer transition-all"
                                        value={nuevoForm.prioridad}
                                        onChange={e => setNuevoForm({ ...nuevoForm, prioridad: e.target.value })}
                                    >
                                        {PRIORIDADES.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <textarea
                                required
                                rows="5"
                                maxLength={10000}
                                className="w-full p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-tenri-300 outline-none text-sm font-medium resize-none custom-scrollbar transition-all"
                                placeholder="Describí detalladamente el problema o requerimiento..."
                                value={nuevoForm.mensaje}
                                onChange={e => setNuevoForm({ ...nuevoForm, mensaje: e.target.value })}
                            />

                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                    <Clock size={11} /> Respuesta {'<'} 24h
                                </div>
                                <button
                                    type="submit"
                                    disabled={creando}
                                    className="bg-tenri-900 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-tenri-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-70 group"
                                >
                                    {creando ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="group-hover:translate-x-0.5 transition-transform" />}
                                    Enviar solicitud
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
