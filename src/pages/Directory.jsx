import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { initializeDb } from '../lib/db';
import SEO from '../components/SEO';

const Directory = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);

    useEffect(() => {
        initializeDb();
        const loadedStores = JSON.parse(localStorage.getItem('saas-stores') || '[]');
        setStores(loadedStores);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <SEO
                title="Nepal's Local Grocery Network | Home"
                description="Find and order from local grocery stores near you."
                name="Grocery Network"
                type="website"
            />
            <div className="max-w-4xl w-full text-center space-y-12">

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                        Nepal's Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Grocery Network</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Supporting local businesses. Find your neighborhood store and order directly via Viber or WhatsApp.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    {stores.length > 0 ? stores.map(store => (
                        <motion.button
                            key={store.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/store/${store.id}`)}
                            className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 text-left flex items-center gap-6"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-${store.color || 'gray'}-100 flex items-center justify-center text-3xl shadow-inner`}>
                                {store.name[0]}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                    {store.name}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    Tap to enter shop &rarr;
                                </p>
                            </div>
                        </motion.button>
                    )) : (
                        <p className="text-gray-400">Loading stores...</p>
                    )}
                </div>

                <div className="pt-12 border-t border-gray-200/50">
                    <p className="text-sm text-gray-400 font-medium">Are you a shop owner?</p>
                    <button
                        onClick={() => {
                            const newStoreId = `shop-${Date.now()}`;
                            const newStore = {
                                id: newStoreId,
                                name: "My New Grocery",
                                logo: "Store",
                                color: "orange",
                                contact: "98XXXXXXXX"
                            };
                            const current = JSON.parse(localStorage.getItem('saas-stores') || '[]');
                            localStorage.setItem('saas-stores', JSON.stringify([...current, newStore]));
                            window.location.href = `/store/${newStoreId}/admin`;
                        }}
                        className="mt-2 text-primary-600 font-bold hover:underline"
                    >
                        + Create Your Store (Demo)
                    </button>
                    <p className="text-xs text-gray-400 mt-2">Click to instantly launch a new shop dashboard.</p>
                </div>

            </div>
        </div>
    );
};

export default Directory;
