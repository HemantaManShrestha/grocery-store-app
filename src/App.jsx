import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { ShoppingCart, User, Store } from 'lucide-react'
import { CartProvider, useCart } from './context/CartContext'
import { getStore } from './lib/db';

// Pages
import StoreHome from './pages/StoreHome';
import Landing from './pages/Landing'; // Replaces Directory
import SuperAdmin from './pages/SuperAdmin';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
// Lazy load AdminPage for performance
const AdminPage = lazy(() => import('./pages/Admin'));
import PageTransition from './components/PageTransition';

const Navbar = ({ store }) => {
  const { itemCount } = useCart();
  const storeName = store?.name || "ViberGrocer";

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={store ? `/store/${store.id}` : "/"} className="flex items-center gap-2 font-bold text-xl text-primary-600">
          {store?.logo && !store.logo.includes('lucide') ? (
            <img src={store.logo} className="w-8 h-8 rounded-full bg-primary-100 object-cover" onError={(e) => { e.target.style.display = 'none' }} />
          ) : <Store className="w-6 h-6" />}
          <span className="truncate max-w-[150px]">{storeName}</span>
        </Link>

        {store && (
          <div className="flex items-center gap-4">
            <Link to={`/store/${store.id}/admin`} className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Admin">
              <User className="w-5 h-5" />
            </Link>
            <Link to={`/store/${store.id}/cart`} className="relative p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

const Footer = () => (
  <footer className="bg-gray-50 border-t border-gray-100 py-8 mt-auto">
    <div className="max-w-4xl mx-auto px-4 text-center text-gray-400 text-sm">
      <p>&copy; {new Date().getFullYear()} Grocery Network. Tap to order.</p>
    </div>
  </footer>
)

// Update Layout to handle super-admin case gracefully
const Layout = ({ children }) => {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const location = useLocation();

  // Check if we are on the landing page or super admin
  const isLanding = location.pathname === '/' || location.pathname === '/super-admin';

  useEffect(() => {
    const fetchStore = async () => {
      if (storeId) {
        const s = await getStore(storeId);
        setStore(s);
      } else {
        setStore(null);
      }
    };
    fetchStore();
  }, [storeId]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
      {!isLanding && <Navbar store={store} />}
      <main className={`flex-grow ${!isLanding ? 'pt-0' : ''}`}>
        {children}
      </main>
      {!isLanding && <Footer />}
    </div>
  )
}

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Layout><Landing /></Layout></PageTransition>} />
        <Route path="/super-admin" element={<PageTransition><Layout><SuperAdmin /></Layout></PageTransition>} />
        <Route path="/store/:storeId" element={<PageTransition><Layout><StoreHome /></Layout></PageTransition>} />
        <Route path="/store/:storeId/cart" element={<PageTransition><Layout><CartPage /></Layout></PageTransition>} />
        <Route path="/store/:storeId/checkout" element={<PageTransition><Layout><CheckoutPage /></Layout></PageTransition>} />
        <Route path="/store/:storeId/admin" element={
          <PageTransition>
            <Layout>
              <Suspense fallback={<div className="p-10 text-center">Loading Dashboard...</div>}>
                <AdminPage />
              </Suspense>
            </Layout>
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <CartProvider>
      <HelmetProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </HelmetProvider>
    </CartProvider>
  )
}

export default App
