import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Code, Server, ShieldCheck, CheckCircle, ArrowRight,
    Sparkles, ExternalLink, Activity, Calculator, Layout,
    Layers, Globe, Cpu, Database, Briefcase
} from 'lucide-react';

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
        <div className="bg-white min-h-screen">

            <section className="relative bg-tenri-900 text-white pt-32 pb-24 px-4 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tenri-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}></div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-tenri-500/30 text-tenri-300 text-xs font-bold uppercase tracking-widest mb-6">
                        <Sparkles size={12} /> Tenri Soluciones
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.05]">
                        Tecnología integral, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-tenri-300 to-blue-400">
                            un solo proveedor.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
                        Desarrollamos el software, instalamos las redes y protegemos el recinto.
                        Cero coordinación entre proveedores, cero responsables cruzados.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-2 text-xs text-gray-400">
                        <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-tenri-300" /><span>Certificado SII</span></div>
                        <div className="flex items-center gap-2"><Globe size={14} className="text-tenri-300" /><span>Cobertura nacional</span></div>
                        <div className="flex items-center gap-2"><Cpu size={14} className="text-tenri-300" /><span>Tecnología propia</span></div>
                    </div>
                </div>
            </section>

            <div id="servicios" className="max-w-7xl mx-auto px-4 py-20 md:py-24 space-y-24 md:space-y-32 scroll-mt-24">

                <div className="text-center max-w-2xl mx-auto">
                    <span className="inline-block text-xs font-black uppercase tracking-widest text-tenri-600 bg-tenri-50 px-3 py-1 rounded-full mb-4 border border-tenri-100">
                        ¿Qué hacemos?
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Tres áreas, un mismo equipo.
                    </h2>
                </div>

                <ServiceSection
                    id="desarrollo"
                    title="Desarrollo de Software & Web"
                    desc="Transformamos tus procesos manuales en sistemas digitales eficientes. Desde sitios corporativos hasta ERPs complejos y aplicaciones a medida."
                    icon={<Code size={28} className="text-white" />}
                    color="from-blue-500 to-blue-700"
                    features={[
                        "Sitios web corporativos y landing pages",
                        "Tiendas e-commerce con Webpay y MercadoPago",
                        "Sistemas de gestión (ERP/CRM) a medida",
                        "Integración de APIs y automatización"
                    ]}
                    illustration={<DesarrolloIllustration />}
                    reverse={false}
                    linkValue="desarrollo"
                />

                <ServiceSection
                    id="redes"
                    title="Redes & Infraestructura IT"
                    desc="La columna vertebral de tu negocio. Diseñamos redes estables, rápidas y seguras para oficinas y galpones industriales."
                    icon={<Server size={28} className="text-white" />}
                    color="from-purple-500 to-purple-700"
                    features={[
                        "Cableado estructurado certificado (CAT6/6A)",
                        "Configuración de routers MikroTik y load balancing",
                        "Enlaces inalámbricos punto a punto",
                        "Servidores locales (Windows Server / Linux)"
                    ]}
                    illustration={<RedesIllustration />}
                    reverse={true}
                    linkValue="redes"
                />

                <ServiceSection
                    id="seguridad"
                    title="Seguridad Electrónica & CCTV"
                    desc="Protege tus activos con tecnología de vigilancia de última generación. Monitoreo remoto desde tu celular, 24/7."
                    icon={<ShieldCheck size={28} className="text-white" />}
                    color="from-emerald-500 to-emerald-700"
                    features={[
                        "Cámaras IP y análogas (Hikvision / Dahua)",
                        "Configuración de NVR y DVR con acceso remoto",
                        "Controles de acceso biométricos",
                        "Mantenimiento preventivo de sistemas existentes"
                    ]}
                    illustration={<SeguridadIllustration />}
                    reverse={false}
                    linkValue="seguridad"
                />
            </div>

            <section id="casos" className="bg-gray-50 py-20 md:py-24 scroll-mt-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="inline-block text-xs font-black uppercase tracking-widest text-tenri-600 bg-tenri-50 px-3 py-1 rounded-full mb-4 border border-tenri-100">
                            Trabajo real
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                            Casos en producción
                        </h2>
                        <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                            Plataformas que construimos y mantenemos activas para clientes reales.
                        </p>
                    </div>

                    <div className="space-y-16 md:space-y-20">

                        <CaseStudy
                            badges={[
                                { label: 'Fintech / Remesas', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                                { label: 'En producción', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                            ]}
                            title="JC Envíos Internacionales"
                            description="Plataforma transaccional para el envío de remesas. La pieza central del sitio es su calculadora en tiempo real que permite a los usuarios cotizar envíos con tasas de cambio actualizadas al instante."
                            tags={[
                                { icon: <Calculator size={14} />, text: 'Calculadora de divisas' },
                                { icon: <Activity size={14} />, text: 'Tasas en tiempo real' },
                                { icon: <Layout size={14} />, text: 'UX optimizado' },
                            ]}
                            ctaUrl="https://jcenvios.cl/"
                            ctaText="Ver sitio en vivo"
                            screenshotUrl="/jcenvios.webp"
                            screenshotAlt="Captura del sitio JC Envíos en producción"
                            reverse={false}
                            accentColor="blue"
                        />

                        <CaseStudy
                            badges={[
                                { label: 'ERP / Gestión interna', color: 'bg-purple-50 text-purple-700 border-purple-100' },
                                { label: 'Cliente activo', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                            ]}
                            title="InsuOrders System"
                            description="Software integral para la gestión operativa de una procesadora. Dashboard de control para monitorear gastos, alertas de stock crítico, gestión de proveedores y cronograma de mantenimientos."
                            tags={[
                                { icon: <Database size={14} />, text: 'Control de stock' },
                                { icon: <Activity size={14} />, text: 'Dashboard analytics' },
                                { icon: <Briefcase size={14} />, text: 'Gestión proveedores' },
                            ]}
                            screenshotUrl="/insuorders.webp"
                            screenshotAlt="Dashboard InsuOrders"
                            reverse={true}
                            accentColor="purple"
                        />
                    </div>
                </div>
            </section>

            <section className="py-20 md:py-24 bg-white">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-tenri-900 via-tenri-800 to-tenri-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute -right-20 -top-20 w-96 h-96 bg-tenri-500 rounded-full opacity-10 blur-3xl"></div>
                        <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>

                        <div className="relative z-10">
                            <span className="inline-block text-xs font-black uppercase tracking-widest text-tenri-300 bg-white/5 backdrop-blur-sm px-3 py-1 rounded-full mb-5 border border-tenri-500/30">
                                ¿Listo para empezar?
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
                                Conversemos sobre tu proyecto
                            </h2>
                            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                                Te ayudamos a elegir la solución correcta para tu empresa.
                                Diagnóstico inicial sin costo, sin compromiso.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    to="/contacto"
                                    className="bg-white text-tenri-900 font-bold py-3.5 px-7 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg group"
                                >
                                    Hablar con un especialista
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/catalogo"
                                    className="border border-white/30 hover:bg-white/10 text-white font-bold py-3.5 px-7 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Explorar catálogo
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ServiceSection = ({ id, title, desc, icon, color, features, illustration, reverse, linkValue }) => (
    <div id={id} className={`flex flex-col lg:flex-row gap-10 lg:gap-16 items-center scroll-mt-24 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        <div className="flex-1 w-full">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg bg-gradient-to-br ${color}`}>
                {icon}
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{title}</h2>
            <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">{desc}</p>
            <ul className="space-y-3 mb-8">
                {features.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle size={11} />
                        </div>
                        <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                ))}
            </ul>
            <Link
                to={`/contacto?servicio=${linkValue}`}
                className="inline-flex items-center gap-2 bg-tenri-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-tenri-800 transition-all shadow-sm hover:shadow-md group"
            >
                Solicitar este servicio
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
        <div className="flex-1 w-full">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-100 aspect-[4/3] flex items-center justify-center shadow-sm">
                {illustration}
            </div>
        </div>
    </div>
);

const CaseStudy = ({ badges, title, description, tags, ctaUrl, ctaText, screenshotUrl, screenshotAlt, reverse, accentColor }) => {
    const accentBg = accentColor === 'blue' ? 'bg-blue-500/15' : 'bg-purple-500/15';

    const screenshotComponent = (
        <div className="relative group w-full">
            <div className={`absolute -inset-3 ${accentBg} rounded-2xl transform ${reverse ? 'rotate-2' : '-rotate-2'} group-hover:rotate-0 transition-transform duration-500`}></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white aspect-video flex items-center justify-center group-hover:scale-[1.01] transition-transform">
                <img
                    src={screenshotUrl}
                    alt={screenshotAlt}
                    loading="lazy"
                    className="w-full h-full object-cover object-top"
                />
                {ctaUrl && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                        <span className="bg-white text-gray-900 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            Ver sitio en vivo <ExternalLink size={12} />
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    const wrappedScreenshot = ctaUrl ? (
        <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="block">
            {screenshotComponent}
        </a>
    ) : screenshotComponent;

    return (
        <div className={`grid lg:grid-cols-2 gap-10 lg:gap-12 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
            {wrappedScreenshot}
            <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {badges.map((b, i) => (
                        <span key={i} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${b.color}`}>
                            {b.label}
                        </span>
                    ))}
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">{title}</h3>
                <p className="text-gray-600 text-base md:text-lg mb-6 leading-relaxed">{description}</p>
                <div className="flex flex-wrap gap-2 mb-7">
                    {tags.map((t, i) => (
                        <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700">
                            <span className="text-tenri-600">{t.icon}</span>
                            {t.text}
                        </div>
                    ))}
                </div>
                {ctaUrl && (
                    <a
                        href={ctaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-tenri-900 text-white px-6 py-3 rounded-xl hover:bg-tenri-800 transition-colors font-bold shadow-sm hover:shadow-md group"
                    >
                        {ctaText || 'Visitar sitio'}
                        <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                )}
            </div>
        </div>
    );
};

const DesarrolloIllustration = () => (
    <svg viewBox="0 0 400 300" className="w-full h-full p-8" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bgDesa" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dbeafe" />
                <stop offset="100%" stopColor="#bfdbfe" />
            </linearGradient>
        </defs>

        <rect x="40" y="30" width="320" height="220" rx="14" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />

        <rect x="40" y="30" width="320" height="32" rx="14" fill="#f3f4f6" />
        <rect x="40" y="48" width="320" height="14" fill="#f3f4f6" />
        <circle cx="58" cy="46" r="4" fill="#ef4444" />
        <circle cx="72" cy="46" r="4" fill="#f59e0b" />
        <circle cx="86" cy="46" r="4" fill="#10b981" />

        <rect x="60" y="80" width="140" height="10" rx="3" fill="#3b82f6" />
        <rect x="60" y="98" width="220" height="6" rx="2" fill="#cbd5e1" />
        <rect x="60" y="110" width="200" height="6" rx="2" fill="#cbd5e1" />
        <rect x="60" y="122" width="180" height="6" rx="2" fill="#cbd5e1" />

        <rect x="60" y="150" width="130" height="80" rx="8" fill="url(#bgDesa)" />
        <rect x="80" y="170" width="40" height="6" rx="2" fill="#3b82f6" />
        <rect x="80" y="184" width="80" height="4" rx="2" fill="#94a3b8" />
        <rect x="80" y="194" width="60" height="4" rx="2" fill="#94a3b8" />
        <rect x="80" y="208" width="50" height="12" rx="4" fill="#3b82f6" />

        <rect x="210" y="150" width="130" height="80" rx="8" fill="#eff6ff" />
        <rect x="230" y="170" width="40" height="6" rx="2" fill="#1e40af" />
        <g transform="translate(230, 188)">
            <rect x="0" y="0" width="6" height="32" rx="2" fill="#3b82f6" opacity="0.4" />
            <rect x="12" y="8" width="6" height="24" rx="2" fill="#3b82f6" opacity="0.6" />
            <rect x="24" y="4" width="6" height="28" rx="2" fill="#3b82f6" opacity="0.7" />
            <rect x="36" y="14" width="6" height="18" rx="2" fill="#3b82f6" opacity="0.5" />
            <rect x="48" y="2" width="6" height="30" rx="2" fill="#3b82f6" />
            <rect x="60" y="10" width="6" height="22" rx="2" fill="#3b82f6" opacity="0.7" />
            <rect x="72" y="6" width="6" height="26" rx="2" fill="#3b82f6" opacity="0.8" />
        </g>

        <g transform="translate(320, 245)">
            <circle r="20" fill="#3b82f6" />
            <text x="0" y="5" textAnchor="middle" fontSize="20" fill="white" fontWeight="bold">{'</>'}</text>
        </g>
    </svg>
);

const RedesIllustration = () => (
    <svg viewBox="0 0 400 300" className="w-full h-full p-8" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bgRedes" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3e8ff" />
                <stop offset="100%" stopColor="#e9d5ff" />
            </linearGradient>
        </defs>

        <rect x="0" y="0" width="400" height="300" rx="14" fill="url(#bgRedes)" />

        <line x1="200" y1="80" x2="100" y2="180" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        <line x1="200" y1="80" x2="200" y2="180" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        <line x1="200" y1="80" x2="300" y2="180" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        <line x1="100" y1="180" x2="60" y2="240" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
        <line x1="100" y1="180" x2="140" y2="240" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
        <line x1="300" y1="180" x2="260" y2="240" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
        <line x1="300" y1="180" x2="340" y2="240" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />

        <g transform="translate(200, 80)">
            <circle r="28" fill="white" stroke="#a855f7" strokeWidth="2" />
            <circle r="20" fill="#a855f7" />
            <rect x="-10" y="-2" width="20" height="6" rx="1" fill="white" />
            <rect x="-10" y="-10" width="20" height="6" rx="1" fill="white" />
            <circle cx="-5" cy="1" r="1" fill="#a855f7" />
            <circle cx="-5" cy="-7" r="1" fill="#a855f7" />
        </g>

        <g transform="translate(100, 180)">
            <rect x="-22" y="-16" width="44" height="32" rx="6" fill="white" stroke="#a855f7" strokeWidth="2" />
            <rect x="-15" y="-9" width="30" height="3" rx="1" fill="#a855f7" />
            <rect x="-15" y="-3" width="30" height="3" rx="1" fill="#a855f7" opacity="0.6" />
            <rect x="-15" y="3" width="30" height="3" rx="1" fill="#a855f7" opacity="0.4" />
            <circle cx="0" cy="11" r="2" fill="#10b981" />
        </g>

        <g transform="translate(200, 180)">
            <rect x="-22" y="-16" width="44" height="32" rx="6" fill="white" stroke="#a855f7" strokeWidth="2" />
            <rect x="-15" y="-9" width="30" height="3" rx="1" fill="#a855f7" />
            <rect x="-15" y="-3" width="30" height="3" rx="1" fill="#a855f7" opacity="0.6" />
            <rect x="-15" y="3" width="30" height="3" rx="1" fill="#a855f7" opacity="0.4" />
            <circle cx="0" cy="11" r="2" fill="#10b981" />
        </g>

        <g transform="translate(300, 180)">
            <rect x="-22" y="-16" width="44" height="32" rx="6" fill="white" stroke="#a855f7" strokeWidth="2" />
            <rect x="-15" y="-9" width="30" height="3" rx="1" fill="#a855f7" />
            <rect x="-15" y="-3" width="30" height="3" rx="1" fill="#a855f7" opacity="0.6" />
            <rect x="-15" y="3" width="30" height="3" rx="1" fill="#a855f7" opacity="0.4" />
            <circle cx="0" cy="11" r="2" fill="#10b981" />
        </g>

        <g transform="translate(60, 240)">
            <rect x="-12" y="-12" width="24" height="20" rx="2" fill="white" stroke="#a855f7" strokeWidth="2" />
            <rect x="-12" y="-12" width="24" height="6" rx="2" fill="#a855f7" />
        </g>
        <g transform="translate(140, 240)">
            <rect x="-12" y="-12" width="24" height="20" rx="2" fill="white" stroke="#a855f7" strokeWidth="2" />
            <rect x="-12" y="-12" width="24" height="6" rx="2" fill="#a855f7" />
        </g>
        <g transform="translate(260, 240)">
            <rect x="-12" y="-12" width="24" height="20" rx="2" fill="white" stroke="#a855f7" strokeWidth="2" />
            <rect x="-12" y="-12" width="24" height="6" rx="2" fill="#a855f7" />
        </g>
        <g transform="translate(340, 240)">
            <rect x="-12" y="-12" width="24" height="20" rx="2" fill="white" stroke="#a855f7" strokeWidth="2" />
            <rect x="-12" y="-12" width="24" height="6" rx="2" fill="#a855f7" />
        </g>

        <circle cx="150" cy="135" r="3" fill="#10b981">
            <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="115" r="3" fill="#10b981">
            <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <circle cx="250" cy="135" r="3" fill="#10b981">
            <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
        </circle>
    </svg>
);

const SeguridadIllustration = () => (
    <svg viewBox="0 0 400 300" className="w-full h-full p-8" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bgSec" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dcfce7" />
                <stop offset="100%" stopColor="#bbf7d0" />
            </linearGradient>
        </defs>

        <rect x="0" y="0" width="400" height="300" rx="14" fill="url(#bgSec)" />

        <g transform="translate(80, 80)">
            <ellipse cx="0" cy="0" rx="40" ry="22" fill="white" stroke="#10b981" strokeWidth="2" />
            <circle cx="-10" cy="0" r="14" fill="#10b981" />
            <circle cx="-10" cy="0" r="8" fill="#064e3b" />
            <circle cx="-10" cy="0" r="3" fill="white" />
            <rect x="-2" y="-3" width="20" height="6" rx="1" fill="#10b981" opacity="0.4" />
            <line x1="0" y1="20" x2="0" y2="40" stroke="#10b981" strokeWidth="3" />
            <line x1="-10" y1="40" x2="10" y2="40" stroke="#10b981" strokeWidth="3" />

            <path d="M 30 -10 Q 60 -10 60 10" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" opacity="0.6">
                <animate attributeName="stroke-dashoffset" values="0;-16" dur="1s" repeatCount="indefinite" />
            </path>
            <path d="M 30 -5 Q 50 -5 50 10" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" opacity="0.4">
                <animate attributeName="stroke-dashoffset" values="0;-16" dur="1s" repeatCount="indefinite" />
            </path>
        </g>

        <g transform="translate(320, 80)">
            <ellipse cx="0" cy="0" rx="40" ry="22" fill="white" stroke="#10b981" strokeWidth="2" />
            <circle cx="10" cy="0" r="14" fill="#10b981" />
            <circle cx="10" cy="0" r="8" fill="#064e3b" />
            <circle cx="10" cy="0" r="3" fill="white" />
            <rect x="-18" y="-3" width="20" height="6" rx="1" fill="#10b981" opacity="0.4" />
            <line x1="0" y1="20" x2="0" y2="40" stroke="#10b981" strokeWidth="3" />
            <line x1="-10" y1="40" x2="10" y2="40" stroke="#10b981" strokeWidth="3" />

            <path d="M -30 -10 Q -60 -10 -60 10" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" opacity="0.6">
                <animate attributeName="stroke-dashoffset" values="0;16" dur="1s" repeatCount="indefinite" />
            </path>
        </g>

        <g transform="translate(200, 200)">
            <rect x="-90" y="-50" width="180" height="100" rx="12" fill="white" stroke="#10b981" strokeWidth="2" />

            <rect x="-90" y="-50" width="180" height="20" rx="12" fill="#10b981" />
            <rect x="-90" y="-38" width="180" height="8" fill="#10b981" />
            <circle cx="-78" cy="-40" r="2" fill="white" />
            <circle cx="-70" cy="-40" r="2" fill="white" />
            <circle cx="-62" cy="-40" r="2" fill="white" />

            <rect x="-80" y="-20" width="76" height="58" rx="4" fill="#064e3b" />
            <rect x="4" y="-20" width="76" height="58" rx="4" fill="#064e3b" />

            <text x="-42" y="14" textAnchor="middle" fontSize="9" fill="#10b981" fontFamily="monospace">CAM 01</text>
            <text x="42" y="14" textAnchor="middle" fontSize="9" fill="#10b981" fontFamily="monospace">CAM 02</text>

            <circle cx="-74" cy="-15" r="2" fill="#ef4444">
                <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="10" cy="-15" r="2" fill="#ef4444">
                <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
            </circle>
        </g>

        <g transform="translate(200, 60)">
            <path d="M 0 -25 L -20 -10 L -20 15 Q -20 35 0 40 Q 20 35 20 15 L 20 -10 Z" fill="#10b981" />
            <path d="M -8 5 L -3 10 L 8 -3" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
    </svg>
);

export default Servicios;
