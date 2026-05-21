import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const isService = (item) => {
    const id = String(item?.id ?? '');
    return id.startsWith('service-') || item?.is_service === true || item?.type === 'service';
};

const sameId = (a, b) => String(a) === String(b);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const item = localStorage.getItem('cart');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, amount = 1) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => sameId(item.id, product.id));

            if (existingItem) {
                return prevCart.map((item) =>
                    sameId(item.id, product.id)
                        ? { ...item, quantity: item.quantity + amount }
                        : item
                );
            } else {
                setIsCartOpen(true);
                return [...prevCart, { ...product, quantity: amount }];
            }
        });
    };

    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => !sameId(item.id, id)));
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) =>
                sameId(item.id, id) ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (parseInt(item.price) * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    const hasOnlyServices = () => {
        return cart.length > 0 && cart.every(isService);
    };

    const hasPhysicalProducts = () => {
        return cart.some(item => !isService(item));
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount,
            hasOnlyServices,
            hasPhysicalProducts,
            isCartOpen,
            setIsCartOpen,
            toggleCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export { isService };
