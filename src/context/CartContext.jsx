import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM':
            const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
            if (existingItemIndex > -1) {
                const newItems = [...state.items];
                newItems[existingItemIndex].quantity += action.payload.quantity;
                return { ...state, items: newItems };
            }
            return { ...state, items: [...state.items, action.payload] };

        case 'REMOVE_ITEM':
            return { ...state, items: state.items.filter(item => item.id !== action.payload) };

        case 'UPDATE_QUANTITY':
            const newItems = state.items.map(item =>
                item.id === action.payload.id ? { ...item, quantity: Math.max(0, action.payload.quantity) } : item
            );
            return { ...state, items: newItems.filter(item => item.quantity > 0) };

        case 'CLEAR_CART':
            return { ...state, items: [] };

        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    // Initialize from local storage if available
    const [state, dispatch] = useReducer(cartReducer, { items: [] }, (initial) => {
        const saved = localStorage.getItem('viber-grocery-cart');
        return saved ? JSON.parse(saved) : initial;
    });

    useEffect(() => {
        localStorage.setItem('viber-grocery-cart', JSON.stringify(state));
    }, [state]);

    const addToCart = (product, quantity, priceType, unit) => {
        dispatch({
            type: 'ADD_ITEM',
            payload: {
                ...product,
                quantity,
                selectedPriceType: priceType, // 'retail' or 'wholesale'
                unit: unit, // Overwrite default unit with selected unit (e.g. 25kg)
                price: priceType === 'wholesale' ? product.wholesalePrice : product.retailPrice
            }
        });
    };

    const removeFromCart = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });

    const updateQuantity = (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });

    const clearCart = () => dispatch({ type: 'CLEAR_CART' });

    const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart: state.items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
