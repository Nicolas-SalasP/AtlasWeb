import React from 'react';
import { ArrowRight, Server, ShieldCheck, Code, Cpu, Activity, Database, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="bg-white min-h-screen">

            {/* 1. HERO SECTION */}
            <section className="relative bg-atlas-900 text-white pt-32 pb-24 px-4 overflow-hidden">
                {/* Efectos de fondo */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-atlas-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10"></div>

                <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-1 rounded-full bg-atlas-800 border border-atlas-500/30 text-atlas-300 text-sm font-semibold mb-2">
                            🚀 Tecnología para empresas modernas
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                            Soluciones Digitales <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-atlas-300 to-blue-400">
                                A Tu Medida
                            </span>
                        </h1>
                        <p className="text-lg text-gray-300 max-w-xl">
                            Desde sistemas ERP contables hasta infraestructura de redes y seguridad. Centralizamos la tecnología de tu negocio en un solo lugar.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link to="/proyectos" className="bg-atlas-300 hover:bg-white hover:text-atlas-900 text-atlas-900 font-bold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-atlas-300/50">
                                Ver Proyectos <ArrowRight size={20} />
                            </Link>
                            <Link to="/contacto" className="border border-gray-600 hover:border-white hover:bg-white/5 text-white font-semibold py-3 px-8 rounded-lg transition-all text-center">
                                Cotizar Ahora
                            </Link>
                        </div>
                    </div>

                    {/* Dashboard Técnico Realista */}
                    <div className="relative hidden lg:block">
                        <div className="absolute -inset-1 bg-gradient-to-r from-atlas-300 to-blue-600 rounded-2xl blur opacity-20"></div>
                        <div className="relative bg-atlas-900 rounded-2xl p-6 border border-atlas-500/30 shadow-2xl font-mono text-sm">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <span className="text-gray-400 text-xs">root@atlas-server:~</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <span className="text-green-400">➜</span>
                                    <span className="text-white">check status --all</span>
                                </div>

                                <div className="pl-4 space-y-2 text-gray-300">
                                    <div className="flex justify-between">
                                        <span>[ Database ]</span>
                                        <span className="text-green-400">Connected (12ms)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>[ API Gateway ]</span>
                                        <span className="text-green-400">Online</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>[ Security ]</span>
                                        <span className="text-blue-400">Firewall Active</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <span className="text-green-400">➜</span>
                                    <span className="text-white animate-pulse">_</span>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-800">
                                    <p className="text-xs text-gray-500 mb-1">CPU Load</p>
                                    <div className="flex items-end gap-1 h-8">
                                        <div className="w-1 bg-atlas-500 h-[40%]"></div>
                                        <div className="w-1 bg-atlas-500 h-[60%]"></div>
                                        <div className="w-1 bg-atlas-500 h-[30%]"></div>
                                        <div className="w-1 bg-atlas-500 h-[80%]"></div>
                                        <div className="w-1 bg-atlas-500 h-[50%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. STATS BAR */}
            <div className="bg-atlas-800 border-y border-atlas-700">
                <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                    <StatItem number="100%" label="Dedicación" />
                    <StatItem number="24/7" label="Monitoreo" />
                    <StatItem number="+2 Años" label="Experiencia" />
                    <StatItem number="Soporte" label="Personalizado" />
                </div>
            </div>

            {/* 3. SERVICIOS PRINCIPALES */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-atlas-900 text-3xl md:text-4xl font-bold mb-4">Nuestras Soluciones</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Cubrimos todo el ciclo tecnológico de tu empresa, desde la instalación de cables hasta el software de gestión.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <ServiceCard
                            icon={<Code size={48} />}
                            title="Desarrollo Web & Apps"
                            desc="Sitios corporativos, tiendas e-commerce y aplicaciones web a medida con las últimas tecnologías."
                            link="/servicios"
                        />
                        <ServiceCard
                            icon={<Server size={48} />}
                            title="Redes e Infraestructura"
                            desc="Cableado estructurado, configuración de servidores, routers MikroTik y optimización WiFi."
                            link="/servicios"
                        />
                        <ServiceCard
                            icon={<ShieldCheck size={48} />}
                            title="Seguridad Electrónica"
                            desc="Instalación y mantenimiento de cámaras CCTV, controles de acceso y monitoreo remoto."
                            link="/servicios"
                        />
                    </div>
                </div>
            </section>

            {/* 4. SECCIÓN ERP DESTACADA */}
            <section className="py-20 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-atlas-900 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-96 h-96 bg-atlas-500 rounded-full opacity-10 blur-3xl"></div>

                        <div className="flex-1 relative z-10">
                            <span className="text-atlas-300 font-bold tracking-widest text-sm uppercase mb-2 block">Producto Estrella</span>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Atlas ERP Cloud</h2>
                            <p className="text-gray-300 text-lg mb-8">
                                Toma el control total de tu contabilidad, inventario y facturación. Nuestro sistema ERP está diseñado para PYMES chilenas.
                            </p>
                            <ul className="space-y-3 mb-8 text-gray-300">
                                <li className="flex items-center gap-3"><Activity size={20} className="text-green-400" /> Facturación Electrónica SII</li>
                                <li className="flex items-center gap-3"><Database size={20} className="text-blue-400" /> Control de Stock en tiempo real</li>
                                <li className="flex items-center gap-3"><Monitor size={20} className="text-purple-400" /> Acceso desde cualquier lugar</li>
                            </ul>
                            <a href="https://erp.atlasdigitaltech.cl" className="inline-block bg-white text-atlas-900 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                                Probar Demo
                            </a>
                        </div>

                        <div className="flex-1 relative z-10">
                            <div className="bg-white rounded-xl shadow-2xl p-4 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center gap-4 mb-4 border-b pb-2">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    <div className="h-4 bg-gray-200 w-32 rounded"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-8 bg-blue-50 w-full rounded"></div>
                                    <div className="h-8 bg-gray-50 w-full rounded"></div>
                                    <div className="h-8 bg-gray-50 w-full rounded"></div>
                                    <div className="h-24 bg-gray-50 w-full rounded mt-4"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. TIENDA TEASER */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-atlas-900 mb-8">Hardware Profesional</h2>
                    <p className="text-gray-600 mb-12 max-w-2xl mx-auto">No solo instalamos, también vendemos los mejores equipos para tu proyecto.</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                    <Cpu size={40} className="text-gray-400" />
                                </div>
                                <h3 className="font-semibold text-gray-800">Cámara IP Hilook</h3>
                                <p className="text-atlas-500 font-bold mt-2">$45.990</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12">
                        <Link to="/catalogo" className="text-atlas-500 font-bold hover:text-atlas-800 inline-flex items-center gap-2">
                            Ver todo el catálogo <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Subcomponentes
const StatItem = ({ number, label }) => (
    <div className="flex flex-col items-center">
        <span className="text-3xl md:text-4xl font-bold text-atlas-300">{number}</span>
        <span className="text-sm text-gray-300 mt-1 uppercase tracking-wider">{label}</span>
    </div>
);

const ServiceCard = ({ icon, title, desc, link }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-atlas-500 group-hover:bg-atlas-500 group-hover:text-white transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{desc}</p>
        <Link to={link} className="text-atlas-500 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
            Más información <ArrowRight size={16} />
        </Link>
    </div>
);

export default Home;