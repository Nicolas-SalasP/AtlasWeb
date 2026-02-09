import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { Toaster, toast } from 'react-hot-toast';
import { User, Lock, Package, CreditCard, Shield, CheckCircle, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';

import MiPerfil from '../components/perfil/MiPerfil';
import MiSeguridad from '../components/perfil/MiSeguridad';
import MisPedidos from '../components/perfil/MisPedidos';
import MisSuscripciones from '../components/perfil/MisSuscripciones';
import MisTickets from '../components/perfil/MisTickets'; 
import OrderDetailModal from '../components/perfil/OrderDetailModal';
import EmailChangeModal from '../components/perfil/EmailChangeModal';

const UserProfile = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
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
                        api.get('/profile/orders'),
                        api.get('/profile/subscription'),
                        api.get('/profile/tickets-summary')
                    ]);
                    setOrders(ordersRes.data);
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

    const menuItems = [
        { id: 'general', icon: User, label: 'Mi Perfil' },
        { id: 'security', icon: Lock, label: 'Seguridad' },
        { id: 'orders', icon: Package, label: 'Mis Pedidos' },
        { id: 'subscription', icon: CreditCard, label: 'Suscripción ERP' },
        { id: 'tickets', icon: MessageSquare, label: 'Mis Tickets' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-atlas-900 text-white flex items-center justify-center text-3xl font-bold shadow-lg shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                        <p className="text-gray-500">{user?.email}</p>
                        <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                                <Shield size={12} /> Cuenta Verificada
                            </span>
                            {subscription?.status === 'active' && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                                    <CheckCircle size={12} /> ERP Pro
                                </span>
                            )}
                        </div>
                    </div>
                    {user?.role_id === 1 && (
                        <div className="mt-4 md:mt-0">
                            <Link 
                                to="/admin" 
                                className="flex items-center gap-2 bg-atlas-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-atlas-800 hover:scale-105 transition-all shadow-lg shadow-atlas-900/20 active:scale-95"
                            >
                                <LayoutDashboard size={20} />
                                <span>Panel Admin</span>
                            </Link>
                        </div>
                    )}

                </div>

                <div className="grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-3">
                        <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-28">
                            {menuItems.map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-bold transition-all border-l-4 ${activeTab === item.id ? 'bg-atlas-50 text-atlas-900 border-atlas-900' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <item.icon size={18} /> {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="md:col-span-9">
                        {activeTab === 'general' && <MiPerfil user={user} onOpenEmailModal={() => setShowEmailModal(true)} />}
                        {activeTab === 'security' && <MiSeguridad />}
                        {activeTab === 'orders' && <MisPedidos orders={orders} loading={loadingData} onSelectOrder={setSelectedOrder} />}
                        {activeTab === 'subscription' && <MisSuscripciones subscription={subscription} loading={loadingData} />}
                        {activeTab === 'tickets' && <MisTickets ticketsData={ticketsData} loading={loadingData} />}
                    </div>
                </div>
            </div>

            <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            <EmailChangeModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} onSuccess={() => toast.success('Correo actualizado')} />
        </div>
    );
};

export default UserProfile;