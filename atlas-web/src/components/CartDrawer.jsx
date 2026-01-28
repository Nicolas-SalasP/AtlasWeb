import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
    const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop oscuro con blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Panel Lateral */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">

                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-atlas-900 text-white shadow-md z-10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingBag size={22} className="text-atlas-300" />
                        Tu Carrito
                        <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full text-white ml-2">
                            {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items
                        </span>
                    </h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="hover:bg-white/20 p-2 rounded-full transition-colors active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Lista de Productos */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="bg-gray-100 p-6 rounded-full">
                                <ShoppingBag size={48} className="opacity-20 text-atlas-900" />
                            </div>
                            <p className="font-medium text-lg text-gray-500">Tu carrito está vacío</p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="text-atlas-500 font-bold hover:text-atlas-900 transition-colors border-b-2 border-transparent hover:border-atlas-900 pb-1"
                            >
                                Volver al catálogo
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                    <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight">{item.nombre}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{item.categoria}</p>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="p-1.5 hover:bg-gray-200 rounded-l-lg text-gray-600 transition-colors"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-sm font-bold w-6 text-center text-gray-800">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="p-1.5 hover:bg-gray-200 rounded-r-lg text-gray-600 transition-colors"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <p className="font-bold text-atlas-900 text-base">
                                            ${(item.precio * item.quantity).toLocaleString('es-CL')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all self-start"
                                    title="Eliminar producto"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Checkout */}
                {cartItems.length > 0 && (
                    <div className="p-6 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-500 font-medium">Total Estimado</span>
                            <span className="text-3xl font-extrabold text-atlas-900 tracking-tight">
                                ${cartTotal.toLocaleString('es-CL')}
                            </span>
                        </div>

                        {/* --- BOTÓN MEJORADO --- */}
                        <button
                            onClick={handleCheckout}
                            className="group relative w-full bg-atlas-900 hover:bg-atlas-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-atlas-900/30 active:scale-[0.98] overflow-hidden"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            <div className="flex items-center justify-center gap-3">
                                <span>Finalizar Compra</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                        {/* ---------------------- */}

                        <div className="flex justify-center gap-4 mt-4 text-gray-300">
                            <CreditCard size={18} />
                            <span className="text-xs text-gray-400">Pagos seguros vía WebPay</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;