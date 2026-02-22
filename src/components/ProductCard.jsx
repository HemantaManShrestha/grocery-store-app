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
            whileHover={{ y: -3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden group flex flex-col h-full hover:border-primary-200"
        >
            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden shrink-0">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300?text=No+Image';
                    }}
                />

                {/* tags */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    {product.discount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm tracking-wider">
                            -{product.discount}%
                        </span>
                    )}
                    {product.tags && product.tags.map(tag => (
                        <span key={tag} className="bg-primary-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="p-3 flex flex-col flex-1 space-y-2">
                <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2" title={product.name}>{product.name}</h3>
                    {product.category && <p className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider mt-0.5">{product.category}</p>}
                </div>

                <div className="mt-auto space-y-2">
                    {/* Compact Price Selection */}
                    <div className="flex gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-100">
                        <button
                            onClick={() => setPriceType('retail')}
                            className={`flex flex-col flex-1 items-center justify-center p-1 rounded text-[10px] transition-all ${priceType === 'retail' ? 'bg-white shadow-sm text-gray-900 border border-gray-200 font-bold' : 'text-gray-500 hover:text-gray-700 font-medium border border-transparent'}`}
                        >
                            <span>Retail</span>
                            {(product.discount > 0 && ((product.discountTarget || 'retail') === 'retail' || product.discountTarget === 'both')) ? (
                                <div className="flex flex-col items-center leading-none mt-0.5">
                                    <span className="text-red-600">Rs. {Math.round(product.retailPrice * (1 - product.discount / 100))}</span>
                                </div>
                            ) : (
                                <span className="text-primary-700 mt-0.5 leading-none">Rs. {product.retailPrice}</span>
                            )}
                        </button>

                        <button
                            onClick={() => setPriceType('wholesale')}
                            className={`flex flex-col flex-1 items-center justify-center p-1 rounded text-[10px] transition-all ${priceType === 'wholesale' ? 'bg-white shadow-sm text-gray-900 border border-gray-200 font-bold' : 'text-gray-500 hover:text-gray-700 font-medium border border-transparent'}`}
                        >
                            <span>Bulk</span>
                            {(product.discount > 0 && (product.discountTarget === 'wholesale' || product.discountTarget === 'both')) ? (
                                <div className="flex flex-col items-center leading-none mt-0.5">
                                    <span className="text-red-600">Rs. {Math.round(product.wholesalePrice * (1 - product.discount / 100))}</span>
                                </div>
                            ) : (
                                <span className="text-primary-700 mt-0.5 leading-none">Rs. {product.wholesalePrice}</span>
                            )}
                        </button>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={isAdded}
                        className={`w-full py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${isAdded
                            ? 'bg-green-500 text-white shadow-green-500/20 shadow-lg'
                            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/20 shadow-lg'
                            }`}
                    >
                        {isAdded ? (
                            <span>Added ✓</span>
                        ) : (
                            <>
                                <Plus className="w-3.5 h-3.5" /> ADD
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
