import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Code, Server, ShieldCheck, CheckCircle, ArrowRight, Send } from 'lucide-react';

const Servicios = () => {
    const { hash } = useLocation();
    useEffect(() => {
        if (hash) {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [hash]);

    return (
        <div className="bg-white min-h-screen pt-20">

            {/* 1. HERO HEADER */}
            <section className="bg-atlas-900 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Soluciones Tecnológicas <span className="text-atlas-300">Integrales</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        No necesitas contratar a tres empresas diferentes. Nosotros diseñamos el software, instalamos las redes y protegemos el recinto.
                    </p>
                </div>
            </section>

            {/* 2. DETALLE DE SERVICIOS */}
            <div className="max-w-7xl mx-auto px-4 py-20 space-y-24">
                <ServiceSection
                    id="desarrollo"
                    title="Desarrollo de Software & Web"
                    desc="Transformamos tus procesos manuales en sistemas digitales eficientes. Desde sitios corporativos hasta ERPs complejos y aplicaciones a medida."
                    icon={<Code size={40} className="text-white" />}
                    color="bg-blue-600"
                    features={[
                        "Sitios Web Corporativos & Landing Pages",
                        "Tiendas E-commerce con WebPay/MercadoPago",
                        "Sistemas de Gestión (ERP/CRM) a medida",
                        "Integración de APIs y Automatización"
                    ]}
                    img="/desarrollo.webp"
                    reverse={false}
                    zoom={false}
                />

                {/* SERVICIO 2: INFRAESTRUCTURA (Imagen Rack) */}
                <ServiceSection
                    id="redes"
                    title="Redes & Infraestructura IT"
                    desc="La columna vertebral de tu negocio. Diseñamos redes estables, rápidas y seguras para oficinas y galpones industriales."
                    icon={<Server size={40} className="text-white" />}
                    color="bg-purple-600"
                    features={[
                        "Cableado Estructurado Certificado (Cat6/6A)",
                        "Configuración de Routers MikroTik y Load Balancing",
                        "Enlaces Inalámbricos Punto a Punto",
                        "Servidores Locales (Windows Server/Linux)"
                    ]}
                    img="/estructura.webp"
                    reverse={true}
                    zoom={true}
                />

                {/* SERVICIO 3: SEGURIDAD (Imagen Cámara) */}
                <ServiceSection
                    id="seguridad"
                    title="Seguridad Electrónica (CCTV)"
                    desc="Protege tus activos con tecnología de vigilancia de última generación. Monitoreo remoto desde tu celular 24/7."
                    icon={<ShieldCheck size={40} className="text-white" />}
                    color="bg-emerald-600"
                    features={[
                        "Instalación de Cámaras IP y Análogas (Hikvision/Dahua)",
                        "Configuración de NVR y DVR con acceso remoto",
                        "Controles de Acceso Biométricos",
                        "Mantenimiento preventivo de sistemas existentes"
                    ]}
                    img="/seguridad.webp"
                    reverse={false}
                    zoom={true}
                />

            </div>

            {/* 3. FORMULARIO DE COTIZACIÓN */}
            <section className="bg-gray-50 py-20 border-t border-gray-200" id="cotizar">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-atlas-900 mb-4">Solicitar Cotización</h2>
                        <p className="text-gray-600">Cuéntanos sobre tu proyecto. Te responderemos en menos de 24 horas con una propuesta técnica.</p>
                    </div>

                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100">
                        <QuoteForm />
                    </div>
                </div>
            </section>

        </div>
    );
};

/* --- SUBCOMPONENTES --- */
const ServiceSection = ({ id, title, desc, icon, color, features, img, reverse, zoom }) => (
    <div id={id} className={`flex flex-col lg:flex-row gap-12 items-center scroll-mt-32 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        <div className="flex-1">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${color}`}>
                {icon}
            </div>
            <h2 className="text-3xl font-bold text-atlas-900 mb-4">{title}</h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                {desc}
            </p>
            <ul className="space-y-4">
                {features.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-atlas-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                ))}
            </ul>
            <a href="#cotizar" className="mt-8 inline-flex items-center gap-2 text-atlas-500 font-bold hover:gap-3 transition-all">
                Solicitar este servicio <ArrowRight size={20} />
            </a>
        </div>
        <div className="flex-1 w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group">
                <div className={`absolute inset-0 opacity-10 group-hover:opacity-0 transition-opacity duration-500 ${color}`}></div>
                <img
                    src={img}
                    alt={title}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-700 ${zoom ? 'scale-110 group-hover:scale-115' : 'transform group-hover:scale-105'}`}
                />
            </div>
        </div>
    </div>
);

const QuoteForm = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        servicio: 'desarrollo',
        mensaje: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("¡Mensaje enviado! (Simulación)\nPronto conectaremos esto con tu Backend.");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                    <input
                        required
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-atlas-300 focus:border-transparent outline-none transition-all"
                        placeholder="Ej: Juan Pérez"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                    <input
                        required
                        type="email"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-atlas-300 focus:border-transparent outline-none transition-all"
                        placeholder="juan@empresa.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Servicio de Interés</label>
                <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-atlas-300 focus:border-transparent outline-none bg-white"
                    value={formData.servicio}
                    onChange={(e) => setFormData({ ...formData, servicio: e.target.value })}
                >
                    <option value="desarrollo">Desarrollo Web / Software</option>
                    <option value="redes">Redes & Infraestructura</option>
                    <option value="seguridad">Cámaras de Seguridad (CCTV)</option>
                    <option value="hardware">Compra de Hardware</option>
                    <option value="otro">Otro / Consulta General</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detalles del Proyecto</label>
                <textarea
                    required
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-atlas-300 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Cuéntanos qué necesitas: ¿Cuántas cámaras? ¿Qué tipo de software?..."
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                ></textarea>
            </div>

            <button
                type="submit"
                className="w-full bg-atlas-900 text-white font-bold py-4 rounded-lg hover:bg-atlas-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
                <Send size={20} /> Enviar Solicitud de Cotización
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
                Al enviar este formulario aceptas ser contactado por el equipo de Atlas Digital Tech.
            </p>
        </form>
    );
};

export default Servicios;