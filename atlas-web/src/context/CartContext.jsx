import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Cargar carrito desde LocalStorage al iniciar (para que no se borre al recargar)
    useEffect(() => {
        const savedCart = localStorage.getItem('atlas_cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    // Guardar en LocalStorage cada vez que cambie
    useEffect(() => {
        localStorage.setItem('atlas_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Función: Agregar Producto
    const addToCart = (product) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            if (existingItem) {
                // Si ya existe, aumentamos cantidad
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // Si es nuevo, lo agregamos con cantidad 1
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true); // Abrir el carrito automáticamente al agregar
    };

    // Función: Eliminar Producto
    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    // Función: Actualizar Cantidad
    const updateQuantity = (id, amount) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + amount);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    // Calcular Total
    const cartTotal = cartItems.reduce((total, item) => total + (item.precio * item.quantity), 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            cartTotal,
            cartCount,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};