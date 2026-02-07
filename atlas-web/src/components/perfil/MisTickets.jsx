import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Ticket, CheckCircle, Clock, AlertCircle, 
    MessageSquare, ChevronRight, Loader2 
} from 'lucide-react';

const MisTickets = ({ ticketsData, loading }) => {
    const navigate = useNavigate();
    const { tickets, stats } = ticketsData || { tickets: [], stats: { total: 0, open: 0, closed: 0 } };

    if (loading) {
        return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-atlas-900" size={32} /></div>;
    }

    // Helpers de estilo
    const getStatusStyles = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'in_progress': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'closed': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    const getStatusLabel = (status) => {
        const labels = { open: 'Abierto', in_progress: 'En Proceso', closed: 'Cerrado' };
        return labels[status] || status;
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Soporte Técnico</h2>
                <button 
                    onClick={() => navigate('/mis-tickets')}
                    className="text-sm font-bold text-atlas-900 hover:text-atlas-700 flex items-center gap-1"
                >
                    Ir al Centro de Ayuda <ChevronRight size={16} />
                </button>
            </div>

            {/* Tarjetas de Resumen (Stats) */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-blue-700 mb-1">{stats.total}</span>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide flex items-center gap-1">
                        <Ticket size={12} /> Total Tickets
                    </span>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-amber-700 mb-1">{stats.open}</span>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wide flex items-center gap-1">
                        <Clock size={12} /> En Proceso
                    </span>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-green-700 mb-1">{stats.closed}</span>
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wide flex items-center gap-1">
                        <CheckCircle size={12} /> Cerrados
                    </span>
                </div>
            </div>

            {/* Lista de Tickets Recientes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-700 text-sm">Actividad Reciente</h3>
                </div>

                {tickets.length === 0 ? (
                    <div className="p-10 text-center">
                        <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm">No tienes tickets de soporte recientes.</p>
                        <button 
                            onClick={() => navigate('/mis-tickets')}
                            className="mt-4 px-4 py-2 bg-atlas-900 text-white rounded-lg text-sm font-bold hover:bg-atlas-800 transition-colors"
                        >
                            Crear Nuevo Ticket
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {tickets.map((ticket) => (
                            <div 
                                key={ticket.id} 
                                onClick={() => navigate('/mis-tickets')} // Redirige a la página completa de tickets
                                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group flex items-center justify-between gap-4"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusStyles(ticket.status)}`}>
                                            {getStatusLabel(ticket.status)}
                                        </span>
                                        <span className="text-xs text-gray-400">#{ticket.id}</span>
                                        <span className="text-xs text-gray-400">• {new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 truncate group-hover:text-atlas-700 transition-colors">
                                        {ticket.subject}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                        {ticket.priority === 'high' && <span className="text-red-500 font-bold mr-1">Prioridad Alta •</span>}
                                        Clic para ver la conversación completa
                                    </p>
                                </div>
                                <div className="text-gray-300 group-hover:text-atlas-900 transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MisTickets;