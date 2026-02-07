import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
    return (
        // Agregamos 'w-full' para asegurar ancho completo y quitamos bordes internos que causen ruido visual
        <footer className="w-full bg-atlas-900 text-gray-300 border-t border-atlas-800">

            {/* Aumentamos el padding vertical (py-16) para que no se vea cortado */}
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Identidad */}
                    <div className="space-y-4">
                        <h3 className="text-white text-xl font-bold tracking-wider">ATLAS DIGITAL</h3>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Soluciones tecnológicas reales para problemas reales. Desarrollo, redes y seguridad con trato directo.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <SocialIcon icon={<Instagram size={20} />} />
                            <SocialIcon icon={<Linkedin size={20} />} />
                            <SocialIcon icon={<Mail size={20} />} />
                        </div>
                    </div>

                    {/* Navegación */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">Mapa del Sitio</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="hover:text-white transition-colors block py-1">Inicio</Link></li>
                            <li><Link to="/proyectos" className="hover:text-white transition-colors block py-1">Proyectos</Link></li>
                            <li><Link to="/catalogo" className="hover:text-white transition-colors block py-1">Tienda</Link></li>
                            <li><a href="https://erp.atlasdigitaltech.cl" className="text-atlas-300 font-medium hover:text-white transition-colors block py-1">Sistema ERP</a></li>
                        </ul>
                    </div>

                    {/* Servicios */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">Servicios</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/servicios" className="hover:text-white transition-colors block py-1">Desarrollo Web</Link></li>
                            <li><Link to="/servicios" className="hover:text-white transition-colors block py-1">Cámaras CCTV</Link></li>
                            <li><Link to="/servicios" className="hover:text-white transition-colors block py-1">Redes & WiFi</Link></li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">Contacto</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin size={20} className="text-atlas-300 shrink-0" />
                                <span>Santiago, Región Metropolitana<br />Chile</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={20} className="text-atlas-300 shrink-0" />
                                <span>+56 9 1234 5678</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={20} className="text-atlas-300 shrink-0" />
                                <span className="break-all">contacto@atlasdigitaltech.cl</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Línea divisoria y Copyright */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Atlas Digital Tech.</p>
                    <div className="flex space-x-6">
                        <span className="hover:text-gray-300 cursor-pointer">Privacidad</span>
                        <span className="hover:text-gray-300 cursor-pointer">Términos</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Componente auxiliar para los iconos sociales
const SocialIcon = ({ icon }) => (
    <a href="#" className="w-10 h-10 rounded-full bg-atlas-800 flex items-center justify-center text-gray-400 hover:bg-atlas-300 hover:text-atlas-900 transition-all duration-300">
        {icon}
    </a>
);

export default Footer;