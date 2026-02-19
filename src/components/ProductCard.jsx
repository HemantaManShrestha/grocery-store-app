import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [priceType, setPriceType] = useState('retail');
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        const selectedUnit = priceType === 'retail' ? product.unit : (product.wholesaleUnit || 'Bulk');
        addToCart(product, 1, priceType, selectedUnit);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1000);
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group flex flex-col h-full"
        >
            <div className="relative aspect-square bg-gray-50 overflow-hidden shrink-0">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/600x400?text=No+Image';
                    }}
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-semibold text-primary-600 shadow-sm">
                    {product.category}
                </div>

                {/* badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    {product.discount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {product.discount}% OFF
                        </span>
                    )}
                    {product.tags && product.tags.map(tag => (
                        <span key={tag} className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase">
                            {tag}
                        </span>
                    ))}
                    {/* Fallback for "New" if calculated dynamically? User asked for manual tag, but we can do both if needed. For now manual tags via Admin is sufficient. */}
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1 space-y-3">
                <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                </div>

                <div className="mt-auto space-y-3">
                    {/* Price Selection */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setPriceType('retail')}
                            className={`flex flex-col items-center py-1.5 rounded-md text-xs transition-all ${priceType === 'retail' ? 'bg-white shadow-sm text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span>Retail ({product.unit})</span>
                            <span className="text-sm font-bold">Rs. {product.retailPrice}</span>
                        </button>
                        <button
                            onClick={() => setPriceType('wholesale')}
                            className={`flex flex-col items-center py-1.5 rounded-md text-xs transition-all ${priceType === 'wholesale' ? 'bg-white shadow-sm text-primary-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <span>Wholesale ({product.wholesaleUnit || 'Bulk'})</span>
                            <span className="text-sm font-bold">Rs. {product.wholesalePrice}</span>
                        </button>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={isAdded}
                        className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${isAdded
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-900 hover:bg-black text-white'
                            }`}
                    >
                        {isAdded ? (
                            <>
                                <span className="font-bold">Added!</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                <span>Add to Bucket</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
