import React, { useState, useEffect } from 'react';
import { ArrowRight, Server, ShieldCheck, Code, Activity, Database, Monitor, ShoppingCart, Star, CheckCircle, Sparkles, Lock, Package, ArrowUpRight, Zap, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../api/constants';

const ERP_URL = 'https://erp.tenri.cl';

const Home = () => {
    const { user } = useAuth();
    const [productosDestacados, setProductosDestacados] = useState([]);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/products');
                const hardwareOnly = (data || []).filter(p => !p.is_service).slice(0, 4);
                setProductosDestacados(hardwareOnly);
            } catch (error) {
                console.error("Error cargando productos home:", error);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (!user) {
            setSubscriptionStatus(null);
            return;
        }

        let cancelled = false;
        const fetchStatus = async () => {
            try {
                const { data } = await api.get('/profile/subscription');
                if (!cancelled) setSubscriptionStatus(data);
            } catch (error) {
                if (!cancelled) setSubscriptionStatus({ status: 'inactive' });
            }
        };
        fetchStatus();
        return () => { cancelled = true; };
    }, [user]);

    const tienesSuscripcionActiva = subscriptionStatus?.status === 'active';
    const esAdmin = Number(user?.role_id) === 1;
    const puedeAccederERP = esAdmin || tienesSuscripcionActiva;

    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            const cover = product.images.find(img => Boolean(img.is_cover)) || product.images[0];
            return `${BASE_URL}${cover.url}`;
        }
        return null;
    };

    return (
        <div className="bg-white min-h-screen">

            <section className="relative bg-tenri-900 text-white pt-32 pb-28 px-4 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tenri-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10"></div>

                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}></div>

                <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="space-y-7">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-tenri-500/30 text-tenri-300 text-xs font-bold uppercase tracking-widest">
                            <Sparkles size={12} /> Tecnología para empresas modernas
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                            Soluciones digitales <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-tenri-300 to-blue-400">
                                a tu medida.
                            </span>
                        </h1>
                        <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
                            Desde sistemas ERP contables hasta infraestructura de redes y seguridad.
                            Centralizamos la tecnología de tu negocio en un solo lugar.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Link to="/catalogo" className="bg-tenri-300 hover:bg-white hover:text-tenri-900 text-tenri-900 font-bold py-3.5 px-7 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-tenri-300/40 group">
                                Ver Catálogo
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/contacto" className="border border-tenri-500/40 hover:border-white hover:bg-white/5 text-white font-semibold py-3.5 px-7 rounded-xl transition-all text-center">
                                Cotizar Ahora
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 text-xs text-gray-400">
                            <div className="flex items-center gap-2">
                                <Lock size={14} className="text-tenri-300" />
                                <span>Webpay Verified</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={14} className="text-tenri-300" />
                                <span>Certificado SII</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star size={14} className="text-tenri-300" />
                                <span>Soporte 24/7</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="absolute -inset-1 bg-gradient-to-r from-tenri-300 to-blue-600 rounded-2xl blur opacity-20"></div>
                        <div className="relative bg-tenri-900 rounded-2xl p-6 border border-tenri-500/30 shadow-2xl font-mono text-sm">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <span className="text-gray-400 text-xs">root@tenri-server:~</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <span className="text-green-400">➜</span>
                                    <span className="text-white">check status --all</span>
                                </div>
                                <div className="pl-4 space-y-2 text-gray-300">
                                    <div className="flex justify-between"><span>[ Database ]</span><span className="text-green-400">Connected (12ms)</span></div>
                                    <div className="flex justify-between"><span>[ API Gateway ]</span><span className="text-green-400">Online</span></div>
                                    <div className="flex justify-between"><span>[ Security ]</span><span className="text-blue-400">Firewall Active</span></div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-800">
                                    <p className="text-xs text-gray-500 mb-1">CPU Load</p>
                                    <div className="flex items-end gap-1 h-8">
                                        <div className="w-1 bg-tenri-500 h-[40%]"></div>
                                        <div className="w-1 bg-tenri-500 h-[60%]"></div>
                                        <div className="w-1 bg-tenri-500 h-[30%]"></div>
                                        <div className="w-1 bg-tenri-500 h-[80%]"></div>
                                        <div className="w-1 bg-tenri-500 h-[50%]"></div>
                                        <div className="w-1 bg-tenri-500 h-[70%]"></div>
                                        <div className="w-1 bg-tenri-500 h-[45%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="bg-tenri-800 border-y border-tenri-700/50">
                <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    <StatItem icon={<Zap />} number="100%" label="Dedicación" />
                    <StatItem icon={<Activity />} number="24/7" label="Monitoreo" />
                    <StatItem icon={<Star />} number="+2 años" label="Experiencia" />
                    <StatItem icon={<Layers />} number="Personalizado" label="Soporte" />
                </div>
            </div>

            <section className="py-20 md:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14 md:mb-16">
                        <span className="inline-block text-xs font-black uppercase tracking-widest text-tenri-600 bg-tenri-50 px-3 py-1 rounded-full mb-4 border border-tenri-100">
                            Servicios
                        </span>
                        <h2 className="text-tenri-900 text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
                            Nuestras Soluciones
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                            Cubrimos todo el ciclo tecnológico de tu empresa, desde la instalación de cables hasta el software de gestión.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        <ServiceCard
                            icon={<Code size={32} />}
                            title="Desarrollo Web & Apps"
                            desc="Sitios corporativos, tiendas e-commerce y aplicaciones web a medida."
                            link="/servicios"
                            bullets={['React + Laravel', 'Hosting incluido', 'SEO optimizado']}
                        />
                        <ServiceCard
                            icon={<Server size={32} />}
                            title="Redes e Infraestructura"
                            desc="Cableado estructurado, servidores y routers MikroTik."
                            link="/servicios"
                            bullets={['Certificación CAT6', 'VPN empresarial', 'Configuración remota']}
                            featured
                        />
                        <ServiceCard
                            icon={<ShieldCheck size={32} />}
                            title="Seguridad Electrónica"
                            desc="Cámaras CCTV, controles de acceso y monitoreo remoto."
                            link="/servicios"
                            bullets={['CCTV 4K + IP', 'Visualización móvil', 'Alarmas integradas']}
                        />
                    </div>
                </div>
            </section>

            <section className="py-20 md:py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-tenri-900 via-tenri-800 to-tenri-900 rounded-3xl p-8 md:p-14 lg:p-16 flex flex-col md:flex-row items-center gap-10 lg:gap-16 relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-96 h-96 bg-tenri-500 rounded-full opacity-10 blur-3xl"></div>
                        <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>

                        <div className="flex-1 relative z-10">
                            <span className="text-tenri-300 font-bold tracking-widest text-xs uppercase mb-3 block">
                                ✦ Producto Estrella
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
                                Tenri ERP Cloud
                            </h2>
                            <p className="text-gray-300 text-base md:text-lg mb-7 leading-relaxed max-w-xl">
                                Toma el control total de tu contabilidad, inventario y facturación. Sistema diseñado para PYMES chilenas.
                            </p>
                            <ul className="space-y-3 mb-8 text-gray-200">
                                <li className="flex items-center gap-3"><CheckCircle size={18} className="text-green-400 shrink-0" /> Facturación Electrónica SII</li>
                                <li className="flex items-center gap-3"><CheckCircle size={18} className="text-green-400 shrink-0" /> Control de Stock en tiempo real</li>
                                <li className="flex items-center gap-3"><CheckCircle size={18} className="text-green-400 shrink-0" /> Acceso desde cualquier lugar</li>
                                <li className="flex items-center gap-3"><CheckCircle size={18} className="text-green-400 shrink-0" /> Soporte prioritario 24/7</li>
                            </ul>

                            <ErpCallToAction
                                user={user}
                                puedeAcceder={puedeAccederERP}
                                erpUrl={ERP_URL}
                            />
                        </div>

                        <div className="flex-1 relative z-10 hidden md:block w-full">
                            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 p-5 rounded-2xl shadow-2xl">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/60"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/60"></div>
                                    </div>
                                    <span className="text-tenri-300 text-[10px] font-bold tracking-wider">ERP.TENRI.CL</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5">
                                        <div className="text-white">
                                            <p className="text-[10px] uppercase tracking-widest text-tenri-300 font-bold">Ventas hoy</p>
                                            <p className="text-2xl font-black mt-1">$2.450.000</p>
                                        </div>
                                        <div className="bg-green-500/20 text-green-300 text-[10px] px-2 py-1 rounded font-bold">+12.5%</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                            <p className="text-[10px] uppercase tracking-widest text-tenri-300 font-bold mb-1">Facturas</p>
                                            <p className="text-lg font-bold text-white">142</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                            <p className="text-[10px] uppercase tracking-widest text-tenri-300 font-bold mb-1">Clientes</p>
                                            <p className="text-lg font-bold text-white">87</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-[10px] uppercase tracking-widest text-tenri-300 font-bold mb-2">Stock crítico</p>
                                        <div className="flex items-end gap-1 h-12">
                                            {[60, 75, 45, 90, 55, 70, 80].map((h, i) => (
                                                <div key={i} className="flex-1 bg-tenri-400/40 rounded-t" style={{height: `${h}%`}}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {!loadingProducts && productosDestacados.length > 0 && (
                <section className="py-20 md:py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                            <div>
                                <span className="inline-block text-xs font-black uppercase tracking-widest text-tenri-600 bg-tenri-50 px-3 py-1 rounded-full mb-3 border border-tenri-100">
                                    Hardware
                                </span>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                                    Equipamiento profesional
                                </h2>
                                <p className="text-gray-600 max-w-xl">
                                    Seleccionado por expertos para tu infraestructura.
                                </p>
                            </div>
                            <Link to="/catalogo" className="self-start md:self-auto inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-tenri-300 px-5 py-2.5 rounded-xl font-bold text-sm text-gray-700 hover:text-tenri-900 transition-colors group">
                                Ver catálogo completo
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {productosDestacados.map((prod) => {
                                const stockActual = Number(prod.stock_current ?? 0);
                                const sinStock = stockActual <= 0;
                                const imagen = getProductImage(prod);

                                return (
                                    <Link
                                        to={`/item/product/${prod.id}`}
                                        key={prod.id}
                                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 group flex flex-col"
                                    >
                                        <div className="aspect-square bg-gray-50/50 flex items-center justify-center overflow-hidden p-4 relative">
                                            {imagen ? (
                                                <img
                                                    src={imagen}
                                                    alt={prod.name}
                                                    loading="lazy"
                                                    className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ${sinStock ? 'opacity-50 grayscale' : ''}`}
                                                />
                                            ) : (
                                                <Package size={48} className="text-gray-200" strokeWidth={1.5} />
                                            )}
                                            {sinStock && (
                                                <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider">
                                                    Agotado
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col flex-grow">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                                {prod.category?.name || 'General'}
                                            </span>
                                            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-3 min-h-[2.5rem] group-hover:text-tenri-700 transition-colors">
                                                {prod.name}
                                            </h3>
                                            <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
                                                <p className="text-lg md:text-xl font-black text-gray-900">
                                                    ${parseInt(prod.price).toLocaleString('es-CL')}
                                                </p>
                                                <div className="bg-tenri-50 text-tenri-700 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ShoppingCart size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            <section className="py-20 md:py-24 bg-white">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-10 md:p-16 text-center shadow-sm">
                        <span className="inline-block text-xs font-black uppercase tracking-widest text-tenri-600 bg-tenri-50 px-3 py-1 rounded-full mb-5 border border-tenri-100">
                            ¿Listo para empezar?
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight">
                            Conversemos sobre tu negocio
                        </h2>
                        <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                            Te ayudamos a elegir la solución correcta para tu empresa.
                            Sin compromiso, sin letra chica.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to="/contacto"
                                className="bg-tenri-900 hover:bg-tenri-800 text-white font-bold py-3.5 px-7 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group"
                            >
                                Hablar con un especialista
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/catalogo"
                                className="bg-white border border-gray-200 hover:border-tenri-300 text-gray-700 hover:text-tenri-900 font-bold py-3.5 px-7 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                Explorar catálogo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ErpCallToAction = ({ user, puedeAcceder, erpUrl }) => {
    if (!user) {
        return (
            <div className="flex flex-col sm:flex-row gap-3">
                <Link
                    to="/login"
                    className="bg-white text-tenri-900 font-bold py-3.5 px-7 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg group"
                >
                    Iniciar Sesión
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                    to="/catalogo"
                    className="border border-white/30 hover:bg-white/10 text-white font-bold py-3.5 px-7 rounded-xl transition-colors text-center"
                >
                    Ver Planes
                </Link>
            </div>
        );
    }

    if (puedeAcceder) {
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-emerald-300 font-bold mb-1">
                    <CheckCircle size={16} />
                    Tu suscripción está activa
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <a
                        href={erpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-tenri-900 font-bold py-3.5 px-7 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg group"
                    >
                        Acceder al ERP
                        <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                    <Link
                        to="/perfil"
                        className="border border-white/30 hover:bg-white/10 text-white font-bold py-3.5 px-7 rounded-xl transition-colors text-center"
                    >
                        Ver mi cuenta
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-amber-300 font-bold mb-1">
                <Lock size={16} />
                Necesitas una licencia activa para acceder
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <Link
                    to="/catalogo"
                    className="bg-white text-tenri-900 font-bold py-3.5 px-7 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg group"
                >
                    Comprar Licencia
                    <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                </Link>
                <Link
                    to="/contacto"
                    className="border border-white/30 hover:bg-white/10 text-white font-bold py-3.5 px-7 rounded-xl transition-colors text-center"
                >
                    Solicitar Cotización
                </Link>
            </div>
        </div>
    );
};

const StatItem = ({ icon, number, label }) => (
    <div className="flex flex-col items-center text-center text-white">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-tenri-300 mb-3">
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className="text-2xl md:text-3xl font-black text-white tracking-tight">{number}</span>
        <span className="text-[10px] md:text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">{label}</span>
    </div>
);

const ServiceCard = ({ icon, title, desc, link, bullets = [], featured = false }) => (
    <Link
        to={link}
        className={`relative bg-white p-7 md:p-8 rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col ${featured ? 'border-tenri-300 ring-2 ring-tenri-100' : 'border-gray-100 hover:border-gray-200'}`}
    >
        {featured && (
            <span className="absolute top-4 right-4 bg-tenri-900 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                Más Solicitado
            </span>
        )}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors ${featured ? 'bg-tenri-900 text-white' : 'bg-blue-50 text-tenri-500 group-hover:bg-tenri-500 group-hover:text-white'}`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-5 leading-relaxed text-sm">{desc}</p>

        {bullets.length > 0 && (
            <ul className="space-y-2 mb-6">
                {bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                        {b}
                    </li>
                ))}
            </ul>
        )}

        <span className="mt-auto text-tenri-600 font-bold flex items-center gap-2 text-sm group-hover:gap-3 transition-all">
            Más información <ArrowRight size={14} />
        </span>
    </Link>
);

export default Home;
