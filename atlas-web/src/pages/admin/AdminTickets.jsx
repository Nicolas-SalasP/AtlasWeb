import React, { useState, useRef } from 'react';
import {
    Ticket, MessageSquare, Clock, CheckCircle,
    AlertCircle, Filter, Search, User, MoreVertical,
    Send, Paperclip, Image as ImageIcon, X, FileText, Download, Sparkles, Mail, Shield
} from 'lucide-react';

// MOCK DATA: Incluimos datos de tus proyectos reales
const INITIAL_TICKETS = [
    {
        id: "TK-1025",
        usuario: "Nicolas Salas",
        email: "nicolas@atlas.cl",
        rol: "Admin / Desarrollador",
        asunto: "Error al generar reporte mensual",
        categoria: "ERP",
        prioridad: "alta",
        estado: "nuevo",
        fecha: "28/01/2026",
        mensajes: [
            { id: 1, emisor: "cliente", texto: "Al intentar exportar el PDF del balance contable, el sistema lanza un error 500.", fecha: "10:15 AM", adjuntos: [] }
        ]
    },
    {
        id: "TK-1024",
        usuario: "Insuban.cl",
        email: "soporte@insuban.cl",
        rol: "Cliente Empresa",
        asunto: "Actualización de certificados SSL",
        categoria: "Web",
        prioridad: "media",
        estado: "en proceso",
        fecha: "27/01/2026",
        mensajes: [
            { id: 1, emisor: "cliente", texto: "Necesitamos renovar el SSL del sitio principal.", fecha: "Yesterday", adjuntos: ["cert_config.txt"] }
        ]
    },
    {
        id: "TK-1023",
        usuario: "Tienda Tsuki",
        email: "ventas@tsuki.cl",
        rol: "Cliente Pro",
        asunto: "Cambio de Boleta a Factura",
        categoria: "Facturación",
        prioridad: "baja",
        estado: "cerrado",
        fecha: "25/01/2026",
        mensajes: [
            { id: 1, emisor: "cliente", texto: "Hola, por error pedí boleta. ¿Podrían anularla y emitir factura?", fecha: "25/01/2026", adjuntos: [] }
        ]
    }
];

