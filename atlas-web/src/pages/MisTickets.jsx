import React, { useState, useRef } from 'react';
import {
    Plus, Search, Send, Paperclip, X, FileText,
    Clock, CheckCircle, AlertCircle, Sparkles, MessageSquare,
    ChevronRight, Shield, Layout, Tag, AlignLeft, Info
} from 'lucide-react';

const MIS_TICKETS_DATA = [
    {
        id: "TK-1025",
        asunto: "Error al generar reporte mensual",
        categoria: "ERP",
        estado: "nuevo",
        prioridad: "alta",
        fecha: "28/01/2026",
        mensajes: [
            { id: 1, emisor: "yo", texto: "Al intentar exportar el PDF del balance contable, el sistema lanza un error 500.", fecha: "10:15 AM", adjuntos: [] }
        ]
    }
];

const MisTickets = () => {
    const [tickets, setTickets] = useState(MIS_TICKETS_DATA);
    const [ticketActivo, setTicketActivo] = useState(MIS_TICKETS_DATA[0]);
    const [busqueda, setBusqueda] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [adjuntos, setAdjuntos] = useState([]);

    // Estados para el Modal
    const [crearModalOpen, setCrearModalOpen] = useState(false);
    const [nuevoForm, setNuevoForm] = useState({ asunto: '', categoria: 'ERP', prioridad: 'media', mensaje: '' });

    const fileRef = useRef(null);

    const handleCrearTicket = (e) => {
        e.preventDefault();
        const nuevoTicket = {
            id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
            asunto: nuevoForm.asunto,
            categoria: nuevoForm.categoria,
            estado: "nuevo",
            prioridad: nuevoForm.prioridad,
            fecha: "28/01/2026",
            mensajes: [
                { id: Date.now(), emisor: "yo", texto: nuevoForm.mensaje, fecha: "Recién", adjuntos: [] }
            ]
        };

        setTickets([nuevoTicket, ...tickets]);
        setTicketActivo(nuevoTicket);
        setCrearModalOpen(false);
        setNuevoForm({ asunto: '', categoria: 'ERP', prioridad: 'media', mensaje: '' });
    };

    const enviarRespuesta = (e) => {
        e.preventDefault();
        if (!mensaje.trim()) return;
        const nuevoMsg = { id: Date.now(), emisor: "yo", texto: mensaje, fecha: "Recién", adjuntos: [] };
        const actualizado = { ...ticketActivo, mensajes: [...ticketActivo.mensajes, nuevoMsg] };
        setTicketActivo(actualizado);
        setTickets(tickets.map(t => t.id === ticketActivo.id ? actualizado : t));
        setMensaje("");
    };

    const filtrados = tickets.filter(t =>
        t.asunto.toLowerCase().includes(busqueda.toLowerCase()) || t.id.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-10">

            {/* HEADER PRINCIPAL */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Mis Solicitudes</h1>
                    <p className="text-gray-500 mt-2 text-lg">Centro de soporte especializado para tus proyectos</p>
                </div>
                <button
                    onClick={() => setCrearModalOpen(true)}
                    className="bg-atlas-900 text-white px-8 py-4 rounded-[1.8rem] font-bold shadow-2xl shadow-atlas-900/20 hover:bg-atlas-800 flex items-center gap-3 transition-all active:scale-95 group"
                >
                    <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                    Abrir Nueva Solicitud
                </button>
            </div>

            <div className="h-[75vh] flex gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

                {/* LISTA DE TICKETS (Ajustada) */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 flex flex-col h-full overflow-hidden">
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text" placeholder="Buscar ticket..."
                                value={busqueda} onChange={e => setBusqueda(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-atlas-300 outline-none text-sm font-medium"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {filtrados.map(t => (
                                <div
                                    key={t.id} onClick={() => setTicketActivo(t)}
                                    className={`p-6 rounded-[2rem] cursor-pointer transition-all border-2 ${ticketActivo.id === t.id ? 'bg-atlas-50 border-atlas-200' : 'bg-white border-transparent hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-atlas-500 font-mono tracking-tighter">{t.id}</span>
                                        <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest ${t.estado === 'nuevo' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {t.estado}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-1">{t.asunto}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{t.categoria}</span>
                                        <span className="text-[10px] text-gray-400 font-medium">{t.fecha}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ÁREA DE CHAT (Consistente) */}
                <div className="hidden md:flex flex-1 flex-col bg-white rounded-[3rem] shadow-2xl shadow-gray-100/50 border border-gray-100 overflow-hidden relative isolate">
                    {ticketActivo ? (
                        <>
                            <div className="p-10 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-atlas-900 text-white flex items-center justify-center font-bold text-2xl shadow-xl">
                                        <MessageSquare size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 leading-none">{ticketActivo.asunto}</h2>
                                        <p className="text-sm text-gray-500 mt-2 font-medium">Gestión de {ticketActivo.categoria} • Ticket #{ticketActivo.id}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                {ticketActivo.mensajes.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.emisor === 'yo' ? 'justify-end' : 'justify-start'}`}>
                                        <div className="max-w-[75%]">
                                            <div className={`p-6 rounded-[2rem] shadow-sm text-sm leading-relaxed ${msg.emisor === 'yo'
                                                    ? 'bg-atlas-900 text-white rounded-tr-none'
                                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                                }`}>
                                                {msg.texto}
                                            </div>
                                            <p className={`text-[10px] mt-3 font-bold uppercase tracking-widest text-gray-400 ${msg.emisor === 'yo' ? 'text-right' : 'text-left'}`}>
                                                {msg.emisor === 'yo' ? 'Enviado por ti' : 'Soporte Atlas Digital'} • {msg.fecha}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-10 bg-white border-t border-gray-100">
                                <form onSubmit={enviarRespuesta} className="bg-gray-50 p-2 rounded-[2.5rem] border border-gray-100 flex items-end gap-3 focus-within:ring-4 focus-within:ring-atlas-50 transition-all">
                                    <button type="button" className="p-4 text-gray-400 hover:text-atlas-900 transition-colors"><Paperclip size={24} /></button>
                                    <textarea
                                        rows="1" placeholder="Escribe tu respuesta..."
                                        className="flex-1 bg-transparent border-0 outline-none py-4 text-base resize-none"
                                        value={mensaje} onChange={e => setMensaje(e.target.value)}
                                    />
                                    <button type="submit" className="bg-atlas-900 text-white p-5 rounded-[2rem] shadow-xl hover:bg-atlas-800 transition-all active:scale-95"><Send size={24} /></button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                            <Sparkles size={80} className="mb-6 opacity-20" />
                            <p className="text-lg font-bold">Selecciona una conversación</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL DE CREACIÓN "PREMIUM" --- */}
            {crearModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-3xl overflow-hidden animate-in zoom-in duration-300 flex flex-col md:flex-row h-auto max-h-[90vh]">

                        {/* Panel Lateral del Modal (Branding) */}
                        <div className="hidden md:flex md:w-1/3 bg-atlas-900 p-10 flex-col justify-between relative isolate">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-atlas-300 rounded-full blur-[80px] opacity-20 -z-10"></div>
                            <div>
                                <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6">
                                    <Sparkles size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4 leading-tight">Nueva Solicitud</h2>
                                <p className="text-atlas-200 text-sm leading-relaxed">
                                    Completa los detalles para que nuestro equipo técnico pueda asistirte a la brevedad.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-xs text-atlas-300">
                                    <Shield size={16} /> Datos Protegidos
                                </div>
                                <div className="flex items-center gap-3 text-xs text-atlas-300">
                                    <Clock size={16} /> Respuesta en &lt; 24h
                                </div>
                            </div>
                        </div>

                        {/* Formulario Principal */}
                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-8">
                                <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <Info size={14} /> Formulario Oficial
                                </span>
                                <button onClick={() => setCrearModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCrearTicket} className="space-y-6">
                                {/* Asunto */}
                                <div className="relative group">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Asunto de la solicitud</label>
                                    <div className="relative">
                                        <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-atlas-600 transition-colors" size={20} />
                                        <input
                                            type="text" required placeholder="¿En qué podemos ayudarte?"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-atlas-300 focus:bg-white rounded-[1.5rem] outline-none transition-all font-medium text-gray-800"
                                            value={nuevoForm.asunto} onChange={e => setNuevoForm({ ...nuevoForm, asunto: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Categoría y Prioridad en Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Servicio Afectado</label>
                                        <div className="relative">
                                            <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-atlas-600 transition-colors" size={20} />
                                            <select
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-atlas-300 focus:bg-white rounded-[1.5rem] outline-none appearance-none transition-all font-medium text-gray-800"
                                                value={nuevoForm.categoria} onChange={e => setNuevoForm({ ...nuevoForm, categoria: e.target.value })}
                                            >
                                                <option value="ERP">Sistema ERP</option>
                                                <option value="Web">Desarrollo Web</option>
                                                <option value="Facturación">Facturación</option>
                                                <option value="Soporte">Soporte Técnico</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Nivel de Urgencia</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-atlas-600 transition-colors" size={20} />
                                            <select
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-atlas-300 focus:bg-white rounded-[1.5rem] outline-none appearance-none transition-all font-medium text-gray-800"
                                                value={nuevoForm.prioridad} onChange={e => setNuevoForm({ ...nuevoForm, prioridad: e.target.value })}
                                            >
                                                <option value="baja">Informativo (Baja)</option>
                                                <option value="media">Necesario (Media)</option>
                                                <option value="alta">Urgente (Alta)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="relative group">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Descripción detallada</label>
                                    <textarea
                                        rows="5" required placeholder="Describe el problema paso a paso..."
                                        className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-atlas-300 focus:bg-white rounded-[2rem] outline-none transition-all font-medium text-gray-800 resize-none"
                                        value={nuevoForm.mensaje} onChange={e => setNuevoForm({ ...nuevoForm, mensaje: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-atlas-900 text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-atlas-900/40 hover:bg-atlas-800 transition-all flex justify-center items-center gap-3 active:scale-[0.98] group"
                                >
                                    Enviar Solicitud Técnica <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MisTickets;