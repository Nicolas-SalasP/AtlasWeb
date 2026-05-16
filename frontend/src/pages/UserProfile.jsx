import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { Toaster, toast } from 'react-hot-toast';
import {
    User, Lock, Package, CreditCard, Shield, CheckCircle, MessageSquare,
    LayoutDashboard, MapPin, Briefcase, ArrowUpRight, Sparkles
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';

import MiPerfil from '../components/perfil/MiPerfil';
import MiSeguridad from '../components/perfil/MiSeguridad';
import MisPedidos from '../components/perfil/MisPedidos';
import MisSuscripciones from '../components/perfil/MisSuscripciones';
import MisTickets from '../components/perfil/MisTickets';
import MisDirecciones from '../components/perfil/MisDirecciones';
import OrderDetailModal from '../components/perfil/OrderDetailModal';
import EmailChangeModal from '../components/perfil/EmailChangeModal';
import MisEmpresas from '../components/perfil/MisEmpresas';

const ERP_URL = 'https://erp.tenri.cl';

const getInitial = (name) => {
    if (typeof name === 'string' && name.length > 0) {
        return name.charAt(0).toUpperCase();
    }
    return '?';
};

const UserProfile = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || 'general');

    const [orders, setOrders] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [ticketsData, setTicketsData] = useState(null);

    const [loadingData, setLoadingData] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);

    useEffect(() => {
        const currentTab = searchParams.get('tab');
        if (currentTab) {
            setActiveTab(currentTab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user && user.id) {
            const fetchData = async () => {
                setLoadingData(true);
                try {
                    const [ordersRes, subRes, ticketRes] = await Promise.all([
                        api.get('/orders').catch(() => ({ data: [] })),
                        api.get('/profile/subscription').catch(() => ({ data: null })),
                        api.get('/profile/tickets-summary').catch(() => ({ data: null })),
                    ]);
                    setOrders(ordersRes.data || []);
                    setSubscription(subRes.data);
                    setTicketsData(ticketRes.data);
                } catch (error) {
                    console.error("Error cargando datos:", error);
                } finally {
                    setLoadingData(false);
                }
            };
            fetchData();
        }
    }, [user]);

    const changeTab = (tabId) => {
        setActiveTab(tabId);
        const next = new URLSearchParams(searchParams);
        next.set('tab', tabId);
        setSearchParams(next, { replace: true });
    };

    const menuItems = [
        { id: 'general',      icon: User,          label: 'Mi Perfil' },
        { id: 'addresses',    icon: MapPin,        label: 'Mis Direcciones' },
        { id: 'empresas',     icon: Briefcase,     label: 'Mis Empresas' },
        { id: 'security',     icon: Lock,          label: 'Seguridad' },
        { id: 'orders',       icon: Package,       label: 'Mis Pedidos' },
        { id: 'subscription', icon: CreditCard,    label: 'Suscripción ERP' },
        { id: 'tickets',      icon: MessageSquare, label: 'Mis Tickets' },
    ];

    const esAdmin = Number(user?.role_id) === 1;
    const tieneSuscripcion = subscription?.status === 'active';
    const puedeAccederERP = esAdmin || tieneSuscripcion;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto">

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-tenri-50 rounded-full filter blur-3xl opacity-50 transform translate-x-20 -translate-y-20 pointer-events-none"></div>

                    <div className="relative flex flex-col md:flex-row items-center gap-5 md:gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-tenri-900 to-tenri-700 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-tenri-900/20 shrink-0">
                            {getInitial(user?.name)}
                        </div>
                        <div className="text-center md:text-left flex-1 min-w-0">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-tenri-50 text-tenri-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-tenri-100 mb-2">
                                <Sparkles size={10} /> Mi cuenta
                            </span>
                            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 truncate">{user?.name || 'Usuario'}</h1>
                            <p className="text-gray-500 text-sm truncate">{user?.email}</p>
                            <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-100">
                                    <Shield size={11} /> Cuenta verificada
                                </span>
                                {tieneSuscripcion && (
                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-blue-100">
                                        <CheckCircle size={11} /> ERP Pro
                                    </span>
                                )}
                                {esAdmin && (
                                    <span className="px-2.5 py-1 bg-tenri-900 text-white rounded-full text-[10px] font-bold flex items-center gap-1">
                                        <Shield size={11} /> Admin
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
                            {esAdmin && (
                                <Link
                                    to="/admin"
                                    className="flex items-center justify-center gap-2 bg-tenri-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-tenri-800 transition-all shadow-lg shadow-tenri-900/20 group text-sm"
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Panel Admin</span>
                                </Link>
                            )}
                            {puedeAccederERP && (
                                <a
                                    href={ERP_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-tenri-300 text-gray-700 hover:text-tenri-900 px-5 py-3 rounded-xl font-bold transition-all text-sm group"
                                >
                                    <span>ERP</span>
                                    <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-3">
                        <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-28">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => changeTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all border-l-4 ${activeTab === item.id ? 'bg-tenri-50 text-tenri-900 border-tenri-900' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                                >
                                    <item.icon size={17} /> {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="md:col-span-9">
                        {activeTab === 'general'      && <MiPerfil user={user} onOpenEmailModal={() => setShowEmailModal(true)} />}
                        {activeTab === 'addresses'    && <MisDirecciones />}
                        {activeTab === 'empresas'     && <MisEmpresas />}
                        {activeTab === 'security'     && <MiSeguridad />}
                        {activeTab === 'orders'       && <MisPedidos orders={orders} loading={loadingData} onSelectOrder={setSelectedOrder} />}
                        {activeTab === 'subscription' && <MisSuscripciones subscription={subscription} loading={loadingData} />}
                        {activeTab === 'tickets'      && <MisTickets ticketsData={ticketsData} loading={loadingData} />}
                    </div>
                </div>
            </div>

            <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            <EmailChangeModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} onSuccess={() => toast.success('Correo actualizado')} />
        </div>
    );
};

export default UserProfile;
