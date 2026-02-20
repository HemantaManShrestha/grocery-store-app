import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Settings, Package, Bell, BarChart as ChartIcon, Store, Plus, LogOut, ExternalLink, Lock, MapPin, Download, X, Share2, Search } from 'lucide-react';
import { getStoreOrders, getStoreProducts, getStore, addProduct, updateProduct, deleteProduct, updateStoreSettings, updateOrderStatus, uploadImage } from '../lib/db';
import { createStore, seedProducts } from '../lib/seed';
import LocationMap from '../components/LocationMap';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const Admin = () => {
    const { storeId } = useParams();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    const [activeTab, setActiveTab] = useState('orders');
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);

    // Filter & Export State
    const [dateFilter, setDateFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrderForMap, setSelectedOrderForMap] = useState(null);

    // Security State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Check Master Key (9999) OR Store Admin IDs
        if (pinInput === '9999') {
            setIsAuthenticated(true);
            return;
        }

        // Check if store has specific admin ids
        if (store && store.admin_ids && store.admin_ids.length > 0) {
            // Check if input matches any of the admin IDs (simulated 'login')
            if (store.admin_ids.includes(pinInput)) {
                setIsAuthenticated(true);
            } else {
                alert('Access Denied: Your ID/Phone is not authorized.');
            }
        } else {
            // Fallback for stores created before this update (use old 1234)
            if (pinInput === '1234' || pinInput === '9841XXXXXX') {
                setIsAuthenticated(true);
            } else {
                alert('Incorrect PIN/ID');
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const result = await uploadImage(file);
            if (result.success) {
                setNewProduct({ ...newProduct, image: result.url });
            } else {
                alert("Upload failed: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error processing image.");
        }
    };

    const [newProduct, setNewProduct] = useState({
        name: '', category: 'General', wholesalePrice: '', retailPrice: '', unit: '', wholesaleUnit: '', image: '', description: '', isSpotlight: false, discount: 0, discountTarget: 'retail', tags: []
    });
    const [editingProductId, setEditingProductId] = useState(null);

    // Store Settings State
    const [settingsForm, setSettingsForm] = useState({ name: '', logo: '', color: '', contact: '' });

    useEffect(() => {
        loadData();
    }, [storeId]);

    const loadData = async () => {
        setLoading(true);
        const s = await getStore(storeId);
        setStore(s);
        if (s) {
            const p = await getStoreProducts(storeId);
            setProducts(p);
            const o = await getStoreOrders(storeId);
            setOrders(o);
        }
        setLoading(false);
    };

    // Pre-fill settings when store loads
    useEffect(() => {
        if (store) {
            setSettingsForm({ name: store.name, logo: store.logo, color: store.color, contact: store.contact || '' })
        }
    }, [store]);

    const updateStatus = async (id, status) => {
        await updateOrderStatus(id, status);
        loadData(); // Refresh list
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        if (editingProductId) {
            await updateProduct({ ...newProduct, id: editingProductId });
            alert("Product updated!");
        } else {
            await addProduct({ ...newProduct, storeId });
            alert("Product added!");
        }

        setIsAddProductOpen(false);
        setEditingProductId(null);
        setNewProduct({ name: '', category: 'General', wholesalePrice: '', retailPrice: '', unit: '', wholesaleUnit: '', image: '', description: '', isSpotlight: false, discount: 0, discountTarget: 'retail', tags: [] });
        loadData();
    };

    const handleEditProduct = (product) => {
        setNewProduct({
            name: product.name,
            category: product.category,
            wholesalePrice: product.wholesalePrice,
            retailPrice: product.retailPrice,
            unit: product.unit,
            wholesaleUnit: product.wholesaleUnit,
            image: product.image,
            description: product.description,
            isSpotlight: product.isSpotlight || false,
            discount: product.discount || 0,
            discountTarget: product.discountTarget || 'retail',
            tags: product.tags || []
        });
        setEditingProductId(product.id);
        setIsAddProductOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Delete this product?")) {
            await deleteProduct(id);
            loadData();
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        await updateStoreSettings(storeId, settingsForm);
        loadData();
        alert('Store Updated!');
    };

    // Export to Excel
    const handleExportExcel = async () => {
        if (filteredOrders.length === 0) {
            alert("No orders to export.");
            return;
        }

        const XLSX = await import('xlsx');

        const data = filteredOrders.map(order => {
            const itemsStr = (order.items || []).map(i => i.name + " - " + i.unit + " (x" + i.quantity + ")").join("; ");
            const addressStr = (order.address || '').replace(/\n/g, ' ');
            const mapLoc = order.location ? (order.location.lat + ", " + order.location.lng) : 'N/A';

            return {
                "Order ID": order.id,
                "Date": new Date(order.date).toLocaleDateString(),
                "Time": new Date(order.date).toLocaleTimeString(),
                "Customer Name": order.customer || '',
                "Phone": order.phone || '',
                "Total (Rs)": order.total,
                "Status": order.status,
                "Items": itemsStr,
                "Address": addressStr,
                "Map Location": mapLoc
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
        const fileName = `Orders_${store.name}_${dateFilter || 'All'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    if (loading) return <div className="p-10 text-center">Loading Admin...</div>;

    if (!store) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mx-auto">
                        <Store className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Store Not Found</h2>
                        <p className="text-gray-500 text-sm mt-1">This store does not exist in the database yet.</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-left">
                        <h4 className="font-bold text-yellow-800 text-sm mb-1">New Store Setup</h4>
                        <p className="text-xs text-yellow-700 mb-3">
                            Click below to initialize the store for <strong>{storeId}</strong>.
                        </p>
                        <button
                            onClick={async () => {
                                setLoading(true);
                                const result = await createStore(storeId);
                                alert(result.message);
                                if (result.success) window.location.reload();
                                setLoading(false);
                            }}
                            className="w-full bg-yellow-600 text-white py-2 rounded-lg font-bold hover:bg-yellow-700 transition-colors text-sm"
                        >
                            🏗️ Create Store (Empty)
                        </button>
                    </div>
                    <Link to="/" className="block text-primary-600 text-sm hover:underline">Go Home</Link>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{store.name} Admin</h2>
                        <p className="text-gray-500 text-sm mt-1">Enter Admin ID / Phone Number</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="text"
                            className="w-full text-center text-xl font-bold tracking-widest py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                            placeholder="Your Phone / ID"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors">
                            Unlock Dashboard
                        </button>
                    </form>
                    <div className="text-xs text-center text-gray-400">
                        Default PIN: 1234
                    </div>
                </div>
            </div>
        );
    }

    // Filter Logic
    const filteredOrders = orders
        .filter(order => {
            const matchesDate = !dateFilter || new Date(order.date).toISOString().split('T')[0] === dateFilter;
            const matchesSearch = !searchQuery ||
                (order.customer?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (order.phone?.includes(searchQuery)) ||
                (order.id?.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesDate && matchesSearch;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const handleShare = async () => {
        const url = `${window.location.origin}/store/${storeId}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: store.name,
                    text: `Shop groceries at ${store.name}!`,
                    url: url
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(url);
            alert('Shop link copied to clipboard!');
        }
    };

    return (
        <div className="container mx-auto px-4 pt-24 pb-20 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="w-8 h-8 text-primary-600" />
                        {store.name} Dashboard
                    </h1>
                    <p className="text-gray-500">Manage your products and orders</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleShare} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm shadow-sm">
                        <Share2 className="w-4 h-4" /> Share Shop
                    </button>
                    <Link to={`/store/${storeId}`} className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-semibold hover:bg-primary-100 transition-colors flex items-center gap-2 text-sm">
                        <ExternalLink className="w-4 h-4" />
                        View Live Shop
                    </Link>
                    <Link to="/" className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">

                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'orders' ? 'bg-primary-50 text-primary-700 font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <Package className="w-5 h-5" /> Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'analytics' ? 'bg-primary-50 text-primary-700 font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <ChartIcon className="w-5 h-5" /> Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'products' ? 'bg-primary-50 text-primary-700 font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <Store className="w-5 h-5" /> Products
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-primary-50 text-primary-700 font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <Settings className="w-5 h-5" /> Store Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('broadcast')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'broadcast' ? 'bg-primary-50 text-primary-700 font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <Bell className="w-5 h-5" /> Broadcast
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">

                    {/* Analytics View */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Sales Overview</h2>
                            <AnalyticsDashboard storeId={storeId} />
                        </div>
                    )}

                    {/* Orders View */}
                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-bold">Orders</h2>
                                    <button onClick={loadData} className="text-primary-600 text-sm hover:underline">Refresh</button>
                                </div>
                                <div className="flex-1 max-w-md mx-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by Name, Phone or Order ID..."
                                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    />
                                    <button
                                        onClick={handleExportExcel}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Export Excel
                                    </button>
                                </div>
                            </div>

                            {filteredOrders.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    {dateFilter ? `No orders found for ${dateFilter}` : "No orders yet."}
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-gray-100">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3">Order Ref</th>
                                                <th className="px-4 py-3">Customer</th>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Total</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.map(order => (
                                                <tr key={order.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 font-mono font-medium text-xs text-gray-600">{order.id}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-gray-900">{order.customer}</div>
                                                        <div className="text-xs">{order.phone}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-400">
                                                        {new Date(order.date).toLocaleDateString()} <br />
                                                        {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-gray-900">Rs. {order.total}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                            ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                            ${order.status === 'Verified' ? 'bg-blue-100 text-blue-800' : ''}
                                                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                                                            ${order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                                                        `}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-2 flex-wrap min-w-[140px]">
                                                            {order.location && (
                                                                <button
                                                                    onClick={() => setSelectedOrderForMap(order)}
                                                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition flex items-center gap-1"
                                                                    title="View Map"
                                                                >
                                                                    <MapPin className="w-3 h-3" /> Map
                                                                </button>
                                                            )}
                                                            {order.status === 'Pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => updateStatus(order.id, 'Verified')}
                                                                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                                                                        title="Verify Order"
                                                                    >
                                                                        Verify
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateStatus(order.id, 'Cancelled')}
                                                                        className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 transition"
                                                                        title="Cancel Order"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                            {order.status === 'Verified' && (
                                                                <button
                                                                    onClick={() => updateStatus(order.id, 'Delivered')}
                                                                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                                                >
                                                                    Mark Delivered
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Products View */}
                    {activeTab === 'products' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Inventory</h2>
                                <button
                                    onClick={() => setIsAddProductOpen(!isAddProductOpen)}
                                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-black transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add Product
                                </button>
                            </div>

                            {isAddProductOpen && (
                                <form onSubmit={handleAddProduct} className="p-4 bg-gray-50 rounded-xl mb-6 space-y-4 shadow-sm border border-gray-100">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input required placeholder="Product Name" className="p-2 border rounded" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                                        <input required placeholder="Category" className="p-2 border rounded" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
                                        <input required type="number" placeholder="Retail Price" className="p-2 border rounded" value={newProduct.retailPrice} onChange={e => setNewProduct({ ...newProduct, retailPrice: Number(e.target.value) })} />
                                        <input required type="number" placeholder="Wholesale Price" className="p-2 border rounded" value={newProduct.wholesalePrice} onChange={e => setNewProduct({ ...newProduct, wholesalePrice: Number(e.target.value) })} />
                                        <input required placeholder="Retail Unit (e.g. 1kg)" className="p-2 border rounded" value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })} />
                                        <input placeholder="Wholesale Unit (e.g. 25kg)" className="p-2 border rounded" value={newProduct.wholesaleUnit} onChange={e => setNewProduct({ ...newProduct, wholesaleUnit: e.target.value })} />

                                        {/* New Feature Fields */}
                                        <div className="flex items-center gap-2 p-2 border rounded bg-yellow-50">
                                            <input
                                                type="checkbox"
                                                id="isSpotlight"
                                                checked={newProduct.isSpotlight}
                                                onChange={e => {
                                                    const currentSpotlights = products.filter(p => p.isSpotlight && p.id !== editingProductId).length;
                                                    if (!newProduct.isSpotlight && currentSpotlights >= 5) {
                                                        alert("Max 5 Spotlight products allowed!");
                                                        return;
                                                    }
                                                    setNewProduct({ ...newProduct, isSpotlight: e.target.checked });
                                                }}
                                            />
                                            <label htmlFor="isSpotlight" className="text-sm font-bold text-yellow-800">Spotlight (Carousel)</label>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Discount % (e.g. 10)"
                                            className="p-2 border rounded"
                                            value={newProduct.discount || ''}
                                            onChange={e => setNewProduct({ ...newProduct, discount: Number(e.target.value) })}
                                        />
                                        <select
                                            className="p-2 border rounded bg-white"
                                            value={newProduct.discountTarget || 'retail'}
                                            onChange={e => setNewProduct({ ...newProduct, discountTarget: e.target.value })}
                                        >
                                            <option value="retail">Discount on Retail</option>
                                            <option value="wholesale">Discount on Wholesale</option>
                                            <option value="both">Discount on Both</option>
                                        </select>
                                        <input
                                            placeholder="Tags (comma separated, e.g. New, Spicy)"
                                            className="p-2 border rounded col-span-2"
                                            value={Array.isArray(newProduct.tags) ? newProduct.tags.join(', ') : (newProduct.tags || '')}
                                            onChange={e => setNewProduct({ ...newProduct, tags: e.target.value.split(',').map(t => t.trim()) })}
                                        />

                                        <input placeholder="Image URL (or upload below)" className="p-2 border rounded col-span-2" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="p-2 border rounded text-xs col-span-2" />
                                    </div>
                                    <textarea placeholder="Description" className="w-full p-2 border rounded" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}></textarea>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => { setIsAddProductOpen(false); setEditingProductId(null); setNewProduct({ name: '', category: 'General', wholesalePrice: '', retailPrice: '', unit: '', wholesaleUnit: '', image: '', description: '' }); }} className="px-4 py-2 text-gray-600">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">{editingProductId ? 'Update Product' : 'Save Product'}</button>
                                    </div>
                                </form>
                            )}

                            <div className="grid gap-2 max-h-[500px] overflow-y-auto">
                                {products.map(product => (
                                    <div key={product.id} className="flex items-center gap-4 p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                            {product.image && <img src={product.image} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                            <p className="text-xs text-gray-500">Retail: {product.retailPrice} | Wholesale: {product.wholesalePrice}</p>
                                        </div>
                                        <button onClick={() => handleDeleteProduct(product.id)} className="text-sm text-red-500 hover:text-red-700 mr-3">Delete</button>
                                        <button onClick={() => handleEditProduct(product)} className="text-sm text-primary-600 hover:underline">Edit</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Settings View */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold mb-4">Store Settings</h2>
                            <form onSubmit={handleUpdateSettings} className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={settingsForm.name}
                                        onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={settingsForm.logo}
                                        onChange={e => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Paste an image URL here.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number (Viber/WhatsApp)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={settingsForm.contact}
                                        onChange={e => setSettingsForm({ ...settingsForm, contact: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none"
                                        value={settingsForm.color}
                                        onChange={e => setSettingsForm({ ...settingsForm, color: e.target.value })}
                                    >
                                        <option value="green">Green (Nature/Veg)</option>
                                        <option value="blue">Blue (Corporate/Clean)</option>
                                        <option value="red">Red (Bold/Sale)</option>
                                        <option value="orange">Orange (Friendly)</option>
                                    </select>
                                </div>
                                <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors">
                                    Save Changes
                                </button>
                            </form>

                            <div className="pt-6 border-t border-gray-100 mt-8">
                                <h3 className="font-bold text-gray-700 mb-2">Development Tools</h3>
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-sm text-white">
                                    <p className="text-sm text-indigo-100 mb-3">
                                        <strong>Full Demo Store:</strong> Load 20 products and 150+ dummy orders to test Analytics functionality.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (window.confirm("This will add MANY orders and products to this store. Continue?")) {
                                                const { seedOrders } = await import('../lib/seed');
                                                const s2 = await seedProducts(storeId);
                                                if (s2.success) {
                                                    const s3 = await seedOrders(storeId);
                                                    alert(s3.message);
                                                    loadData();
                                                } else {
                                                    alert(s2.message);
                                                }
                                            }
                                        }}
                                        className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                                    >
                                        🚀 Load Full Analytics Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Broadcast View (Mock) */}
                    {activeTab === 'broadcast' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                                <p><strong>System:</strong> This feature is connected to your Viber/WhatsApp Business Account.</p>
                            </div>
                            <div className="space-y-4">
                                <textarea className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none min-h-[100px]" placeholder="Type your update here..." />
                                <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                                    <Bell className="w-4 h-4" /> Send Notification
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Map Modal */}
            {
                selectedOrderForMap && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
                            <button
                                onClick={() => setSelectedOrderForMap(null)}
                                className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white transition z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <MapPin className="text-primary-600" />
                                    Delivery Location
                                </h2>
                                <p className="text-sm text-gray-500">Order #{selectedOrderForMap.id}</p>
                            </div>
                            <div className="h-[400px]">
                                {selectedOrderForMap.location ? (
                                    <LocationMap position={selectedOrderForMap.location} readOnly={true} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        No map data available for this order.
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 text-sm text-gray-600">
                                <strong>Note:</strong> Used to confirm delivery areas.
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Admin;
