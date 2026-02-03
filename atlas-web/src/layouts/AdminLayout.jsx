import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Package, ShoppingCart, LogOut, 
    Settings, Home, Users, LifeBuoy, Menu, X 
} from 'lucide-react';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path
        ? "bg-atlas-800 text-white border-r-4 border-atlas-300"
        : "text-gray-400 hover:bg-atlas-800/50 hover:text-white";

    const handleNavigation = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-atlas-900 z-30 flex items-center px-4 justify-between shadow-md">
                <span className="text-white font-bold tracking-wider">ATLAS ADMIN</span>
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
                fixed inset-y-0 left-0 w-64 bg-atlas-900 text-white flex flex-col z-50 transition-transform duration-300 ease-out shadow-2xl
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 md:static md:shadow-none
            `}>
                <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-atlas-800">
                    <div className="font-bold text-xl tracking-wider">
                        ATLAS <span className="text-atlas-300 ml-1 font-light">ADMIN</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24}/>
                    </button>
                </div>
                <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    <Link to="/admin" onClick={handleNavigation} className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin')}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to="/admin/productos" onClick={handleNavigation} className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/productos')}`}>
                        <Package size={20} /> Productos
                    </Link>
                    <Link to="/admin/pedidos" onClick={handleNavigation} className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/pedidos')}`}>
                        <ShoppingCart size={20} /> Pedidos
                    </Link>
                    <Link to="/admin/usuarios" onClick={handleNavigation} className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/usuarios')}`}>
                        <Users size={20} /> Clientes
                    </Link>
                    <Link to="/admin/tickets" onClick={handleNavigation} className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/tickets')}`}>
                        <LifeBuoy size={20} /> Soporte
                    </Link>
                    <Link to="/admin/configuracion" onClick={handleNavigation} className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/configuracion')}`}>
                        <Settings size={20} /> Configuración
                    </Link>
                </nav>
                <div className="p-4 border-t border-atlas-800 bg-atlas-900">
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