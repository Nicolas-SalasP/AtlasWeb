import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Settings, Home, Users } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path
        ? "bg-atlas-800 text-white border-r-4 border-atlas-300"
        : "text-gray-400 hover:bg-atlas-800/50 hover:text-white";

    return (
        <div className="min-h-screen flex bg-gray-100">

            {/* SIDEBAR */}
            <aside className="w-64 bg-atlas-900 text-white flex flex-col fixed h-full z-20">

                {/* Logo Admin */}
                <div className="h-20 flex items-center px-6 border-b border-atlas-800 font-bold text-xl tracking-wider">
                    ATLAS <span className="text-atlas-300 ml-1 font-light">ADMIN</span>
                </div>

                {/* Menú */}
                <nav className="flex-1 py-6 space-y-1">
                    <Link to="/admin" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin')}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to="/admin/productos" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/productos')}`}>
                        <Package size={20} /> Productos
                    </Link>
                    <Link to="/admin/pedidos" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/pedidos')}`}>
                        <ShoppingCart size={20} /> Pedidos <span className="ml-auto bg-red-500 text-xs px-2 py-0.5 rounded-full">3</span>
                    </Link>
                    <Link to="/admin/configuracion" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/configuracion')}`}>
                        <Settings size={20} /> Configuración
                    </Link>
                    <Link to="/admin/usuarios" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/usuarios')}`}>
                        <Users size={20} /> Clientes
                    </Link>
                    <Link to="/admin/tickets" className={`flex items-center gap-3 px-6 py-3 transition-all ${isActive('/admin/tickets')}`}>
                        <LifeBuoy size={20} /> Soporte
                    </Link>
                </nav>

                {/* Footer Sidebar */}
                <div className="p-4 border-t border-atlas-800">
                    <Link to="/" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors mb-2">
                        <Home size={16} /> Ver Sitio Web
                    </Link>
                    <button className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full text-left">
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <Outlet />
            </main>

        </div>
    );
};

export default AdminLayout;