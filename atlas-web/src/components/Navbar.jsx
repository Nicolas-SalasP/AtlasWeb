import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// AGREGAMOS "MessageSquare" AQUÍ ABAJO
import { Menu, X, ShoppingCart, User, LogIn, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { cartCount, setIsCartOpen } = useCart();

    return (
        <>
            <nav className="bg-atlas-900 text-white fixed w-full z-50 shadow-lg border-b border-atlas-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">

                        {/* LOGO */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                            <span className="font-bold text-2xl tracking-wider">ATLAS <span className="text-atlas-300 font-light">DIGITAL</span></span>
                        </Link>

                        {/* DESKTOP MENU */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <Link to="/" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">Inicio</Link>
                                <Link to="/proyectos" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">Proyectos</Link>
                                <Link to="/catalogo" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">Tienda</Link>
                                <Link to="/servicios" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">Servicios</Link>
                                <Link to="/mis-tickets" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-medium"> Mis Tickets</Link>
                            </div>
                        </div>

                        {/* ICONOS DERECHA */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 hover:bg-atlas-800 rounded-full transition-colors group"
                            >
                                <ShoppingCart size={22} className="text-gray-300 group-hover:text-white" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-atlas-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-atlas-900">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            <Link
                                to="/login"
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-white/10"
                            >
                                <LogIn size={18} /> Iniciar Sesión
                            </Link>
                        </div>

                        {/* MOBILE MENU BUTTON */}
                        <div className="-mr-2 flex md:hidden gap-4 items-center">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2"
                            >
                                <ShoppingCart size={24} />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-atlas-500 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-atlas-800 focus:outline-none">
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* MOBILE MENU */}
                {isOpen && (
                    <div className="md:hidden bg-atlas-900 border-t border-atlas-800">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-atlas-800">Inicio</Link>
                            <Link to="/proyectos" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-atlas-800">Proyectos</Link>
                            <Link to="/catalogo" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-atlas-800">Tienda</Link>
                            <Link to="/servicios" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-atlas-800">Servicios</Link>
                            <Link to="/mis-tickets" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-atlas-800">Mis Tickets</Link>
                            <Link to="/login" className="block w-full text-left px-3 py-2 text-atlas-300 font-bold bg-atlas-800/50 mt-2 rounded">
                                <LogIn size={16} className="inline mr-2" /> Iniciar Sesión
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            <CartDrawer />
        </>
    );
};

export default Navbar;