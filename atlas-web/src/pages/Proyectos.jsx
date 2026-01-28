import React from 'react';
import { ExternalLink, Github, Database, Layout, Activity, Calculator, ShoppingCart, RefreshCw, Briefcase } from 'lucide-react';

const Proyectos = () => {
    return (
        <div className="bg-white min-h-screen pt-20">

            {/* HEADER */}
            <section className="bg-atlas-900 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Nuestro Trabajo <span className="text-atlas-300">Habla por Nosotros</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Desde plataformas corporativas hasta la modernización de sistemas críticos. Aquí verás lo que somos capaces de construir.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-20">

                {/* SECCIÓN 1: CASOS DE ÉXITO */}
                <h2 className="text-2xl font-bold text-atlas-900 mb-12 border-l-4 border-atlas-500 pl-4 uppercase tracking-widest">
                    Casos de Éxito & Producción
                </h2>

                <div className="space-y-32 mb-32">

                    {/* PROYECTO 1: JC ENVÍOS */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Imagen con efecto y ajuste COVER (porque es web pública y se ve bien recortada) */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-blue-500/20 rounded-xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
                            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-100 bg-white aspect-video flex items-center justify-center group-hover:scale-[1.01] transition-transform">
                                <img src="/jcenvios.png" alt="Plataforma JC Envíos" className="w-full h-full object-cover object-top" />
                            </div>
                        </div>

                        {/* Texto */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Badge color="bg-blue-100 text-blue-700">Fintech / Remesas</Badge>
                                <Badge color="bg-green-100 text-green-700">En Producción</Badge>
                            </div>
                            <h2 className="text-3xl font-bold text-atlas-900 mb-4">JC Envíos Internacionales</h2>
                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                Plataforma transaccional para el envío de remesas. La estrella del sitio es su **calculadora en tiempo real** que permite a los usuarios cotizar envíos con tasas de cambio actualizadas al instante.
                            </p>
                            <div className="flex flex-wrap gap-3 mb-8">
                                <TechTag icon={<Calculator size={16} />} text="Calculadora Divisas" />
                                <TechTag icon={<Activity size={16} />} text="Tasas en Tiempo Real" />
                                <TechTag icon={<Layout size={16} />} text="UX/UI Intuitivo" />
                            </div>
                            <a
                                href="https://jcenvios.cl/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-atlas-900 text-white px-6 py-3 rounded-lg hover:bg-atlas-800 transition-colors font-semibold"
                            >
                                Visitar Sitio Web <ExternalLink size={18} />
                            </a>
                        </div>
                    </div>

                    {/* PROYECTO 2: INSUORDERS (Corregido) */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Texto (Izquierda) */}
                        <div className="order-2 lg:order-1">
                            <div className="flex items-center gap-2 mb-4">
                                <Badge color="bg-purple-100 text-purple-700">Sistema ERP</Badge>
                                <Badge color="bg-gray-100 text-gray-700">Gestión Interna</Badge>
                            </div>
                            <h2 className="text-3xl font-bold text-atlas-900 mb-4">InsuOrders System</h2>
                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                Software integral para la gestión operativa. Incluye un **Dashboard de control** para monitorear gastos, alertas de stock crítico y un cronograma interactivo para mantenimientos.
                            </p>
                            <div className="flex flex-wrap gap-3 mb-8">
                                <TechTag icon={<Database size={16} />} text="Control de Stock" />
                                <TechTag icon={<Activity size={16} />} text="Dashboard Analytics" />
                                <TechTag icon={<Layout size={16} />} text="Gestión Proveedores" />
                            </div>

                            {/* BOTÓN NEGRO RESTAURADO */}
                            <a
                                href="https://github.com/Nicolas-SalasP/InsuOrders"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 border-2 border-atlas-900 bg-atlas-900 text-white px-6 py-3 rounded-lg hover:bg-white hover:text-atlas-900 transition-colors font-semibold shadow-lg"
                            >
                                Ver Código <Github size={18} />
                            </a>
                        </div>

                        {/* IMAGEN: Fondo morado RESTAURADO + Imagen COMPLETA (object-contain) */}
                        <div className="relative group order-1 lg:order-2">
                            <div className="absolute -inset-4 bg-purple-500/20 rounded-xl transform rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>

                            {/* Aquí usamos 'object-contain' para que la imagen NO se recorte y 'bg-gray-50' para rellenar espacios si sobran */}
                            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center group-hover:scale-[1.01] transition-transform">
                                <img
                                    src="/insuorders.png"
                                    alt="Dashboard InsuOrders"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: LABORATORIO & I+D */}
                <h2 className="text-2xl font-bold text-atlas-900 mb-12 border-l-4 border-blue-500 pl-4 uppercase tracking-widest">
                    Laboratorio de Desarrollo & Open Source
                </h2>

                <div className="grid md:grid-cols-3 gap-8">

                    {/* CARD 1: ERP CONTABLE */}
                    <ProjectCard
                        title="Atlas ERP Core"
                        desc="El núcleo de nuestro sistema contable. Arquitectura modular para facturación, RRHH y contabilidad general. Actualmente en fase Alpha."
                        tags={['En Desarrollo', 'Backend Heavy']}
                        icon={<Briefcase size={40} className="text-atlas-500" />}
                        link="https://github.com/Nicolas-SalasP/ERP-Contable"
                    />

                    {/* CARD 2: E-COMMERCE TEMPLATE */}
                    <ProjectCard
                        title="E-Commerce Starter"
                        desc="Plantilla profesional de tienda online optimizada para conversión. Carrito de compras, pasarela de pagos y diseño responsive listo para usar."
                        tags={['Plantilla', 'Frontend']}
                        icon={<ShoppingCart size={40} className="text-green-600" />}
                        link="https://github.com/Nicolas-SalasP/E-commerce-plantilla"
                    />

                    {/* CARD 3: REFACTORIZACIÓN LEGACY */}
                    <ProjectCard
                        title="Modernización Legacy"
                        desc="Proyecto de alta complejidad técnica: Migración y refactorización de un sistema monolítico en PHP 5.2 a estándares modernos y seguros."
                        tags={['Refactoring', 'Legacy Support']}
                        icon={<RefreshCw size={40} className="text-orange-500" />}
                        link="https://github.com/Nicolas-SalasP/Prodin-Adaptacion"
                        isWarning={true}
                    />
                </div>

                {/* CTA FINAL */}
                <div className="mt-20 bg-gray-50 rounded-2xl p-12 text-center border border-gray-200">
                    <h2 className="text-3xl font-bold text-atlas-900 mb-4">¿Código Nuevo o Legado?</h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Manejamos todo el espectro: desde crear tu nueva tienda online hasta salvar ese sistema antiguo que mantiene tu empresa funcionando.
                    </p>
                    <a href="mailto:contacto@atlasdigitaltech.cl" className="inline-block bg-atlas-300 text-atlas-900 font-bold py-3 px-8 rounded-lg hover:bg-white hover:shadow-lg transition-all">
                        Consultar por Servicios
                    </a>
                </div>

            </div>
        </div>
    );
};

/* --- SUBCOMPONENTES --- */

const Badge = ({ children, color }) => (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${color}`}>
        {children}
    </span>
);

const TechTag = ({ icon, text }) => (
    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-700 shadow-sm hover:border-atlas-300 transition-colors">
        {icon}
        <span>{text}</span>
    </div>
);

const ProjectCard = ({ title, desc, tags, icon, link, isWarning }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-atlas-900 transition-colors">
                <Github size={20} />
            </a>
        </div>
        <h3 className="text-xl font-bold text-atlas-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
            {desc}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
            {tags.map((tag, i) => (
                <span key={i} className={`text-xs font-semibold px-2 py-1 rounded border ${isWarning && tag === 'Legacy Support' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {tag}
                </span>
            ))}
        </div>
    </div>
);

export default Proyectos;