import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // 1. Estado de los Productos
    const [cart, setCart] = useState(() => {
        try {
            const item = localStorage.getItem('cart');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            return [];
        }
    });

    // 2. Estado de Visibilidad (Sidebar) <-- ESTO TE FALTABA
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Persistencia
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Agregar
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Opcional: Abrir el carrito automáticamente al agregar algo
                setIsCartOpen(true); 
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    // Eliminar
    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    // Limpiar
    const clearCart = () => {
        setCart([]);
    };

    // Calcular Total $$
    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (parseInt(item.price) * item.quantity), 0);
    };

    // Calcular Cantidad Items
    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    // Helper para Togglear
    const toggleCart = () => setIsCartOpen(!isCartOpen);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            clearCart, 
            getCartTotal, 
            getCartCount,
            // Exportamos los estados de visibilidad para el Navbar
            isCartOpen,      
            setIsCartOpen,   
            toggleCart 
        }}>
            {children}
        </CartContext.Provider>
    );
};