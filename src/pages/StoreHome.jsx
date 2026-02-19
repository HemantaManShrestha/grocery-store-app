import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import ProductCard from '../components/ProductCard';
import Carousel from '../components/Carousel';
import SEO from '../components/SEO';
import { getStore, getStoreProducts, initializeDb } from '../lib/db';

const StoreHome = () => {
    const { storeId } = useParams();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            initializeDb();
            const currentStore = await getStore(storeId);
            if (currentStore) {
                setStore(currentStore);
                const storeProducts = await getStoreProducts(storeId);
                setProducts(storeProducts);
            }
        };
        loadData();
    }, [storeId]);

    if (!store) return <div className="text-center p-10">Searching for this store...</div>;

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 pt-24 pb-20">
            <SEO
                title={`${store.name} | Order Online`}
                description={`Order groceries from ${store.name} directly via Viber or WhatsApp.`}
                name={store.name}
                type="website"
            />
            <div className="mb-8 text-center space-y-4">
                <div className="flex flex-col items-center gap-2 mb-4">
                    {/* Store Logo or Default */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-${store.color}-100 border-4 border-white shadow-lg`}>
                        <img
                            src={store.logo.includes('http') ? store.logo : "https://via.placeholder.com/150?text=" + store.logo}
                            alt="Logo"
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + store.name }}
                        />
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                    Welcome to <span className={`text-${store.color || 'primary'}-600`}>{store.name}</span>
                </h1>

                {store.contact && (
                    <div className="flex justify-center gap-2 text-sm font-medium text-gray-600 bg-white shadow-sm py-2 px-4 rounded-full border border-gray-100 inline-block mx-auto">
                        <span>📞 Order via Viber/WhatsApp:</span>
                        <a href={`tel:${store.contact}`} className="text-primary-600 hover:underline font-bold">{store.contact}</a>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="Search for products..."
                        className="w-full px-5 py-3 pl-10 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-sm text-gray-700 placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-3 top-3.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Carousel Limit Logic: Show only if spotlight products exist */}
            {products.filter(p => p.isSpotlight).length > 0 && (
                <Carousel products={products.filter(p => p.isSpotlight)} />
            )}

            {/* Masonry Layout */}
            {filteredProducts.length > 0 ? (
                <Masonry
                    breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
                    className="my-masonry-grid flex w-auto -ml-4"
                    columnClassName="my-masonry-grid_column pl-4 bg-clip-padding"
                >
                    {filteredProducts.map(product => (
                        <div key={product.id} className="mb-4">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </Masonry>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    No products found in this store yet.
                </div>
            )}

            <Link to="/directory" className="fixed bottom-4 left-4 bg-gray-900 text-white text-xs px-3 py-1 rounded-full opacity-50 hover:opacity-100 transition-opacity z-50">Switch Store</Link>
        </div>
    );
};

export default StoreHome;
