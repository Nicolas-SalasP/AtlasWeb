import React from 'react';
import { X, Trash2, ShoppingCart, ArrowRight, Plus, Minus, Layers, Package, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { useCart, isService } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../api/constants';

const formatPrice = (amount) => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
}).format(amount || 0);

const CartDrawer = () => {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getCartCount,
        hasOnlyServices,
        isCartOpen,
        setIsCartOpen,
    } = useCart();

    const navigate = useNavigate();

    const getItemImage = (item) => {
        if (!item.images || item.images.length === 0) return null;
        const cover = item.images.find(img => Boolean(img.is_cover)) || item.images[0];
        return cover?.url ? `${BASE_URL}${cover.url}` : null;
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    const handleContinueShopping = () => {
        setIsCartOpen(false);
        navigate('/catalogo');
    };

    const allServices = hasOnlyServices();
    const total = getCartTotal();
    const cartCount = getCartCount();

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsCartOpen(false)}
            />

            <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-tenri-50 text-tenri-900 rounded-xl flex items-center justify-center border border-tenri-100">
                            <ShoppingCart size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-gray-900 tracking-tight">Tu carrito</h2>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                {cartCount === 0 ? 'Vacío' : `${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        aria-label="Cerrar carrito"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/40">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-6">
                            <div className="w-20 h-20 bg-tenri-50 rounded-full flex items-center justify-center mb-4 border border-tenri-100">
                                <ShoppingCart size={28} className="text-tenri-700" />
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900 mb-1 tracking-tight">Tu carrito está vacío</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-xs">
                                Explorá nuestro catálogo y descubrí productos y servicios para tu empresa.
                            </p>
                            <button
                                onClick={handleContinueShopping}
                                className="inline-flex items-center gap-2 bg-tenri-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-tenri-800 transition-all shadow-md text-sm group"
                            >
                                Explorar catálogo
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => {
                            const itemIsService = isService(item);
                            const img = getItemImage(item);
                            const lineTotal = parseInt(item.price) * item.quantity;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white p-3 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all animate-in slide-in-from-right-2"
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border ${itemIsService ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                                            {img ? (
                                                <img
                                                    src={img}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : itemIsService ? (
                                                <Layers size={22} className="text-blue-500" />
                                            ) : (
                                                <Package size={22} className="text-gray-300" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{item.name}</h3>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-all shrink-0 -mt-0.5 -mr-1"
                                                    aria-label="Eliminar"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>

                                            {itemIsService ? (
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-black uppercase tracking-wider border border-blue-100">
                                                        <Sparkles size={8} /> Servicio
                                                    </span>
                                                    {item.duration && (
                                                        <span className="text-[10px] text-gray-500 font-medium">
                                                            {item.duration} días
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-2">
                                                    {item.category?.name || 'Producto'}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="w-6 h-6 flex items-center justify-center bg-white rounded text-gray-600 hover:text-tenri-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                                        aria-label="Quitar uno"
                                                    >
                                                        <Minus size={11} />
                                                    </button>
                                                    <span className="font-bold text-xs text-gray-900 w-6 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-6 h-6 flex items-center justify-center bg-white rounded text-gray-600 hover:text-tenri-900 transition-all"
                                                        aria-label="Agregar uno"
                                                    >
                                                        <Plus size={11} />
                                                    </button>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-sm font-black text-tenri-900">
                                                        {formatPrice(lineTotal)}
                                                    </p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-[10px] text-gray-400 font-medium">
                                                            {formatPrice(item.price)} c/u
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)] space-y-3">

                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-bold text-gray-900">{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400 flex items-center gap-1">
                                    {allServices ? (
                                        <><Sparkles size={10} className="text-tenri-500" /> Servicio digital</>
                                    ) : (
                                        <><Truck size={10} /> Envío</>
                                    )}
                                </span>
                                <span className={allServices ? 'text-emerald-600 font-bold' : 'text-gray-400 italic'}>
                                    {allServices ? 'Sin envío' : 'Se calcula en checkout'}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-baseline border-t border-gray-100 pt-3">
                            <span className="text-sm font-bold text-gray-700">Total estimado</span>
                            <span className="text-2xl font-black text-tenri-900 tracking-tight">
                                {formatPrice(total)}
                            </span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-tenri-900 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-tenri-900/20 hover:bg-tenri-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                        >
                            Finalizar compra
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={handleContinueShopping}
                            className="w-full text-tenri-700 hover:text-tenri-900 font-bold text-xs hover:bg-tenri-50 py-2 rounded-lg transition-colors"
                        >
                            Seguir comprando
                        </button>

                        <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 font-bold pt-1">
                            <span className="flex items-center gap-1"><ShieldCheck size={10} /> Pago seguro</span>
                            <span className="text-gray-200">·</span>
                            <span>SSL 256-bit</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
