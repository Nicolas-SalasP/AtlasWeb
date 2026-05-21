import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Ticket, CheckCircle, Clock, MessageSquare, ChevronRight, Loader2, AlertCircle, ArrowRight
} from 'lucide-react';

const STATUS_STYLES = {
    nuevo:              'bg-emerald-50 text-emerald-700 border-emerald-100',
    abierto:            'bg-blue-50 text-blue-700 border-blue-100',
    esperando_cliente:  'bg-amber-50 text-amber-700 border-amber-100',
    resuelto:           'bg-violet-50 text-violet-700 border-violet-100',
    cerrado:            'bg-gray-100 text-gray-600 border-gray-200',
};

const PRIORITY_STYLES = {
    critica: 'text-red-600 bg-red-50 border-red-100',
    alta:    'text-orange-600 bg-orange-50 border-orange-100',
    media:   'text-blue-600 bg-blue-50 border-blue-100',
    baja:    'text-gray-500 bg-gray-50 border-gray-100',
};

const MisTickets = ({ ticketsData, loading }) => {
    const navigate = useNavigate();
    const tickets = ticketsData?.tickets || [];
    const stats = ticketsData?.stats || { total: 0, open: 0, closed: 0 };

    if (loading) {
        return (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 flex items-center justify-center gap-2 text-tenri-900">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm font-medium">Cargando tickets...</span>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center gap-3">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Soporte técnico</h2>
                <button
                    onClick={() => navigate('/mis-tickets')}
                    className="text-xs md:text-sm font-bold text-tenri-700 hover:text-tenri-900 flex items-center gap-1 hover:bg-tenri-50 px-3 py-1.5 rounded-lg transition-colors group whitespace-nowrap"
                >
                    Ir al centro de ayuda
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <StatCard
                    value={stats.total}
                    label="Total"
                    icon={<Ticket size={12} />}
                    color="bg-tenri-50 text-tenri-700 border-tenri-100"
                />
                <StatCard
                    value={stats.open}
                    label="Abiertos"
                    icon={<Clock size={12} />}
                    color="bg-amber-50 text-amber-700 border-amber-100"
                />
                <StatCard
                    value={stats.closed}
                    label="Cerrados"
                    icon={<CheckCircle size={12} />}
                    color="bg-emerald-50 text-emerald-700 border-emerald-100"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-black text-gray-700 text-xs uppercase tracking-widest">Actividad reciente</h3>
                    <span className="text-[10px] text-gray-400 font-medium">{tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}</span>
                </div>

                {tickets.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="w-16 h-16 bg-tenri-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare size={24} className="text-tenri-700" />
                        </div>
                        <p className="text-sm font-bold text-gray-700 mb-1">Sin tickets aún</p>
                        <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">Cuando crees un ticket de soporte, aparecerá acá.</p>
                        <button
                            onClick={() => navigate('/mis-tickets')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-tenri-900 text-white rounded-xl text-sm font-bold hover:bg-tenri-800 transition-colors shadow-sm group"
                        >
                            Crear nuevo ticket
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {tickets.map((ticket) => {
                            const statusClass = STATUS_STYLES[ticket.status] || 'bg-gray-50 text-gray-500 border-gray-100';
                            const priorityClass = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.media;
                            const messagesCount = Number(ticket.messages_count ?? 0);

                            return (
                                <div
                                    key={ticket.id}
                                    onClick={() => navigate('/mis-tickets')}
                                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group flex items-center justify-between gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${statusClass}`}>
                                                {ticket.status_label || ticket.status}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-mono">{ticket.ticket_code}</span>
                                            <span className="text-[10px] text-gray-400">•</span>
                                            <span className="text-[10px] text-gray-400">{new Date(ticket.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</span>
                                            {messagesCount > 0 && (
                                                <span className="text-[10px] text-gray-500 font-bold flex items-center gap-0.5">
                                                    <MessageSquare size={9} /> {messagesCount}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-gray-900 truncate group-hover:text-tenri-700 transition-colors text-sm">
                                            {ticket.subject}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            {ticket.category_label && (
                                                <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {ticket.category_label}
                                                </span>
                                            )}
                                            {(ticket.priority === 'alta' || ticket.priority === 'critica') && (
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${priorityClass} flex items-center gap-1`}>
                                                    <AlertCircle size={9} />
                                                    {ticket.priority_label || ticket.priority}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-tenri-900 transition-colors shrink-0">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ value, label, icon, color }) => (
    <div className={`p-3 md:p-4 rounded-xl border flex flex-col items-center justify-center text-center ${color}`}>
        <span className="text-2xl md:text-3xl font-black mb-1">{value}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            {icon} {label}
        </span>
    </div>
);

export default MisTickets;
