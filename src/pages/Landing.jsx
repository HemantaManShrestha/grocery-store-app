
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { Store, ShieldCheck, Zap } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="Grocery Network | Power Your Local Business"
                description="The best platform for local grocery stores in Nepal to go online."
                name="Grocery Network"
                type="website"
            />

            {/* Navbar */}
            <nav className="border-b border-gray-100 py-4 px-6 flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
                    <Store className="w-6 h-6 text-primary-600" />
                    <span>Grocery Network</span>
                </div>
                <div className="flex gap-4">
                    <Link to="/super-admin" className="text-sm font-medium text-gray-500 hover:text-primary-600">
                        Admin Login
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-6 py-20 text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-6">
                        For Local Businesses
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto">
                        Your Shop, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">Online in Minutes.</span>
                    </h1>
                </motion.div>

                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    Create a virtual branch of your physical store. Share your unique link on Viber & WhatsApp to let customers order easily.
                </p>

                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-12 text-left">
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Fast Setup</h3>
                        <p className="text-gray-500">
                            Get your store link (e.g., /store/my-shop) instantly. No coding required.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                            <Store className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Virtual Aisle</h3>
                        <p className="text-gray-500">
                            Customers browse your products just like in your shop. Add photos, prices, and wholesale units.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                            <ShieldCheck className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Admin Control</h3>
                        <p className="text-gray-500">
                            Secure admin panel for up to 3 managers. Add items, remove items, and track orders.
                        </p>
                    </div>
                </div>

                <div className="pt-20 text-sm text-gray-400">
                    <p>Already have a store?</p>
                    <p className="mt-2">Use the <strong className="text-gray-900">Manager Link</strong> provided by your Super Admin to access your dashboard.</p>
                </div>
            </div>
        </div>
    );
};

export default Landing;
