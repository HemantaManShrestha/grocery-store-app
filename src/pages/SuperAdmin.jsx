
import { useState, useEffect } from 'react';
import { getAllStores, createStore, deleteStore, uploadImage } from '../lib/db';
import { createDemoStore } from '../lib/seed';
import { Trash2, Plus, ExternalLink, RefreshCw, Copy, Check, Info } from 'lucide-react';

const SuperAdmin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);

    // Create Store Form
    const [newStore, setNewStore] = useState({
        id: '',
        name: '',
        color: 'green',
        logo: '',
        contact: '',
        adminIds: '' // Comma separated
    });

    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadStores();
        }
    }, [isAuthenticated]);

    const loadStores = async () => {
        setLoading(true);
        const data = await getAllStores();
        setStores(data);
        setLoading(false);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (pin === '9999') {
            setIsAuthenticated(true);
        } else {
            alert("Invalid Master Key");
        }
    };

    // Image Compression Utility
    const compressImage = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.8);
                };
            };
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // const compressedFile = await compressImage(file);
            const result = await uploadImage(file);
            if (result.success) {
                setNewStore({ ...newStore, logo: result.url });
            } else {
                alert("Upload failed: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error processing image.");
        }
    };



    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newStore.id || !newStore.name) return;

        // Process admin IDs
        const adminIdsArray = newStore.adminIds
            .split(',')
            .map(id => id.trim())
            .filter(id => id.length > 0);

        const result = await createStore({
            ...newStore,
            adminIds: adminIdsArray
        });

        if (result.success) {
            alert("Store created! Share the link with the manager.");
            setNewStore({ id: '', name: '', color: 'green', logo: '', contact: '', adminIds: '' });
            loadStores();
        } else {
            alert("Error: " + result.message);
        }
    };

    const handleDelete = async (storeId) => {
        if (window.confirm(`Are you sure you want to delete ${storeId}? This cannot be undone.`)) {
            const result = await deleteStore(storeId);
            if (result.success) {
                loadStores();
            } else {
                alert("Error deleting store");
            }
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
                <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 text-center">
                    <h1 className="text-3xl font-bold mb-8">Super Admin</h1>
                    <input
                        type="password"
                        placeholder="Enter Master PIN"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-center text-xl tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition">
                        Unlock Access
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">

                <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Platform Management</h1>
                        <p className="text-gray-500">Manage all stores and access master controls.</p>
                    </div>
                    <button onClick={loadStores} className="p-2 hover:bg-gray-100 rounded-full transition" title="Refresh">
                        <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Create Store Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" /> Create New Store
                            </h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Store ID (URL Slug)</label>
                                    <input
                                        required
                                        placeholder="e.g. kathmandu-mart"
                                        className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition"
                                        value={newStore.id}
                                        onChange={e => setNewStore({ ...newStore, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Store Name</label>
                                    <input
                                        required
                                        placeholder="e.g. Kathmandu Mart"
                                        className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition"
                                        value={newStore.name}
                                        onChange={e => setNewStore({ ...newStore, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Theme</label>
                                        <select
                                            className="w-full p-3 border rounded-lg bg-gray-50"
                                            value={newStore.color}
                                            onChange={e => setNewStore({ ...newStore, color: e.target.value })}
                                        >
                                            <option value="green">Green</option>
                                            <option value="blue">Blue</option>
                                            <option value="red">Red</option>
                                            <option value="orange">Orange</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Logo</label>
                                        <div className="space-y-2">
                                            <input
                                                placeholder="Image URL"
                                                className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition"
                                                value={newStore.logo}
                                                onChange={e => setNewStore({ ...newStore, logo: e.target.value })}
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="w-full text-xs text-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                        Admin Phones <span className="text-gray-300 font-normal">(Max 3)</span>
                                    </label>
                                    <input
                                        placeholder="98..., 97..., 98..."
                                        className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition"
                                        value={newStore.adminIds}
                                        onChange={e => setNewStore({ ...newStore, adminIds: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Comma separated phone numbers.</p>
                                </div>

                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition">
                                    Create Store
                                </button>
                            </form>
                        </div>

                        {/* Demo Store Generator */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg mt-6 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                🚀 Need a Demo?
                            </h3>
                            <p className="text-indigo-100 text-sm mb-4">
                                Generate a full demo store with 20 products and 150+ dummy orders to test Analytics.
                            </p>
                            <button
                                onClick={async () => {
                                    if (window.confirm("Create a new Demo Store?")) {
                                        setLoading(true);
                                        const result = await createDemoStore();
                                        alert(result.message);
                                        loadStores();
                                        setLoading(false);
                                    }
                                }}
                                className="w-full bg-white text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-xl"
                            >
                                Generate Demo Store
                            </button>
                        </div>
                    </div>

                    {/* Store List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800">Active Stores ({stores.length})</h2>

                        {stores.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-400">No stores found. Create one to get started.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {stores.map(store => {
                                    const adminLink = `${window.location.origin}/store/${store.id}/admin`;

                                    return (
                                        <div key={store.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col md:flex-row gap-6 items-start md:items-center">

                                            <div className={`w-16 h-16 rounded-2xl bg-${store.color}-100 flex items-center justify-center text-3xl font-bold text-${store.color}-600 shrink-0`}>
                                                {store.name[0]}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-gray-900 truncate">{store.name}</h3>
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">{store.id}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                                    <span>Admins: {store.admin_ids ? store.admin_ids.join(', ') : 'None'}</span>
                                                    <span>•</span>
                                                    <span>Color: {store.color}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => copyToClipboard(adminLink, store.id)}
                                                        className="flex-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 border border-gray-200"
                                                    >
                                                        {copiedId === store.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                                        Manager Link
                                                    </button>
                                                    <a
                                                        href={`/store/${store.id}`}
                                                        target="_blank"
                                                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        Visit
                                                    </a>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(store.id)}
                                                    className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete Store
                                                </button>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SuperAdmin;
