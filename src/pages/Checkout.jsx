import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Truck, Phone, MapPin, CheckCircle, Smartphone, ArrowRight } from 'lucide-react';
import { addOrder } from '../lib/db';
import LocationMap from '../components/LocationMap';

const Checkout = () => {
    const { storeId } = useParams();
    const { cart, total, clearCart } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [lastOrderId, setLastOrderId] = useState(null);

    // Default to Kathmandu center
    const [mapPosition, setMapPosition] = useState({ lat: 27.7172, lng: 85.3240 });

    const fetchAddressFromCoords = async (latitude, longitude) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;

            if (data && data.display_name) {
                setForm(prev => ({
                    ...prev,
                    address: `${data.display_name}\n\n📍 Map Link: ${mapLink}`
                }));
            } else {
                setForm(prev => ({
                    ...prev,
                    address: `Lat: ${latitude}, Long: ${longitude}\n\n📍 Map Link: ${mapLink}`
                }));
            }
        } catch (error) {
            console.error("Error fetching address:", error);
            const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
            setForm(prev => ({
                ...prev,
                address: `Lat: ${latitude}, Long: ${longitude} (Network Error)\n\n📍 Map Link: ${mapLink}`
            }));
        }
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setMapPosition({ lat: latitude, lng: longitude });
                await fetchAddressFromCoords(latitude, longitude);
                setIsLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Unable to retrieve your location. Please ensure location services are enabled.");
                setIsLocating(false);
            }
        );
    };

    const handleMapDragEnd = async (newPos) => {
        setMapPosition(newPos);
        // Add a small delay/debounce could be nice, but direct update is fine for now
        await fetchAddressFromCoords(newPos.lat, newPos.lng);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Save order to Supabase
            const order = await addOrder({
                storeId,
                customer: form.name,
                total: total,
                items: cart,
                address: form.address,
                phone: form.phone,
                location: mapPosition
            });

            if (order) {
                setLastOrderId(order.id);
                setOrderComplete(true);
                clearCart();
            } else {
                alert("Failed to place order. Please check your connection.");
            }
        } catch (error) {
            console.error("Order failed:", error);
            alert("An error occurred while placing the order.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                    Thank you, {form.name}. Your order has been sent to the store.
                    The owner will call or message you on <span className="font-semibold text-primary-600">Viber/WhatsApp</span> to confirm the final price and delivery time.
                </p>
                <div className="space-y-4 w-full max-w-xs">
                    <button
                        onClick={() => navigate(`/store/${storeId}`)}
                        className="w-full bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-black transition shadow-lg"
                    >
                        Back to Shop
                    </button>
                    <p className="text-xs text-gray-400">Order ID: #{lastOrderId}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pt-24 pb-20 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Truck className="w-6 h-6 text-primary-600" />
                Place Order
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">1</span>
                                Full Name
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="Your Name"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">2</span>
                                Phone (Viber/WhatsApp)
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="tel"
                                    placeholder="98XXXXXXXX"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">3</span>
                                Delivery Address
                            </span>
                            <button
                                type="button"
                                onClick={handleUseLocation}
                                disabled={isLocating}
                                className="text-primary-600 text-xs font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
                            >
                                {isLocating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
                                        Locating...
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="w-3 h-3" />
                                        Use Current Location
                                    </>
                                )}
                            </button>
                        </label>

                        {/* Map Component */}
                        <LocationMap
                            position={mapPosition}
                            setPosition={setMapPosition}
                            onLocationSelect={handleMapDragEnd}
                        />

                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            <textarea
                                required
                                placeholder="Street, Tole, City, Landmark..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all min-h-[100px]"
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                        </div>
                        <p className="text-xs text-gray-400">
                            Tip: Drag the marker on the map to pin your exact location.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                            <span>Subtotal ({cart.length} items)</span>
                            <span>Rs. {total}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold">
                            <span>Total Estimated</span>
                            <span className="text-primary-600">NPR {total}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 italic">
                            * Final price and payment will be confirmed by the store owner when they contact you.
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Sending Order...</span>
                        </>
                    ) : (
                        <>
                            <span>Place Order</span>
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Checkout;
