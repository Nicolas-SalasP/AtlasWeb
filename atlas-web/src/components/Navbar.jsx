import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, User } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-atlas-900 text-white fixed w-full z-50 shadow-lg border-b border-atlas-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* LOGO */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                        {/* Aquí iría tu imagen: <img src="/logo.png" className="h-10" /> */}
                        <span className="font-bold text-2xl tracking-wider">ATLAS <span className="text-atlas-300 font-light">DIGITAL</span></span>
                    </div>

                    {/* DESKTOP MENU */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <Link to="/" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">Inicio</Link>
                            <Link to="/proyectos" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">Proyectos</Link>
                            <Link to="/catalogo" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">Tienda</Link>
                            <Link to="/servicios" className="hover:text-atlas-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">Servicios</Link>
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN (ERP & CARRITO) */}
                    <div className="hidden md:flex items-center gap-4">
                        <a
                            href="https://erp.atlasdigitaltech.cl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-atlas-500 hover:bg-atlas-300 text-white px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <User size={16} /> Acceso ERP
                        </a>
                        <button className="relative p-2 hover:bg-atlas-800 rounded-full transition-colors">
                            <ShoppingCart size={20} />
                            <span className="absolute top-0 right-0 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
                        </button>
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-atlas-800 focus:outline-none">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU (Desplegable) */}
            {isOpen && (
                <div className="md:hidden bg-atlas-900 border-t border-atlas-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-atlas-800">Inicio</Link>
                        <Link to="/proyectos" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-atlas-800">Proyectos</Link>
                        <Link to="/catalogo" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-atlas-800">Tienda</Link>
                        <Link to="/servicios" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-atlas-800">Servicios</Link>
                        <a href="https://erp.atlasdigitaltech.cl" className="block w-full text-left px-3 py-2 text-atlas-300 font-bold">Ir al ERP Corporativo</a>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;