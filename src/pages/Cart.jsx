import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, ArrowRight, Minus, Plus } from 'lucide-react';

const Cart = () => {
    const { storeId } = useParams();
    const { cart, removeFromCart, updateQuantity, total, itemCount } = useCart();
    const navigate = useNavigate();

    if (itemCount === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4 pt-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">🛒</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">My Bucket is Empty</h2>
                <p className="text-gray-500 mb-6 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
                <button
                    onClick={() => navigate(`/store/${storeId}`)}
                    className="bg-primary-600 text-white px-8 py-3 rounded-full font-medium hover:bg-primary-700 transition"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pt-24 pb-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Bucket <span className="text-sm font-normal text-gray-500">({itemCount})</span></h1>
                <button onClick={() => navigate(`/store/${storeId}`)} className="text-primary-600 font-medium text-sm">Continue Shopping</button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cart.map(item => (
                        <div key={`${item.id}-${item.selectedPriceType}`} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm relative group hover:border-primary-100 transition-colors">
                            <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 min-w-0 pr-8">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {item.name} <span className="text-gray-500 text-sm font-normal">({item.unit})</span>
                                    </h3>
                                    <span className="font-bold text-gray-900 shrink-0">
                                        NPR {item.price * item.quantity}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-400 mb-3 capitalize">{item.selectedPriceType} Price</p>

                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 rounded-lg flex items-center gap-3 py-1 px-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-primary-600 disabled:opacity-50"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-primary-600"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        x Rs. {item.price}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24 space-y-4">
                        <h3 className="font-bold text-lg mb-2">Order Summary</h3>

                        <div className="space-y-2 py-4 border-y border-dashed border-gray-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium">NPR {total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Delivery Fee</span>
                                <span className="font-medium text-green-600">Free</span>
                            </div>
                        </div>

                        <div className="flex justify-between font-bold text-lg pt-2">
                            <span>Total</span>
                            <span>NPR {total}</span>
                        </div>

                        <button
                            onClick={() => navigate(`/store/${storeId}/checkout`)}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 transition-all active:scale-95"
                        >
                            <span>Proceed to Place Order</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
