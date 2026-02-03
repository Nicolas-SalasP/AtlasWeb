import React, { useState } from 'react';
import {
    Plus, Search, Send, Paperclip, X,
    Clock, MessageSquare, ChevronRight,
    MoreVertical, ArrowLeft, Layout, Tag, AlignLeft
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
    },
    {
        id: "TK-1024",
        asunto: "Consulta Facturación Enero",
        categoria: "Facturación",
        estado: "cerrado",
        prioridad: "baja",
        fecha: "15/01/2026",
        mensajes: [
            { id: 1, emisor: "yo", texto: "Hola, necesito la factura del mes pasado.", fecha: "09:00 AM", adjuntos: [] }
        ]
    }
];

const MisTickets = () => {
    const [tickets, setTickets] = useState(MIS_TICKETS_DATA);
    const [ticketActivo, setTicketActivo] = useState(MIS_TICKETS_DATA[0]);
    const [busqueda, setBusqueda] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [vistaMovil, setVistaMovil] = useState('lista');

    // Modal
    const [crearModalOpen, setCrearModalOpen] = useState(false);
    const [nuevoForm, setNuevoForm] = useState({ asunto: '', categoria: 'ERP', prioridad: 'media', mensaje: '' });

    const seleccionarTicket = (ticket) => {
        setTicketActivo(ticket);
        setVistaMovil('chat');
    };

    const handleCrearTicket = (e) => {
        e.preventDefault();
        const nuevoTicket = {
            id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
            asunto: nuevoForm.asunto,
            categoria: nuevoForm.categoria,
            estado: "nuevo",
            prioridad: nuevoForm.prioridad,
            fecha: "Hoy",
            mensajes: [
                { id: Date.now(), emisor: "yo", texto: nuevoForm.mensaje, fecha: "Recién", adjuntos: [] }
            ]
        };
        setTickets([nuevoTicket, ...tickets]);
        setTicketActivo(nuevoTicket);
        setCrearModalOpen(false);
        setNuevoForm({ asunto: '', categoria: 'ERP', prioridad: 'media', mensaje: '' });
        setVistaMovil('chat');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6 md:pt-32 md:pb-12 min-h-screen flex flex-col">

            {/* HEADER */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4 ${vistaMovil === 'chat' ? 'hidden md:flex' : 'flex'}`}>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Mis Solicitudes</h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">Gestiona tus incidencias y requerimientos</p>
                </div>
                <button
                    onClick={() => setCrearModalOpen(true)}
                    className="w-full md:w-auto bg-atlas-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-atlas-900/20 hover:bg-atlas-800 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
                >
                    <Plus size={20} /> Nuevo Ticket
                </button>
            </div>

            {/* CONTENEDOR PRINCIPAL CON PADDING PARA EVITAR CORTES DE SOMBRA */}
            <div className="flex-1 flex gap-8 overflow-visible relative h-[calc(100vh-200px)] md:h-[70vh] p-1">

                {/* --- LISTA LATERAL --- */}
                <div className={`w-full md:w-[350px] flex-col gap-4 ${vistaMovil === 'lista' ? 'flex' : 'hidden md:flex'}`}>
                    {/* SOMBRA SUAVE PERSONALIZADA AQUÍ */}
                    <div className="bg-white p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100/50 flex flex-col h-full overflow-hidden">
                        <div className="relative mb-4 px-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text" placeholder="Buscar..."
                                value={busqueda} onChange={e => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 hover:bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-atlas-100 outline-none text-sm text-gray-700 placeholder:text-gray-400 transition-all"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {filtrados.map(t => (
                                <div
                                    key={t.id} onClick={() => seleccionarTicket(t)}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${ticketActivo.id === t.id
                                            ? 'bg-atlas-50 border border-atlas-100 shadow-sm'
                                            : 'bg-transparent border border-transparent hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wide">{t.id}</span>
                                        <span className={`w-2 h-2 rounded-full ${t.estado === 'nuevo' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`}></span>
                                    </div>
                                    <h3 className={`text-sm font-bold mb-1 line-clamp-1 ${ticketActivo.id === t.id ? 'text-atlas-900' : 'text-gray-700'}`}>
                                        {t.asunto}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-gray-500 font-bold bg-white px-2 py-1 rounded-lg border border-gray-100 uppercase">
                                            {t.categoria}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">{t.fecha}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- ÁREA DE CHAT --- */}
                <div className={`flex-1 flex-col bg-white md:rounded-[2.5rem] rounded-none md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden relative isolate fixed inset-0 z-20 md:static ${vistaMovil === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                    {ticketActivo ? (
                        <>
                            {/* Header Chat */}
                            <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md z-10 sticky top-0 md:relative">
                                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                    <button
                                        onClick={() => setVistaMovil('lista')}
                                        className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>

                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex shrink-0 items-center justify-center text-white font-bold text-sm shadow-lg ${ticketActivo.estado === 'nuevo' ? 'bg-gradient-to-br from-atlas-800 to-atlas-900' : 'bg-gray-400'
                                        }`}>
                                        {ticketActivo.categoria.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base md:text-xl font-bold text-gray-900 leading-tight truncate">{ticketActivo.asunto}</h2>
                                        <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5 font-medium">
                                            {ticketActivo.estado} <span className="hidden md:inline">• ID {ticketActivo.id}</span>
                                        </p>
                                    </div>
                                </div>
                                <button className="text-gray-300 hover:text-atlas-900 transition-colors p-2 hover:bg-gray-50 rounded-full"><MoreVertical size={20} /></button>
                            </div>

                            {/* Mensajes */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 custom-scrollbar bg-[#FAFAFA]">
                                {ticketActivo.mensajes.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.emisor === 'yo' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] md:max-w-[70%] group ${msg.emisor === 'yo' ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
                                            <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${msg.emisor === 'yo'
                                                    ? 'bg-atlas-900 text-white rounded-br-none'
                                                    : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
                                                }`}>
                                                {msg.texto}
                                            </div>
                                            <span className="text-[10px] text-gray-300 font-bold mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {msg.fecha}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="p-3 md:p-6 bg-white border-t border-gray-50 md:border-t-0">
                                <form onSubmit={enviarRespuesta} className="flex items-center gap-2 bg-gray-50 border border-gray-100 p-2 pl-4 rounded-[1.5rem] focus-within:ring-2 focus-within:ring-atlas-100 focus-within:bg-white transition-all shadow-sm">
                                    <button type="button" className="text-gray-400 hover:text-atlas-600 transition-colors p-1 md:p-2 hover:bg-white rounded-full">
                                        <Paperclip size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Escribe un mensaje..."
                                        className="flex-1 bg-transparent border-0 outline-none text-sm py-2 text-gray-700 placeholder:text-gray-400"
                                        value={mensaje} onChange={e => setMensaje(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!mensaje.trim()}
                                        className="bg-atlas-900 text-white p-2.5 md:p-3 rounded-full hover:bg-atlas-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-90"
                                    >
                                        <Send size={16} className={mensaje.trim() ? "ml-0.5" : ""} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-[#FAFAFA]">
                            <MessageSquare size={50} className="mb-4 opacity-10" />
                            <p className="text-sm font-medium">Selecciona una conversación</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL CREAR TICKET (Responsivo) --- */}
            {crearModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        {/* (El contenido del modal es igual, asegúrate de mantener la corrección del símbolo < ) */}
                        <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-lg md:text-xl font-black text-gray-900">Nueva Solicitud</h2>
                            </div>
                            <button onClick={() => setCrearModalOpen(false)} className="text-gray-400 bg-white p-2 rounded-full border border-gray-100 shadow-sm hover:text-red-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCrearTicket} className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                            {/* ... Inputs del formulario igual que antes ... */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Asunto</label>
                                <div className="relative group">
                                    <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text" required placeholder="Ej: Falla en el sistema"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl outline-none text-sm font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-atlas-100 transition-all border border-transparent"
                                        value={nuevoForm.asunto} onChange={e => setNuevoForm({ ...nuevoForm, asunto: e.target.value })}
                                    />
                                </div>
                            </div>
                            {/* ... Resto de inputs ... */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Categoría</label>
                                    <div className="relative">
                                        <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <select
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl outline-none text-sm font-semibold text-gray-700 appearance-none focus:bg-white focus:ring-2 focus:ring-atlas-100 transition-all border border-transparent"
                                            value={nuevoForm.categoria} onChange={e => setNuevoForm({ ...nuevoForm, categoria: e.target.value })}
                                        >
                                            <option value="ERP">Sistema ERP</option>
                                            <option value="Web">Sitio Web</option>
                                            <option value="Facturación">Facturación</option>
                                            <option value="Soporte">Soporte Técnico</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Urgencia</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <select
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl outline-none text-sm font-semibold text-gray-700 appearance-none focus:bg-white focus:ring-2 focus:ring-atlas-100 transition-all border border-transparent"
                                            value={nuevoForm.prioridad} onChange={e => setNuevoForm({ ...nuevoForm, prioridad: e.target.value })}
                                        >
                                            <option value="baja">Baja</option>
                                            <option value="media">Media</option>
                                            <option value="alta">Alta</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Detalles</label>
                                <textarea
                                    rows="4" required placeholder="Describe tu problema..."
                                    className="w-full p-4 bg-gray-50 rounded-xl outline-none text-sm font-medium text-gray-800 resize-none focus:bg-white focus:ring-2 focus:ring-atlas-100 transition-all border border-transparent"
                                    value={nuevoForm.mensaje} onChange={e => setNuevoForm({ ...nuevoForm, mensaje: e.target.value })}
                                />
                            </div>

                            <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                                    <Clock size={12} /> Respuesta en {'<'} 24h
                                </div>
                                <button
                                    type="submit"
                                    className="w-full md:w-auto bg-atlas-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-atlas-800 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                                >
                                    Enviar Solicitud <ChevronRight size={16} />
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