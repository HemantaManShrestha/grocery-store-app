import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { getStoreStats, searchCustomers, getCustomerHistory, getUpcomingSalesPredictions, getSalesHistory } from '../lib/db';
import { Search, User, TrendingUp, Package, DollarSign, ShoppingBag, Bell, MessageCircle } from 'lucide-react';

const AnalyticsDashboard = ({ storeId }) => {
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, topProducts: [] });
    const [loading, setLoading] = useState(true);
    const [forecasts, setForecasts] = useState([]);
    const [salesHistory, setSalesHistory] = useState({ daily: [], weekly: [], monthly: [] });
    const [historyView, setHistoryView] = useState('monthly'); // daily, weekly, monthly

    // Prediction UI State
    const [filterDays, setFilterDays] = useState(3); // 3, 7, 30
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    // Customer Intelligence State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerPredictions, setCustomerPredictions] = useState([]);

    useEffect(() => {
        loadStats();
        loadForecasts();
        loadHistory();
    }, [storeId]);

    const loadStats = async () => {
        setLoading(true);
        const data = await getStoreStats(storeId);
        setStats(data);
        setLoading(false);
    };

    const loadForecasts = async () => {
        const data = await getUpcomingSalesPredictions(storeId);
        setForecasts(data);
    };

    const loadHistory = async () => {
        const h = await getSalesHistory(storeId);
        setSalesHistory(h);
    };

    // Filter Logic
    const filteredForecasts = forecasts.filter(f => f.dueInDays <= filterDays);
    const totalPages = Math.ceil(filteredForecasts.length / ITEMS_PER_PAGE);
    const paginatedForecasts = filteredForecasts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        const results = await searchCustomers(storeId, searchQuery);
        setSearchResults(results);
        setSelectedCustomer(null);
    };

    const selectCustomer = async (customer) => {
        setSelectedCustomer(customer);
        const history = await getCustomerHistory(storeId, customer.phone);
        setCustomerPredictions(history.predictions);
    };

    const sendReminder = (forecast) => {
        const msg = `Namaste ${forecast.customer}! Just checking if you need more ${forecast.product}? We have fresh stock available.`;
        if (confirm(`Send this message?\n\n"${msg}"`)) {
            alert(`Message sent to ${forecast.phone}!`);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Loading Analytics...</div>;

    return (
        <div className="space-y-8">
            {/* SMART FORECAST ALERTS (New Feature) */}
            {forecasts.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Bell className="w-6 h-6 animate-bounce" /> Smart Sales Opportunities
                                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">{filteredForecasts.length} Found</span>
                                </h3>
                                <p className="text-indigo-100 text-sm mt-1">
                                    Customers likely to buy within the selected timeframe.
                                </p>
                            </div>

                            {/* Filters */}
                            <div className="flex bg-indigo-800/30 p-1 rounded-lg">
                                {[
                                    { label: '3 Days', val: 3 },
                                    { label: 'Week', val: 7 },
                                    { label: 'Month', val: 30 }
                                ].map(opt => (
                                    <button
                                        key={opt.val}
                                        onClick={() => { setFilterDays(opt.val); setCurrentPage(1); }}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${filterDays === opt.val ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-200 hover:bg-white/10'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {paginatedForecasts.length === 0 ? (
                            <div className="text-center py-10 bg-white/5 rounded-xl border border-white/10 border-dashed">
                                <p className="text-indigo-200">No predictions found for this timeframe.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                {paginatedForecasts.map((forecast, idx) => (
                                    <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-lg">{forecast.customer}</h4>
                                                <p className="text-xs text-indigo-200">{forecast.phone}</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-bold ${forecast.dueInDays <= 0 ? 'bg-red-500/80 text-white' : 'bg-green-500/80 text-white'}`}>
                                                {forecast.dueInDays === 0 ? 'Due Today' : forecast.dueInDays < 0 ? 'Overdue' : 'Due ' + new Date(forecast.dueDate).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4 text-sm">
                                            <Package className="w-4 h-4 text-indigo-300" />
                                            <span>Likely needs: <strong>{forecast.product}</strong></span>
                                        </div>

                                        <button
                                            onClick={() => sendReminder(forecast)}
                                            className="w-full bg-white text-indigo-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition shadow-sm"
                                        >
                                            <MessageCircle className="w-4 h-4" /> Send Reminder
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 text-xs font-bold transition"
                                >
                                    Previous
                                </button>
                                <span className="text-xs font-mono bg-indigo-900/30 px-2 py-1 rounded">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 text-xs font-bold transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* High-Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                        <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                        <h3 className="text-2xl font-bold">Rs. {stats.totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Top Product</p>
                        <h3 className="text-lg font-bold truncate max-w-[150px]">
                            {stats.topProducts[0]?.name || 'N/A'}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Sales History Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold">Revenue History</h3>
                        <p className="text-sm text-gray-500">Track your store's performance over time.</p>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['Daily', 'Weekly', 'Monthly'].map(view => (
                            <button
                                key={view}
                                onClick={() => setHistoryView(view.toLowerCase())}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition ${historyView === view.toLowerCase() ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    {salesHistory[historyView] && salesHistory[historyView].length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesHistory[historyView]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    tickFormatter={(val) => {
                                        if (historyView === 'weekly') return val.split('-W')[1] ? 'W' + val.split('-W')[1] : val;
                                        const d = new Date(val);
                                        if (isNaN(d.getTime())) return val;
                                        if (historyView === 'monthly') return d.toLocaleDateString('default', { month: 'short', year: '2-digit' });
                                        if (historyView === 'daily') return d.getDate();
                                        return val;
                                    }}
                                />
                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8 }}
                                    name="Revenue"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            No history data available yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders Verification requested by user */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Recent Order Log (Verification)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Order ID</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats.recentOrders || []).map(order => (
                                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {order.customer} <br /><span className="text-gray-400 text-xs font-normal">{order.phone}</span>
                                    </td>
                                    <td className="px-4 py-3">Rs. {order.total}</td>
                                    <td className="px-4 py-3">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">No recent orders found. Load Demo Data to see 150+ transactions.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Products Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6">Best Selling Items</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 40 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                    {stats.topProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#60a5fa', '#93c5fd'][index % 3]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Customer Intelligence */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" /> Customer Predictions
                    </h3>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <input
                            placeholder="Search Customer Name or Phone..."
                            className="flex-1 p-3 border rounded-xl text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition shadow-sm">
                            <Search className="w-5 h-5" />
                        </button>
                    </form>

                    {/* Results / Selection */}
                    <div className="flex-1 min-h-[200px] border rounded-xl overflow-hidden flex flex-col md:flex-row bg-gray-50">
                        {/* List */}
                        <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto max-h-[300px] bg-white">
                            {searchResults.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-gray-400 text-center">
                                    <Search className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-xs">Search for a customer to see their history</p>
                                </div>
                            ) : (
                                searchResults.map((c, i) => (
                                    <div
                                        key={i}
                                        onClick={() => selectCustomer(c)}
                                        className={`p-3 text-sm cursor-pointer hover:bg-indigo-50 border-b border-gray-100 transition ${selectedCustomer?.phone === c.phone ? 'bg-indigo-50 border-l-4 border-l-indigo-500 font-medium' : ''}`}
                                    >
                                        <p className="truncate font-semibold text-gray-800">{c.customer}</p>
                                        <p className="text-xs text-gray-500">{c.phone}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-6 bg-white flex flex-col">
                            {selectedCustomer ? (
                                <div className="space-y-6 animate-fadeIn">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                {selectedCustomer.customer[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-900">{selectedCustomer.customer}</h4>
                                                <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100">
                                        <p className="text-xs font-bold text-indigo-800 uppercase mb-3 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> Next Purchase Prediction
                                        </p>
                                        {customerPredictions.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {customerPredictions.map(item => (
                                                    <span key={item} className="bg-white text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm border border-indigo-100 flex items-center gap-1">
                                                        <Package className="w-3 h-3 text-indigo-400" /> {item}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-indigo-400 italic">Not enough purchase history yet.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300 text-sm">
                                    <User className="w-12 h-12 mb-3 opacity-20" />
                                    <p>Select a customer to view AI insights</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
