import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

const Carousel = ({ products }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300; // Approx card width
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!products || products.length === 0) return null;

    return (
        <div className="relative mb-8 group">
            <h2 className="text-xl font-bold mb-4 px-2 flex items-center gap-2">
                <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full uppercase tracking-wider">Spotlight</span>
                Featured Products
            </h2>

            {/* Scroll Buttons */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100 hidden md:block"
            >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100 hidden md:block"
            >
                <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            {/* Container */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-3 pb-4 px-2 snap-x snap-mandatory scrollbar-hide -mx-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {products.map(product => (
                    <div key={product.id} className="min-w-[160px] md:min-w-[200px] max-w-[240px] snap-center">
                        <ProductCard product={product} isFeatured={true} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Carousel;
