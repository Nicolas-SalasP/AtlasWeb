import React from 'react';
import { X, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    // Usamos las variables nuevas del Context
    const { 
        cart, 
        removeFromCart, 
        getCartTotal, 
        isCartOpen, 
        setIsCartOpen 
    } = useCart();
    
    const navigate = useNavigate();
    const BASE_URL = 'http://127.0.0.1:8000';

    // Helper para imagen
    const getProductImage = (item) => {
        if (!item.images || item.images.length === 0) return "https://placehold.co/100?text=No+Img";
        const cover = item.images.find(img => img.is_cover == 1) || item.images[0];
        return `${BASE_URL}${cover.url}`;
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    return (
        <>
            {/* OVERLAY (Fondo Oscuro) */}
            <div 
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsCartOpen(false)}
            />

            {/* DRAWER (Panel Lateral) */}
            <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* HEADER */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingCart size={20} /> Tu Carrito
                    </h2>
                    <button 
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* LISTA DE PRODUCTOS */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                            <ShoppingCart size={48} className="mb-4 opacity-20" />
                            <p>Tu carrito está vacío.</p>
                            <button onClick={() => setIsCartOpen(false)} className="mt-4 text-atlas-900 font-bold text-sm underline">
                                Ver Catálogo
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-right-2">
                                {/* Imagen */}
                                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                    <img 
                                        src={getProductImage(item)} 
                                        alt={item.name} 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{item.category?.name || 'Producto'}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-atlas-900">
                                            ${parseInt(item.price).toLocaleString('es-CL')} 
                                            <span className="text-xs font-normal text-gray-400 ml-1">x{item.quantity}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Botón Eliminar */}
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="h-8 w-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all self-center"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* FOOTER (Totales) */}
                {cart.length > 0 && (
                    <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500 font-medium">Total Estimado</span>
                            <span className="text-2xl font-black text-atlas-900">
                                ${getCartTotal().toLocaleString('es-CL')}
                            </span>
                        </div>
                        <button 
                            onClick={handleCheckout}
                            className="w-full bg-atlas-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-atlas-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Finalizar Compra <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;