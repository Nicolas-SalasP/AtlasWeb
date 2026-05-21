import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import {
    ShoppingCart, ArrowLeft, CheckCircle, Package,
    Briefcase, ShieldCheck, Truck, Clock,
    ChevronRight, AlertCircle, Layers, Plus, Minus, AlertTriangle, Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BASE_URL } from '../api/constants';

const STOCK_CRITICO = 3;

const normalizeSpecs = (specs) => {
    if (!specs) return [];
    if (Array.isArray(specs)) return specs.map(s => String(s));
    if (typeof specs === 'object') {
        return Object.entries(specs).map(([k, v]) => `${k}: ${v}`);
    }
    return [];
};

const ItemDetail = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [item, setItem] = useState(null);
    const [relacionados, setRelacionados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [agregado, setAgregado] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchDetail = async () => {
            setLoading(true);
            setSelectedImage(0);
            setQuantity(1);

            try {
                let data = null;
                let productosLista = [];

                if (type === 'product') {
                    try {
                        const res = await api.get(`/products/${id}`);
                        data = res.data;
                        if (data) {
                            data.type = 'product';
                            data.is_service = false;
                        }
                    } catch (e) {
                        if (e.response?.status === 404) {
                            if (isMounted) toast.error("Producto no encontrado");
                            if (isMounted) navigate('/catalogo');
                            return;
                        }
                        throw e;
                    }

                    try {
                        const listaRes = await api.get('/products');
                        productosLista = listaRes.data || [];
                    } catch (e) {
                        productosLista = [];
                    }
                } else {
                    const res = await api.get('/services/catalog');
                    data = (res.data || []).find(s => Number(s.id) === Number(id));
                    if (data) {
                        data.type = 'service';
                        data.is_service = true;
                        data.stock_current = 9999;
                    }
                    if (!data) {
                        if (isMounted) toast.error("Servicio no encontrado");
                        if (isMounted) navigate('/catalogo');
                        return;
                    }
                }

                if (!isMounted) return;

                setItem(data);

                if (data && type === 'product' && data.category_id) {
                    const otros = productosLista
                        .filter(p => Number(p.id) !== Number(data.id) && Number(p.category_id) === Number(data.category_id))
                        .slice(0, 4);
                    setRelacionados(otros);
                } else {
                    setRelacionados([]);
                }
            } catch (error) {
                console.error("Error:", error);
                if (isMounted) toast.error("Error de conexión");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDetail();
        return () => { isMounted = false; };
    }, [type, id, navigate]);

    const detailsList = useMemo(() => {
        if (!item) return [];
        return item.is_service ? (item.features || []) : normalizeSpecs(item.specs);
    }, [item]);

    const handleIncrement = () => {
        if (!item) return;
        if (!item.is_service && quantity >= item.stock_current) {
            toast.error("No hay más stock disponible");
            return;
        }
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        if (!item) return;
        const itemToAdd = item.is_service ? {
            id: `service-${item.id}`,
            name: item.name,
            price: item.price,
            image: null,
            is_service: true,
            type: 'service',
            duration: item.duration_days
        } : item;

        addToCart(itemToAdd, quantity);
        setAgregado(true);
        toast.success(`${quantity} × ${item.name} agregado`);
        setTimeout(() => setAgregado(false), 2200);
    };

    if (loading) return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                    <div className="grid lg:grid-cols-2 gap-0">
                        <div className="aspect-square bg-gray-100"></div>
                        <div className="p-8 md:p-12 space-y-4">
                            <div className="h-8 bg-gray-100 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            <div className="h-24 bg-gray-100 rounded"></div>
                            <div className="h-32 bg-gray-100 rounded"></div>
                            <div className="h-16 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!item) return null;

    const images = item.images || [];
    const mainImage = item.is_service
        ? (item.image_url ? `${BASE_URL}${item.image_url}` : null)
        : (images.length > 0 ? `${BASE_URL}${images[selectedImage]?.url}` : null);

    const stockActual = item.is_service ? null : Number(item.stock_current ?? 0);
    const stockAlerta = item.is_service ? null : Number(item.stock_alert ?? 0);
    const sinStock = !item.is_service && stockActual <= 0;
    const stockCritico = !item.is_service && stockActual > 0 && stockActual <= STOCK_CRITICO;
    const stockBajo = !item.is_service && stockAlerta > 0 && stockActual > 0 && stockActual <= stockAlerta;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto">

                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
                    <button onClick={() => navigate('/catalogo')} className="hover:text-tenri-900 flex items-center gap-1 transition-colors font-medium">
                        <ArrowLeft size={14} /> Catálogo
                    </button>
                    <ChevronRight size={12} className="text-gray-300" />
                    <span>{item.is_service ? 'Servicios' : item.category?.name || 'Producto'}</span>
                    <ChevronRight size={12} className="text-gray-300" />
                    <span className="font-bold text-tenri-900 truncate max-w-[200px] sm:max-w-md">{item.name}</span>
                </nav>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="grid lg:grid-cols-5 gap-0">

                        <div className="lg:col-span-3 p-6 md:p-10 bg-gray-50/50 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
                            <div className="relative aspect-square rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-6 md:p-10 mb-4 overflow-hidden group">

                                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                    {item.is_service ? (
                                        <span className="bg-tenri-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                            <Layers size={11} /> Suscripción
                                        </span>
                                    ) : sinStock ? (
                                        <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                            <AlertCircle size={11} /> Agotado
                                        </span>
                                    ) : stockCritico ? (
                                        <span className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                            <AlertTriangle size={11} /> Últimas {stockActual}
                                        </span>
                                    ) : (
                                        <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                            <CheckCircle size={11} /> En stock
                                        </span>
                                    )}
                                </div>

                                {mainImage ? (
                                    <img src={mainImage} alt={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="text-gray-200 flex flex-col items-center gap-4">
                                        {item.is_service ? <Briefcase size={96} strokeWidth={1} /> : <Package size={96} strokeWidth={1} />}
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Sin imagen</span>
                                    </div>
                                )}
                            </div>

                            {!item.is_service && images.length > 1 && (
                                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 custom-scrollbar">
                                    {images.map((img, idx) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all bg-white ${selectedImage === idx ? 'border-tenri-900 ring-2 ring-tenri-200' : 'border-gray-100 hover:border-gray-300'}`}
                                        >
                                            <img src={`${BASE_URL}${img.url}`} className="w-full h-full object-cover" alt={`${item.name} - vista ${idx + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2 p-6 md:p-10 flex flex-col">

                            <div className="flex items-center gap-2 mb-3">
                                {item.category?.name && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-tenri-600 bg-tenri-50 px-2 py-1 rounded">
                                        {item.category.name}
                                    </span>
                                )}
                                {item.sku && (
                                    <span className="text-[10px] font-mono text-gray-400">
                                        {item.sku}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight">{item.name}</h1>

                            {item.description && (
                                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">{item.description}</p>
                            )}

                            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-5 mb-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Precio</p>
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-3xl md:text-4xl font-black text-tenri-900 tracking-tight">
                                        ${parseInt(item.price).toLocaleString('es-CL')}
                                    </span>
                                    {item.is_service && item.duration_days && (
                                        <span className="text-sm text-gray-500 font-bold">
                                            / {item.duration_days === 30 ? 'mes' : item.duration_days === 365 ? 'año' : `${item.duration_days} días`}
                                        </span>
                                    )}
                                </div>
                                {!item.is_service && stockBajo && !stockCritico && (
                                    <p className="text-xs text-amber-600 font-bold mt-2 flex items-center gap-1.5">
                                        <AlertTriangle size={12} /> Stock bajo: solo {stockActual} unidades
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad</span>
                                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                                        <button
                                            onClick={handleDecrement}
                                            disabled={quantity <= 1}
                                            aria-label="Disminuir cantidad"
                                            className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-tenri-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="font-black text-base text-gray-900 w-10 text-center" aria-live="polite">{quantity}</span>
                                        <button
                                            onClick={handleIncrement}
                                            disabled={!item.is_service && quantity >= item.stock_current}
                                            aria-label="Aumentar cantidad"
                                            className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-tenri-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={sinStock}
                                    className={`w-full px-6 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-lg transition-all ${
                                        sinStock
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : agregado
                                                ? 'bg-emerald-500 text-white scale-[1.01]'
                                                : 'bg-tenri-900 text-white hover:bg-tenri-800 hover:-translate-y-0.5 active:translate-y-0 shadow-tenri-900/20'
                                    }`}
                                >
                                    {agregado ? (
                                        <><Check size={20} /> ¡Agregado al carrito!</>
                                    ) : (
                                        <><ShoppingCart size={20} /> {item.is_service ? 'Contratar Plan' : 'Agregar al Carrito'}</>
                                    )}
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-gray-100">
                                <div className="flex flex-col items-center text-center gap-1.5">
                                    <ShieldCheck size={18} className="text-tenri-600" />
                                    <span className="text-[10px] font-bold text-gray-600 leading-tight">Garantía<br/>Tenri</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1.5">
                                    <Truck size={18} className="text-tenri-600" />
                                    <span className="text-[10px] font-bold text-gray-600 leading-tight">Despacho<br/>Todo Chile</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1.5">
                                    <Clock size={18} className="text-tenri-600" />
                                    <span className="text-[10px] font-bold text-gray-600 leading-tight">Soporte<br/>24/7</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {detailsList.length > 0 && (
                        <div className="border-t border-gray-100 p-6 md:p-10 bg-gray-50/30">
                            <h2 className="font-black text-gray-900 text-lg mb-5 flex items-center gap-2">
                                {item.is_service ? (
                                    <><Briefcase size={18} className="text-tenri-600" /> Lo que incluye este plan</>
                                ) : (
                                    <><Package size={18} className="text-tenri-600" /> Especificaciones técnicas</>
                                )}
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {detailsList.map((feat, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckCircle size={11} />
                                        </div>
                                        <span className="font-medium text-sm text-gray-700 leading-snug">{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {relacionados.length > 0 && (
                    <section>
                        <div className="flex items-end justify-between mb-5">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900">También podría interesarte</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Otros productos de {item.category?.name}</p>
                            </div>
                            <Link to="/catalogo" className="hidden sm:flex items-center gap-1 text-sm font-bold text-tenri-700 hover:text-tenri-900 transition-colors">
                                Ver todos <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {relacionados.map(rel => (
                                <RelatedCard key={rel.id} producto={rel} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

const RelatedCard = ({ producto }) => {
    const navigate = useNavigate();
    const imagenes = producto.images || [];
    const cover = imagenes.find(img => Boolean(img.is_cover)) || imagenes[0];
    const sinStock = Number(producto.stock_current ?? 0) <= 0;

    return (
        <article
            onClick={() => navigate(`/item/product/${producto.id}`)}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
        >
            <div className="aspect-square bg-gray-50/50 flex items-center justify-center overflow-hidden p-3 relative">
                {cover ? (
                    <img
                        src={`${BASE_URL}${cover.url}`}
                        alt={producto.name}
                        loading="lazy"
                        className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${sinStock ? 'opacity-50 grayscale' : ''}`}
                    />
                ) : (
                    <Package size={40} className="text-gray-200" strokeWidth={1.5} />
                )}
                {sinStock && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                        Agotado
                    </span>
                )}
            </div>
            <div className="p-3">
                <h4 className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 mb-1.5 group-hover:text-tenri-700 transition-colors min-h-[2rem]">
                    {producto.name}
                </h4>
                <p className="text-base font-black text-tenri-900">
                    ${parseInt(producto.price).toLocaleString('es-CL')}
                </p>
            </div>
        </article>
    );
};

export default ItemDetail;