const AdminTickets = () => {
    const [tickets, setTickets] = useState(INITIAL_TICKETS);
    const [ticketActivo, setTicketActivo] = useState(INITIAL_TICKETS[0]);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [busqueda, setBusqueda] = useState(""); // <--- NUEVO: Estado para la búsqueda
    const [nuevaRespuesta, setNuevaRespuesta] = useState("");
    const [adjuntos, setAdjuntos] = useState([]);
    const fileInputRef = useRef(null);

    // --- LÓGICA DE BÚSQUEDA Y FILTRADO COMBINADO ---
    const ticketsFiltrados = tickets.filter(t => {
        // 1. Filtrar por estado (pestañas)
        const coincideEstado = filtroEstado === 'todos' ? true : t.estado === filtroEstado;

        // 2. Filtrar por texto (Buscador)
        const query = busqueda.toLowerCase();
        const coincideBusqueda =
            t.usuario.toLowerCase().includes(query) ||
            t.asunto.toLowerCase().includes(query) ||
            t.categoria.toLowerCase().includes(query) ||
            t.id.toLowerCase().includes(query);

        return coincideEstado && coincideBusqueda;
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdjuntos(prev => [...prev, { name: file.name, preview: reader.result, type: file.type }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const enviarMensaje = (e) => {
        e.preventDefault();
        if (!nuevaRespuesta.trim() && adjuntos.length === 0) return;

        const nuevoMsg = {
            id: Date.now(),
            emisor: "admin",
            texto: nuevaRespuesta,
            fecha: "Ahora",
            adjuntos: adjuntos.map(a => a.name)
        };

        const ticketActualizado = {
            ...ticketActivo,
            mensajes: [...ticketActivo.mensajes, nuevoMsg],
            estado: "en proceso"
        };

        setTicketActivo(ticketActualizado);
        setTickets(tickets.map(t => t.id === ticketActivo.id ? ticketActualizado : t));
        setNuevaRespuesta("");
        setAdjuntos([]);
    };

    return (
        <div className="h-[calc(100vh-120px)] flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. LISTA LATERAL */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Tickets</h2>
                        <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
                            {['todos', 'nuevo', 'cerrado'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFiltroEstado(f)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${filtroEstado === f ? 'bg-atlas-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* BARRA DE BÚSQUEDA FUNCIONAL */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, asunto o categoría..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-atlas-300 outline-none text-sm transition-all"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {ticketsFiltrados.map(t => (
                            <div
                                key={t.id}
                                onClick={() => setTicketActivo(t)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${ticketActivo.id === t.id
                                        ? 'bg-atlas-50 border-atlas-200'
                                        : 'bg-white border-transparent hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-mono font-bold text-gray-400">{t.id}</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${t.prioridad === 'alta' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {t.prioridad}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm truncate">{t.asunto}</h3>

                                {/* REQUERIMIENTO: HOVER SOBRE EL NOMBRE */}
                                <div className="relative group w-fit mt-1">
                                    <p className="text-xs text-atlas-500 font-bold hover:underline cursor-help">
                                        {t.usuario}
                                    </p>

                                    {/* TOOLTIP INFORMATIVO */}
                                    <div className="absolute left-0 bottom-full mb-2 w-48 bg-atlas-900 text-white p-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 transform translate-y-2 group-hover:translate-y-0">
                                        <p className="text-[10px] font-bold text-atlas-300 uppercase mb-1 flex items-center gap-1"><Shield size={10} /> {t.rol}</p>
                                        <p className="text-xs font-medium flex items-center gap-2 mb-1"><Mail size={12} /> {t.email}</p>
                                        <p className="text-[9px] text-gray-400">Cliente desde: 2025</p>
                                        {/* Triángulo del tooltip */}
                                        <div className="absolute top-full left-4 border-8 border-transparent border-t-atlas-900"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {ticketsFiltrados.length === 0 && (
                            <p className="text-center text-gray-400 text-sm mt-10">No se encontraron resultados.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. ÁREA DE CONVERSACIÓN */}
            <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100/50 border border-gray-100 overflow-hidden relative isolate">

                {/* Header */}
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-atlas-900 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                            {ticketActivo.usuario.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-none">{ticketActivo.asunto}</h2>
                            <p className="text-sm text-gray-500 mt-1">{ticketActivo.usuario} • {ticketActivo.categoria}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-green-600 transition-all" title="Marcar como Resuelto">
                            <CheckCircle size={20} />
                        </button>
                    </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-gray-50/30">
                    {ticketActivo.mensajes.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.emisor === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${msg.emisor === 'admin' ? 'order-1' : ''}`}>
                                <div className={`p-5 rounded-[1.5rem] shadow-sm ${msg.emisor === 'admin'
                                        ? 'bg-atlas-900 text-white rounded-tr-none'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.texto}</p>

                                    {/* Visualización de adjuntos en el chat */}
                                    {msg.adjuntos && msg.adjuntos.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                            {msg.adjuntos.map((file, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-black/10 p-2 rounded-lg text-[10px]">
                                                    <FileText size={14} /> {file}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest text-gray-400 ${msg.emisor === 'admin' ? 'text-right' : 'text-left'}`}>
                                    {msg.fecha}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input con adjuntos */}
                <div className="p-8 bg-white border-t border-gray-100">
                    {adjuntos.length > 0 && (
                        <div className="flex gap-3 mb-4 animate-in slide-in-from-bottom-2">
                            {adjuntos.map((adj, i) => (
                                <div key={i} className="relative w-16 h-16 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
                                    {adj.type.startsWith('image/') ? (
                                        <img src={adj.preview} className="w-full h-full object-cover" alt="prev" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><FileText size={20} /></div>
                                    )}
                                    <button
                                        onClick={() => setAdjuntos(adjuntos.filter((_, idx) => idx !== i))}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full shadow-lg"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={enviarMensaje} className="bg-gray-50 p-2 rounded-[2rem] border border-gray-100 flex items-end gap-2 focus-within:ring-2 focus-within:ring-atlas-200 transition-all">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="p-4 text-gray-400 hover:text-atlas-900 transition-colors"
                        >
                            <Paperclip size={22} />
                        </button>
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <textarea
                            rows="1"
                            placeholder="Escribe una respuesta oficial de Atlas..."
                            className="flex-1 bg-transparent border-0 outline-none py-4 text-sm resize-none custom-scrollbar"
                            value={nuevaRespuesta}
                            onChange={(e) => setNuevaRespuesta(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-atlas-900 text-white p-4 rounded-[1.5rem] shadow-lg hover:bg-atlas-800 transition-all flex items-center justify-center"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>

                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Sparkles size={200} className="text-atlas-900" />
                </div>
            </div>

        </div>
    );
};

export default AdminTickets;