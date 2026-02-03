import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Menu, X, ShoppingCart, User, LogIn, 
    MessageSquare, Package, LogOut, ChevronDown 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false); // Menú móvil
    const [showUserMenu, setShowUserMenu] = useState(false); // Dropdown de usuario
    const { cartCount, setIsCartOpen } = useCart();
    const navigate = useNavigate();
    
    // --- ESTADO DE SESIÓN SIMULADO ---
    // Cambia esto a 'false' si quieres ver cómo se ve cuando no hay nadie logeado
    const [isLoggedIn, setIsLoggedIn] = useState(true); 
    
    // Referencia para detectar clicks fuera del menú y cerrarlo
    const menuRef = useRef(null);

    // Efecto para cerrar el dropdown si haces clic afuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsLoggedIn(false);
        setShowUserMenu(false);
        navigate('/'); // Redirigir al home al salir
    };

    return (
        <>
            <nav className="bg-atlas-900 text-white fixed w-full z-50 shadow-lg border-b border-atlas-800 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">

                        {/* 1. LOGO */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
                            <span className="font-black text-2xl tracking-wider group-hover:opacity-90 transition-opacity">
                                ATLAS <span className="text-atlas-300 font-light">DIGITAL</span>
                            </span>
                        </Link>

                        {/* 2. MENÚ CENTRAL (Limpio, sin 'Mis Tickets') */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <Link to="/" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-bold">Inicio</Link>
                                <Link to="/proyectos" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-bold">Proyectos</Link>
                                <Link to="/catalogo" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-bold">Tienda</Link>
                                <Link to="/servicios" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-bold">Servicios</Link>
                            </div>
                        </div>

                        {/* 3. ZONA DE USUARIO (DERECHA) */}
                        <div className="hidden md:flex items-center gap-6">

                            {/* Carrito de Compras */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 hover:bg-atlas-800 rounded-full transition-colors group"
                            >
                                <ShoppingCart size={22} className="text-gray-300 group-hover:text-white" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-atlas-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-atlas-900 shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* LÓGICA DE USUARIO: ¿Está Logeado? */}
                            {isLoggedIn ? (
                                <div className="relative" ref={menuRef}>
                                    {/* Botón Trigger del Menú */}
                                    <button 
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className={`flex items-center gap-3 py-1.5 px-2 pr-4 rounded-full transition-all border ${showUserMenu ? 'bg-atlas-800 border-atlas-700' : 'hover:bg-atlas-800 border-transparent'}`}
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-atlas-400 to-atlas-600 flex items-center justify-center font-bold text-sm text-white shadow-inner">
                                            NS
                                        </div>
                                        <div className="text-left hidden lg:block">
                                            <p className="text-xs font-bold text-white leading-none">Nicolas</p>
                                            <p className="text-[10px] text-atlas-300 font-medium leading-none mt-0.5">Cliente</p>
                                        </div>
                                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}/>
                                    </button>

                                    {/* DROPDOWN MENU FLOTANTE */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-4 w-60 bg-white rounded-2xl shadow-2xl py-2 text-gray-800 border border-gray-100 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                                            
                                            {/* Header del Dropdown */}
                                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                                <p className="text-sm font-black text-gray-900">Nicolas Salas</p>
                                                <p className="text-xs text-gray-500 truncate font-medium">nicolas@atlas.cl</p>
                                            </div>
                                            
                                            {/* Opciones del Menú */}
                                            <div className="py-2">
                                                <Link to="/perfil" className="flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-gray-50 hover:text-atlas-900 transition-colors group" onClick={() => setShowUserMenu(false)}>
                                                    <User size={18} className="text-gray-400 group-hover:text-atlas-600"/> Mi Perfil
                                                </Link>
                                                <Link to="/mis-compras" className="flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-gray-50 hover:text-atlas-900 transition-colors group" onClick={() => setShowUserMenu(false)}>
                                                    <Package size={18} className="text-gray-400 group-hover:text-blue-600"/> Mis Compras
                                                </Link>
                                                <Link to="/mis-tickets" className="flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-gray-50 hover:text-atlas-900 transition-colors group" onClick={() => setShowUserMenu(false)}>
                                                    <MessageSquare size={18} className="text-gray-400 group-hover:text-green-600"/> Mis Tickets
                                                    {/* Badge de notificación */}
                                                    <span className="ml-auto bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">1</span>
                                                </Link>
                                            </div>
                                            
                                            {/* Logout */}
                                            <div className="border-t border-gray-100 mt-1 pt-1 bg-gray-50/30">
                                                <button 
                                                    onClick={handleLogout}
                                                    className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                >
                                                    <LogOut size={18}/> Cerrar Sesión
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Botón si NO está logeado
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/10 shadow-lg hover:shadow-atlas-500/20"
                                >
                                    <LogIn size={18} /> Iniciar Sesión
                                </Link>
                            )}
                        </div>

                        {/* BOTÓN MENÚ MÓVIL */}
                        <div className="-mr-2 flex md:hidden gap-4 items-center">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2"
                            >
                                <ShoppingCart size={24} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-atlas-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-atlas-800 focus:outline-none">
                                {isOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* MENÚ MÓVIL (Full Adaptado) */}
                {isOpen && (
                    <div className="md:hidden bg-atlas-900 border-t border-atlas-800 shadow-inner">
                        <div className="px-4 pt-4 pb-6 space-y-2 sm:px-3">
                            <Link to="/" className="block px-3 py-3 rounded-xl text-base font-bold text-gray-300 hover:text-white hover:bg-atlas-800 transition-colors">Inicio</Link>
                            <Link to="/proyectos" className="block px-3 py-3 rounded-xl text-base font-bold text-gray-300 hover:text-white hover:bg-atlas-800 transition-colors">Proyectos</Link>
                            <Link to="/catalogo" className="block px-3 py-3 rounded-xl text-base font-bold text-gray-300 hover:text-white hover:bg-atlas-800 transition-colors">Tienda</Link>
                            
                            {/* SECCIÓN USUARIO MÓVIL */}
                            {isLoggedIn ? (
                                <div className="border-t border-atlas-800 mt-6 pt-6 pb-2 bg-atlas-800/30 rounded-2xl mx-2 px-2">
                                    <div className="flex items-center px-3 mb-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-12 w-12 rounded-full bg-atlas-500 flex items-center justify-center font-bold text-white text-lg shadow-lg">NS</div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-lg font-bold leading-none text-white">Nicolas Salas</div>
                                            <div className="text-sm font-medium leading-none text-atlas-300 mt-1">nicolas@atlas.cl</div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Link to="/perfil" className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-atlas-700">
                                            <User size={20}/> Mi Perfil
                                        </Link>
                                        <Link to="/mis-compras" className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-atlas-700">
                                            <Package size={20}/> Mis Compras
                                        </Link>
                                        <Link to="/mis-tickets" className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-atlas-700">
                                            <MessageSquare size={20}/> Mis Tickets
                                        </Link>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 mt-4 rounded-xl text-base font-bold text-red-400 hover:text-red-300 hover:bg-atlas-800 transition-colors">
                                            <LogOut size={20}/> Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="block w-full text-center px-3 py-4 text-white font-bold bg-atlas-600 mt-6 rounded-xl shadow-lg">
                                    <LogIn size={20} className="inline mr-2" /> Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
            <CartDrawer />
        </>
    );
};

export default Navbar;