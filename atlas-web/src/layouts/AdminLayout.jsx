import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { 
    LayoutDashboard, Package, ShoppingCart, LogOut, 
    Settings, Home, Users, LifeBuoy, Menu, X, Zap
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [badges, setBadges] = useState({ orders: 0, tickets: 0 });

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path
        ? "bg-tenri-800 text-white border-r-4 border-tenri-300"
        : "text-gray-400 hover:bg-tenri-800/50 hover:text-white";

    const handleNavigation = () => {
        setSidebarOpen(false);
    };

    const checkPermission = (permisoRequerido) => {
        if (!user) return false;
        let rolePerms = {};
        if (user.role?.permissions) {
            rolePerms = typeof user.role.permissions === 'string' 
                ? JSON.parse(user.role.permissions) 
                : user.role.permissions;
        }

        let userPerms = {};
        if (user.permissions) {
            userPerms = typeof user.permissions === 'string' 
                ? JSON.parse(user.permissions) 
                : user.permissions;
        }

        const perms = Object.keys(userPerms).length > 0 ? userPerms : rolePerms;
        if (perms.all === true) return true;
        return perms[permisoRequerido] === true;
    };

    useEffect(() => {
        let isMounted = true;

        const fetchNotifications = async () => {
            if (!user) return;
            
            const canViewOrders = checkPermission('view_orders');
            const canViewTickets = checkPermission('view_tickets');
            if (!canViewOrders && !canViewTickets) return;

            try {
                const response = await api.get('/admin/notifications-summary');
                if (isMounted) {
                    setBadges({
                        orders: canViewOrders ? response.data.pending_orders : 0,
                        tickets: canViewTickets ? response.data.new_tickets : 0
                    });
                }
            } catch (error) {
                console.error("Error cargando notificaciones de la barra lateral:", error);
            }
        };

        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 15000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [user]);

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-tenri-900 z-30 flex items-center px-4 justify-between shadow-md">
                <span className="text-white font-bold tracking-wider">TENRI ADMIN</span>
                <button onClick={() => setSidebarOpen(true)} className="text-white p-2">
                    <Menu size={24} />
                </button>
            </div>
            
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 w-64 bg-tenri-900 text-white flex flex-col z-50 transition-transform duration-300 ease-out shadow-2xl
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 md:static md:shadow-none
            `}>
                <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-tenri-800 flex-shrink-0">
                    <div className="font-bold text-xl tracking-wider">
                        TENRI <span className="text-tenri-300 ml-1 font-light">ADMIN</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24}/>
                    </button>
                </div>
                
                <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    <Link to="/admin" onClick={handleNavigation} className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin')}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    
                    {checkPermission('manage_products') && (
                        <Link to="/admin/productos" onClick={handleNavigation} className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/productos')}`}>
                            <Package size={20} /> Productos
                        </Link>
                    )}

                    {checkPermission('manage_services') && (
                        <Link to="/admin/services" onClick={handleNavigation} className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/services')}`}>
                            <Zap size={20} /> Servicios
                        </Link>
                    )}

                    {checkPermission('view_orders') && (
                        <Link to="/admin/pedidos" onClick={handleNavigation} className={`flex items-center justify-between px-6 py-3 transition-all ${isActive('/admin/pedidos')}`}>
                            <div className="flex items-center gap-3">
                                <ShoppingCart size={20} /> Pedidos
                            </div>
                            {badges.orders > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                    {badges.orders}
                                </span>
                            )}
                        </Link>
                    )}

                    {checkPermission('view_users') && (
                        <Link to="/admin/usuarios" onClick={handleNavigation} className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/usuarios')}`}>
                            <Users size={20} /> Clientes
                        </Link>
                    )}

                    {checkPermission('view_tickets') && (
                        <Link to="/admin/tickets" onClick={handleNavigation} className={`flex items-center justify-between px-6 py-3 transition-all ${isActive('/admin/tickets')}`}>
                            <div className="flex items-center gap-3">
                                <LifeBuoy size={20} /> Soporte
                            </div>
                            {badges.tickets > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                    {badges.tickets}
                                </span>
                            )}
                        </Link>
                    )}

                    {checkPermission('manage_settings') && (
                        <Link to="/admin/configuracion" onClick={handleNavigation} className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/configuracion')}`}>
                            <Settings size={20} /> Configuración
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-tenri-800 bg-tenri-900 flex-shrink-0">
                    <Link to="/" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors mb-2">
                        <Home size={16} /> Ver Sitio Web
                    </Link>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors w-full text-left"
                    >
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </aside>
            <main className="flex-1 w-full overflow-hidden flex flex-col pt-16 md:pt-0">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;