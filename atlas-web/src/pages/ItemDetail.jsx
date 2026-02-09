import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { 
    ShoppingCart, ArrowLeft, CheckCircle, Package, 
    Briefcase, ShieldCheck, Truck, Clock, 
    ChevronRight, AlertCircle, Layers, Plus, Minus 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BASE_URL } from '../api/constants';

const ItemDetail = () => {
    const { type, id } = useParams(); 
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                let data = null;
                if (type === 'product') {
                    const res = await api.get('/products'); 
                    data = res.data.find(p => p.id == id);
                    if (data) { data.type = 'product'; data.is_service = false; }
                } else {
                    const res = await api.get('/services/catalog');
                    data = res.data.find(s => s.id == id);
                    if (data) { 
                        data.type = 'service'; 
                        data.is_service = true; 
                        data.stock_current = 9999; 
                    }
                }

                if (data) {
                    setItem(data);
                    setQuantity(1);
                } else {
                    toast.error("Ítem no encontrado");
                    navigate('/catalogo');
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error("Error de conexión");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [type, id, navigate]);

    const handleIncrement = () => {
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
        
        toast.success(`Agregado: ${quantity} x ${item.name}`);
    };

    if (loading) return <div className="min-h-screen pt-32 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-atlas-900"></div></div>;
    if (!item) return null;

    const images = item.images || [];
    const detailsList = item.is_service ? (item.features || []) : (item.specs || []);
    const mainImage = item.is_service 
        ? (item.image_url ? `${BASE_URL}${item.image_url}` : null)
        : (images.length > 0 ? `${BASE_URL}${images[selectedImage]?.url}` : null);

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto">
                
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <button onClick={() => navigate('/catalogo')} className="hover:text-atlas-900 flex items-center gap-1 transition-colors">
                        <ArrowLeft size={16} /> Catálogo
                    </button>
                    <ChevronRight size={14} />
                    <span className="capitalize">{item.is_service ? 'Servicios' : item.category?.name || 'Producto'}</span>
                    <ChevronRight size={14} />
                    <span className="font-semibold text-atlas-900 truncate max-w-[200px]">{item.name}</span>
                </nav>

                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-0">
                        <div className="p-8 md:p-12 bg-gray-50/50 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col justify-center">
                            <div className="relative aspect-square rounded-3xl bg-white border border-gray-200 shadow-sm flex items-center justify-center p-8 mb-6 overflow-hidden group">
                                {mainImage ? (
                                    <img src={mainImage} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="text-gray-300 flex flex-col items-center gap-4">
                                        {item.is_service ? <Briefcase size={80} /> : <Package size={80} />}
                                        <span className="text-sm font-medium text-gray-400">Sin imagen disponible</span>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    {item.is_service ? (
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"><Layers size={12} /> SUSCRIPCIÓN</span>
                                    ) : item.stock_current > 0 ? (
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"><CheckCircle size={12} /> STOCK DISPONIBLE</span>
                                    ) : (
                                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"><AlertCircle size={12} /> AGOTADO</span>
                                    )}
                                </div>
                            </div>
                            {!item.is_service && images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center">
                                    {images.map((img, idx) => (
                                        <button key={img.id} onClick={() => setSelectedImage(idx)} className={`w-20 h-20 rounded-2xl border-2 overflow-hidden flex-shrink-0 transition-all ${selectedImage === idx ? 'border-atlas-900 ring-2 ring-atlas-900/20 scale-105' : 'border-transparent bg-white hover:border-gray-300'}`}>
                                            <img src={`${BASE_URL}${img.url}`} className="w-full h-full object-cover" alt="thumbnail" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-8 md:p-12 flex flex-col h-full relative">
                            <div className="mb-8">
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">{item.name}</h1>
                                {item.sku && <div className="text-xs font-mono text-gray-400 mb-4 bg-gray-100 inline-block px-2 py-1 rounded">SKU: {item.sku}</div>}
                                <p className="text-gray-600 text-lg leading-relaxed">{item.description}</p>
                            </div>

                            <div className="mb-10">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    {item.is_service ? 'Lo que incluye el plan:' : 'Especificaciones Técnicas:'}
                                </h3>
                                {detailsList.length > 0 ? (
                                    <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        {detailsList.map((feat, i) => (
                                            <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                                <div className="w-5 h-5 rounded-full bg-atlas-100 text-atlas-600 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle size={12} /></div>
                                                <span className="font-medium">{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic text-sm">No se han especificado detalles técnicos.</p>
                                )}
                            </div>
                            <div className="mt-auto bg-white border-t border-gray-100 pt-8">
                                <div className="flex flex-col gap-6">
                                    
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Precio Unitario</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-atlas-900 tracking-tight">${parseInt(item.price).toLocaleString()}</span>
                                                {item.is_service && <span className="text-lg text-gray-500 font-medium">/{item.duration_days} días</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex items-center justify-between sm:justify-start bg-gray-100 rounded-2xl p-1 w-full sm:w-auto min-w-[140px]">
                                            <button 
                                                onClick={handleDecrement}
                                                disabled={quantity <= 1}
                                                className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-atlas-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
                                            >
                                                <Minus size={20} />
                                            </button>
                                            <span className="font-bold text-xl text-atlas-900 w-12 text-center">{quantity}</span>
                                            <button 
                                                onClick={handleIncrement}
                                                disabled={!item.is_service && quantity >= item.stock_current}
                                                className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-600 hover:text-atlas-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={!item.is_service && item.stock_current <= 0}
                                            className={`flex-1 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:translate-y-0 ${
                                                !item.is_service && item.stock_current <= 0
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-atlas-900 text-white hover:bg-atlas-800 shadow-atlas-900/30'
                                            }`}
                                        >
                                            <ShoppingCart size={24} />
                                            {item.is_service ? 'Contratar Plan' : 'Agregar al Carrito'}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-6 mt-8 justify-center sm:justify-start text-xs text-gray-400 font-medium">
                                    <div className="flex items-center gap-2"><ShieldCheck size={16}/> Garantía Atlas</div>
                                    <div className="flex items-center gap-2"><Truck size={16}/> Despacho Todo Chile</div>
                                    <div className="flex items-center gap-2"><Clock size={16}/> Soporte 24/7</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;