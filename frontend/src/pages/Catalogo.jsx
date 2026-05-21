import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, ShoppingCart, Filter, Box, ChevronDown, ArrowUpDown, Loader2,
    Briefcase, CheckCircle, X, Package, Sparkles, Tag, AlertTriangle, Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axiosConfig';
import { BASE_URL } from '../api/constants';

const TIPO_FILTROS = [
    { value: 'all',      label: 'Todo',       icon: Sparkles },
    { value: 'product',  label: 'Productos',  icon: Package },
    { value: 'service',  label: 'Servicios',  icon: Briefcase },
];

const STOCK_CRITICO = 3;

const Catalogo = () => {
    const [items, setItems] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroCategoria, setFiltroCategoria] = useState("all");
    const [filtroTipo, setFiltroTipo] = useState("all");
    const [busqueda, setBusqueda] = useState("");
    const [orden, setOrden] = useState("relevantes");
    const [mostrarSidebarMobile, setMostrarSidebarMobile] = useState(false);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const [prodRes, servRes, catRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/services/catalog'),
                    api.get('/categories').catch(() => ({ data: [] })),
                ]);

                const productosNormalizados = (prodRes.data || []).map(p => ({
                    ...p,
                    type: 'product',
                    is_service: false,
                }));

                const serviciosNormalizados = (servRes.data || []).map(s => ({
                    ...s,
                    type: 'service',
                    is_service: true,
                    stock_current: 9999,
                    category: { name: 'Servicios', slug: '__services__' },
                }));

                setItems([...productosNormalizados, ...serviciosNormalizados]);
                setCategorias(catRes.data || []);
            } catch (error) {
                console.error("Error cargando catálogo:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCatalog();
    }, []);

    const itemsProcesados = useMemo(() => {
        const queryNormalizada = busqueda.trim().toLowerCase();

        return items
            .filter(item => {
                if (filtroTipo !== 'all' && item.type !== filtroTipo) return false;

                if (filtroCategoria !== 'all') {
                    if (filtroCategoria === '__services__' && !item.is_service) return false;
                    if (filtroCategoria !== '__services__' && Number(item.category?.id) !== Number(filtroCategoria)) return false;
                }

                if (queryNormalizada) {
                    const enNombre = item.name?.toLowerCase().includes(queryNormalizada);
                    const enSku = item.sku?.toLowerCase().includes(queryNormalizada);
                    if (!enNombre && !enSku) return false;
                }

                return true;
            })
            .sort((a, b) => {
                const precioA = parseInt(a.price);
                const precioB = parseInt(b.price);

                if (orden === "menor_mayor") return precioA - precioB;
                if (orden === "mayor_menor") return precioB - precioA;
                if (orden === "alfabetico")  return a.name.localeCompare(b.name);

                if (a.is_service && !b.is_service) return -1;
                if (!a.is_service && b.is_service) return 1;
                return (b.stock_current > 0) - (a.stock_current > 0);
            });
    }, [items, filtroTipo, filtroCategoria, busqueda, orden]);

    const conteoTotalPorCategoria = useMemo(() => {
        const counts = { all: 0 };
        items.forEach(item => {
            if (filtroTipo !== 'all' && item.type !== filtroTipo) return;
            counts.all += 1;
            const key = item.is_service ? '__services__' : item.category?.id;
            if (key !== undefined && key !== null) {
                counts[key] = (counts[key] || 0) + 1;
            }
        });
        return counts;
    }, [items, filtroTipo]);

    const tieneFiltrosActivos = filtroCategoria !== 'all' || filtroTipo !== 'all' || busqueda.trim() !== '';

    const limpiarFiltros = () => {
        setFiltroCategoria('all');
        setFiltroTipo('all');
        setBusqueda('');
    };

    const nombreCategoriaActiva = useMemo(() => {
        if (filtroCategoria === 'all') return null;
        if (filtroCategoria === '__services__') return 'Servicios';
        const cat = categorias.find(c => Number(c.id) === Number(filtroCategoria));
        return cat?.name || null;
    }, [filtroCategoria, categorias]);

    return (
        <div className="bg-gray-50 min-h-screen pt-20">

            <section className="bg-gradient-to-br from-tenri-900 via-tenri-800 to-tenri-900 text-white py-16 md:py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-tenri-300 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-tenri-400 rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest text-tenri-200 mb-6 border border-white/10">
                        <Sparkles size={12} /> Catálogo Tenri
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        Soluciones <span className="text-tenri-300">profesionales</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Hardware certificado y planes de servicio diseñados para empresas chilenas.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                    <aside className={`lg:w-72 flex-shrink-0 ${mostrarSidebarMobile ? 'fixed inset-0 z-50 bg-black/50 lg:bg-transparent lg:static lg:inset-auto lg:z-auto' : 'hidden lg:block'}`}>
                        <div className={`${mostrarSidebarMobile ? 'absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-6 overflow-y-auto custom-scrollbar' : 'sticky top-28'}`}>

                            {mostrarSidebarMobile && (
                                <div className="flex justify-between items-center mb-6 lg:hidden">
                                    <h3 className="font-black text-gray-900 text-lg">Filtros</h3>
                                    <button onClick={() => setMostrarSidebarMobile(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                        <X size={20} />
                                    </button>
                                </div>
                            )}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Tag size={12} /> Tipo
                                </h4>
                                <div className="space-y-1">
                                    {TIPO_FILTROS.map(tipo => {
                                        const Icon = tipo.icon;
                                        const activo = filtroTipo === tipo.value;
                                        return (
                                            <button
                                                key={tipo.value}
                                                onClick={() => setFiltroTipo(tipo.value)}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2.5 ${activo ? 'bg-tenri-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <Icon size={16} className={activo ? 'text-tenri-300' : 'text-gray-400'} />
                                                {tipo.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Filter size={12} /> Categorías
                                </h4>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setFiltroCategoria('all')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${filtroCategoria === 'all' ? 'bg-tenri-50 text-tenri-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <span>Todas</span>
                                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{conteoTotalPorCategoria.all || 0}</span>
                                    </button>

                                    {filtroTipo !== 'product' && (
                                        <button
                                            onClick={() => setFiltroCategoria('__services__')}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${filtroCategoria === '__services__' ? 'bg-tenri-50 text-tenri-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Briefcase size={12} className="text-tenri-400" />
                                                Servicios
                                            </span>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{conteoTotalPorCategoria.__services__ || 0}</span>
                                        </button>
                                    )}

                                    {filtroTipo !== 'service' && categorias.map(cat => {
                                        const count = conteoTotalPorCategoria[cat.id] || 0;
                                        if (count === 0) return null;
                                        const activo = Number(filtroCategoria) === Number(cat.id);
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFiltroCategoria(cat.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${activo ? 'bg-tenri-50 text-tenri-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <span className="truncate">{cat.name}</span>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-2 shrink-0">{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {tieneFiltrosActivos && (
                                <button
                                    onClick={limpiarFiltros}
                                    className="mt-4 w-full text-xs font-bold text-gray-500 hover:text-tenri-900 py-2.5 border border-gray-200 hover:border-tenri-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <X size={14} /> Limpiar filtros
                                </button>
                            )}
                        </div>
                    </aside>

                    <div className="flex-1 min-w-0">

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o SKU..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-tenri-300 focus:border-transparent outline-none text-sm font-medium transition-all"
                                />
                                {busqueda && (
                                    <button
                                        onClick={() => setBusqueda('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2 items-center">
                                <button
                                    onClick={() => setMostrarSidebarMobile(true)}
                                    className="lg:hidden flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 transition-colors"
                                >
                                    <Filter size={16} /> Filtros
                                    {tieneFiltrosActivos && <span className="w-2 h-2 rounded-full bg-tenri-500"></span>}
                                </button>

                                <div className="relative">
                                    <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <select
                                        value={orden}
                                        onChange={(e) => setOrden(e.target.value)}
                                        className="appearance-none pl-9 pr-8 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-tenri-300 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <option value="relevantes">Relevancia</option>
                                        <option value="menor_mayor">Menor precio</option>
                                        <option value="mayor_menor">Mayor precio</option>
                                        <option value="alfabetico">A → Z</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {tieneFiltrosActivos && !loading && (
                            <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
                                <span className="text-gray-500 font-medium">Filtros:</span>
                                {filtroTipo !== 'all' && (
                                    <button onClick={() => setFiltroTipo('all')} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-tenri-300 px-3 py-1 rounded-full text-xs font-bold text-gray-700 hover:text-tenri-900 transition-colors">
                                        {TIPO_FILTROS.find(t => t.value === filtroTipo)?.label}
                                        <X size={12} />
                                    </button>
                                )}
                                {nombreCategoriaActiva && (
                                    <button onClick={() => setFiltroCategoria('all')} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-tenri-300 px-3 py-1 rounded-full text-xs font-bold text-gray-700 hover:text-tenri-900 transition-colors">
                                        {nombreCategoriaActiva}
                                        <X size={12} />
                                    </button>
                                )}
                                {busqueda.trim() && (
                                    <button onClick={() => setBusqueda('')} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-tenri-300 px-3 py-1 rounded-full text-xs font-bold text-gray-700 hover:text-tenri-900 transition-colors">
                                        "{busqueda.trim()}"
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        )}

                        {!loading && (
                            <div className="flex items-baseline justify-between mb-4">
                                <p className="text-sm text-gray-500">
                                    {itemsProcesados.length === 0
                                        ? 'Sin resultados'
                                        : <>Mostrando <span className="font-bold text-gray-900">{itemsProcesados.length}</span> {itemsProcesados.length === 1 ? 'resultado' : 'resultados'}</>
                                    }
                                </p>
                            </div>
                        )}

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : itemsProcesados.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {itemsProcesados.map(item => (
                                    <ProductCard key={`${item.type}-${item.id}`} producto={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16 px-6">
                                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Box size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-1">No encontramos resultados</h3>
                                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                    {busqueda.trim()
                                        ? `Probá con otros términos o quitá algunos filtros para ampliar tu búsqueda.`
                                        : 'No hay productos que coincidan con los filtros aplicados.'}
                                </p>
                                {tieneFiltrosActivos && (
                                    <button onClick={limpiarFiltros} className="inline-flex items-center gap-2 bg-tenri-900 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-tenri-800 transition-colors text-sm">
                                        <X size={14} /> Limpiar filtros
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-100"></div>
        <div className="p-5 space-y-3">
            <div className="h-4 bg-gray-100 rounded w-24"></div>
            <div className="h-5 bg-gray-100 rounded w-3/4"></div>
            <div className="h-5 bg-gray-100 rounded w-1/2"></div>
            <div className="flex items-center justify-between pt-3">
                <div className="h-7 bg-gray-100 rounded w-1/3"></div>
                <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
            </div>
        </div>
    </div>
);

const ProductCard = ({ producto }) => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [agregado, setAgregado] = useState(false);

    const stockActual = producto.is_service ? null : Number(producto.stock_current ?? 0);
    const sinStock = !producto.is_service && stockActual <= 0;
    const stockCritico = !producto.is_service && stockActual > 0 && stockActual <= STOCK_CRITICO;

    const goToDetail = () => {
        navigate(`/item/${producto.is_service ? 'service' : 'product'}/${producto.id}`);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (sinStock) return;

        if (producto.is_service) {
            addToCart({
                id: `service-${producto.id}`,
                name: producto.name,
                price: producto.price,
                image: null,
                is_service: true,
                type: 'service',
                duration: producto.duration_days
            });
        } else {
            addToCart(producto);
        }

        setAgregado(true);
        setTimeout(() => setAgregado(false), 1800);
    };

    const renderImage = () => {
        if (producto.is_service) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-tenri-50 to-tenri-100/50 text-tenri-900 p-6 text-center">
                    <Briefcase size={56} className="mb-3 opacity-80" strokeWidth={1.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-tenri-500">Plan de Servicio</span>
                </div>
            );
        }

        const imagenes = producto.images || [];
        const cover = imagenes.find(img => Boolean(img.is_cover)) || imagenes[0];

        if (!cover) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300 p-6">
                    <Package size={56} strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Sin imagen</span>
                </div>
            );
        }

        return (
            <img
                src={`${BASE_URL}${cover.url}`}
                alt={producto.name}
                loading="lazy"
                className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-4 ${sinStock ? 'opacity-50 grayscale' : ''}`}
            />
        );
    };

    return (
        <article
            onClick={goToDetail}
            className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 group flex flex-col h-full relative cursor-pointer hover:shadow-lg hover:border-gray-200 ${producto.is_service ? 'border-tenri-100' : 'border-gray-100'}`}
        >
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                {producto.is_service && (
                    <span className="bg-tenri-900 text-white px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">
                        Suscripción
                    </span>
                )}
                {stockCritico && (
                    <span className="bg-amber-500 text-white px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <AlertTriangle size={10} /> Últimas {stockActual}
                    </span>
                )}
            </div>

            <div className="relative aspect-square overflow-hidden bg-gray-50/50 flex items-center justify-center">
                {renderImage()}

                {sinStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                        <span className="text-red-600 font-black border-2 border-red-600 px-4 py-1.5 rounded uppercase tracking-widest text-xs rotate-[-8deg] bg-white/90">
                            Agotado
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4 md:p-5 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 truncate">
                        {producto.category?.name || 'General'}
                    </span>
                    {!producto.is_service && !sinStock && !stockCritico && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            En stock
                        </span>
                    )}
                </div>

                <h3 className="font-black text-gray-900 text-base mb-3 leading-snug group-hover:text-tenri-700 transition-colors line-clamp-2 min-h-[2.6rem]">
                    {producto.name}
                </h3>

                {producto.is_service && producto.features?.length > 0 && (
                    <div className="mb-3 space-y-1.5">
                        {producto.features.slice(0, 2).map((f, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                <CheckCircle size={11} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{f}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-auto pt-3 flex items-end justify-between border-t border-gray-100">
                    <div className="flex flex-col min-w-0">
                        {producto.is_service && producto.price_label ? (
                            <>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Desde</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl md:text-2xl font-black text-gray-900">
                                        {producto.price_label}
                                    </span>
                                </div>

                            </>
                        ) : (
                            <>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Desde</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl md:text-2xl font-black text-gray-900">
                                        ${parseInt(producto.price).toLocaleString('es-CL')}
                                    </span>
                                    {producto.duration_days && (
                                        <span className="text-xs text-gray-500 font-medium">
                                            /{producto.duration_days === 30 ? 'mes' : producto.duration_days === 365 ? 'año' : `${producto.duration_days}d`}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={sinStock}
                        className={`shrink-0 ml-2 rounded-xl px-3 py-2.5 flex items-center justify-center gap-1.5 font-bold text-xs transition-all shadow-sm ${
                            sinStock
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : agregado
                                    ? 'bg-emerald-500 text-white scale-105'
                                    : 'bg-tenri-900 text-white hover:bg-tenri-800 active:scale-95'
                        }`}
                        aria-label={`Agregar ${producto.name} al carrito`}
                    >
                        {agregado ? (
                            <>
                                <Check size={16} />
                                <span className="hidden sm:inline">Agregado</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={16} />
                                <span className="hidden sm:inline">Agregar</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </article>
    );
};

export default Catalogo;
