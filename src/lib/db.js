import { supabase } from './supabaseClient';

// --- Store Functions ---

export const initializeDb = async () => {
    // No-op for Supabase as tables are created via SQL
    console.log("Supabase DB Initialized");
};

export const getStore = async (storeId) => {
    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

    if (error) console.error('Error fetching store:', error);
    return data;
};

export const updateStoreSettings = async (storeId, updates) => {
    const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', storeId)
        .select()
        .single();

    if (error) console.error('Error updating store:', error);
    return data;
};

export const getAllStores = async () => {
    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('id', { ascending: true });

    if (error) console.error('Error fetching all stores:', error);
    return data || [];
};

export const createStore = async (storeData) => {
    const { data, error } = await supabase
        .from('stores')
        .insert([{
            id: storeData.id,
            name: storeData.name,
            color: storeData.color,
            logo: storeData.logo,
            contact: storeData.contact,
            admin_ids: storeData.adminIds // Array of strings
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating store:', error);
        return { success: false, message: error.message };
    }
    return { success: true, data };
};

export const deleteStore = async (storeId) => {
    // 1. Delete products first (cascade usually handles this but let's be safe)
    await supabase.from('products').delete().eq('store_id', storeId);

    // 2. Delete orders
    await supabase.from('orders').delete().eq('store_id', storeId);

    // 3. Delete store
    const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId);

    if (error) {
        console.error('Error deleting store:', error);
        return { success: false, message: error.message };
    }
    return { success: true };
};

export const uploadImage = async (file) => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('store_images')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('store_images')
            .getPublicUrl(filePath);

        return { success: true, url: data.publicUrl };
    } catch (error) {
        console.error('Error uploading image:', error);
        return { success: false, error: error.message };
    }
};

// --- Product Functions ---

export const getStoreProducts = async (storeId) => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId);

    if (error) console.error('Error fetching products:', error);

    if (!data) return [];

    // Map DB snake_case to Frontend camelCase
    return data.map(p => ({
        ...p,
        retailPrice: p.retail_price,
        wholesalePrice: p.wholesale_price,
        wholesaleUnit: p.wholesale_unit,
        storeId: p.store_id,
        isSpotlight: p.is_spotlight,
        discount: p.discount,
        discountTarget: p.discount_target || 'retail',
        tags: p.tags
    }));
};

export const addProduct = async (product) => {
    // Map frontend camelCase to DB snake_case
    const dbProduct = {
        store_id: product.storeId,
        name: product.name,
        category: product.category,
        wholesale_price: product.wholesalePrice,
        retail_price: product.retailPrice,
        unit: product.unit,
        wholesale_unit: product.wholesaleUnit, // Add this
        image: product.image,
        description: product.description,
        is_spotlight: product.isSpotlight || false,
        discount: product.discount || 0,
        discount_target: product.discountTarget || 'retail',
        tags: product.tags || []
    };

    const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select();

    if (error) {
        console.error('Error adding product:', error);
        return null;
    }
    return data[0];
};

export const updateProduct = async (product) => {
    const dbProduct = {
        name: product.name,
        category: product.category,
        wholesale_price: product.wholesalePrice,
        retail_price: product.retailPrice,
        unit: product.unit,
        wholesale_unit: product.wholesaleUnit,
        image: product.image,
        description: product.description,
        is_spotlight: product.isSpotlight,
        discount: product.discount,
        discount_target: product.discountTarget,
        tags: product.tags
    };

    const { data, error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', product.id)
        .select()
        .single();

    if (error) console.error('Error updating product:', error);
    return data;
};

export const deleteProduct = async (productId) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) {
        console.error('Error deleting product:', error);
        return { success: false, message: error.message };
    }
    return { success: true };
};

// --- Order Functions ---

export const getStoreOrders = async (storeId) => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId);

    if (error) console.error('Error fetching orders:', error);
    return data || [];
};

export const addOrder = async (order) => {
    // Generate ID on client or let DB handle it? 
    // DB handles ID usually, but we want a readable one?
    // Let's use the same ID generation logic but passed to DB
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    const orderId = `ORD-${timestamp.slice(-6)}-${random}`;

    const dbOrder = {
        id: orderId,
        store_id: order.storeId,
        customer: order.customer,
        phone: order.phone,
        address: order.address,
        location: order.location, // jsonb
        items: order.items,       // jsonb
        total: order.total,
        status: 'Pending',
        is_verified: false
    };

    const { data, error } = await supabase
        .from('orders')
        .insert([dbOrder])
        .select()
        .single();

    if (error) console.error('Error adding order:', error);
    return data;
};

export const updateOrderStatus = async (orderId, newStatus) => {
    const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .single();

    if (error) console.error('Error updating order:', error);
    return data;
};
// --- Analytics Functions ---

export const logEvent = async (storeId, eventType, details) => {
    // details: { productId, customerPhone, metadata }
    const { error } = await supabase
        .from('analytics_events')
        .insert([{
            store_id: storeId,
            event_type: eventType,
            product_id: details.productId || null,
            customer_phone: details.customerPhone || null,
            metadata: details.metadata || {}
        }]);

    if (error) console.error('Error logging event:', error);
};

export const getStoreStats = async (storeId) => {
    // Get total orders and revenue
    // This is simple client-side aggregation. For production, use DB function.
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId);

    if (error || !orders) return { totalOrders: 0, totalRevenue: 0, topProducts: [], recentOrders: [] };

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Calculate Top Products from orders
    const productCounts = {};
    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const name = item.name;
                productCounts[name] = (productCounts[name] || 0) + item.quantity;
            });
        }
    });

    const topProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    // Get recent 10 orders for verification
    const recentOrders = orders
        .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
        .slice(0, 10);

    return { totalOrders, totalRevenue, topProducts, recentOrders };
};

export const getSalesHistory = async (storeId) => {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('total, date, created_at')
        .eq('store_id', storeId)
        .order('date', { ascending: true });

    if (error || !orders) return { daily: [], weekly: [], monthly: [] };

    const daily = {};
    const monthly = {};
    const weekly = {};

    orders.forEach(order => {
        const date = new Date(order.date || order.created_at);
        const dayKey = date.toISOString().split('T')[0];
        const monthKey = dayKey.substring(0, 7); // YYYY-MM

        // Simple week key: YYYY-W(week number)
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((days + 1) / 7);
        const weekKey = `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;

        // Aggregate
        daily[dayKey] = (daily[dayKey] || 0) + (order.total || 0);
        monthly[monthKey] = (monthly[monthKey] || 0) + (order.total || 0);
        weekly[weekKey] = (weekly[weekKey] || 0) + (order.total || 0);
    });

    // Convert to sorted arrays
    const toArray = (obj) => Object.entries(obj).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));

    return {
        daily: toArray(daily).slice(-30), // Last 30 days
        weekly: toArray(weekly).slice(-12), // Last 12 weeks
        monthly: toArray(monthly).slice(-12) // Last 12 months
    };
};

export const searchCustomers = async (storeId, query) => {
    // Search in orders table for unique customers
    const { data, error } = await supabase
        .from('orders')
        .select('customer, phone')
        .eq('store_id', storeId)
        .or(`customer.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('date', { ascending: false }) // Get most recent
        .limit(50);

    if (error) {
        console.error('Error searching customers:', error);
        return [];
    }

    // Deduplicate by phone
    const unique = [];
    const seen = new Set();
    data.forEach(c => {
        if (c.phone && !seen.has(c.phone)) {
            seen.add(c.phone);
            unique.push(c);
        }
    });
    return unique;
};

export const getCustomerHistory = async (storeId, phone) => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .eq('phone', phone)
        .order('date', { ascending: false });

    if (error) return { orders: [], predictions: [] };

    // Calculate "Next Likely Purchase"
    // Algorithm: Find items bought > 1 times (since random data might be sparse, let's say > 1)
    const itemFrequency = {};
    data.forEach(order => {
        (order.items || []).forEach(item => {
            itemFrequency[item.name] = (itemFrequency[item.name] || 0) + 1;
        });
    });

    const predictions = Object.entries(itemFrequency)
        .filter(([_, count]) => count > 1)
        .map(([name]) => name);

    return { orders: data, predictions };
};

// Analytics: Smart Sales Predictions for Store Owner
export const getUpcomingSalesPredictions = async (storeId) => {
    // 1. Fetch all orders (we need history to calculate intervals)
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .order('date', { ascending: true }); // Oldest first

    if (error || !orders) return [];

    // 2. Group by Customer -> Product -> Dates
    // Structure: { customerPhone: { productName: [date1, date2, ...] } }
    const history = {};
    const customerInfo = {}; // to store name for phone

    orders.forEach(order => {
        if (!order.items || !Array.isArray(order.items)) return;

        customerInfo[order.phone] = order.customer;

        order.items.forEach(item => {
            if (!history[order.phone]) history[order.phone] = {};
            if (!history[order.phone][item.name]) history[order.phone][item.name] = [];

            history[order.phone][item.name].push(new Date(order.date || order.created_at));
        });
    });

    const predictions = [];
    const today = new Date();

    // 3. Analyze Patterns
    Object.keys(history).forEach(phone => {
        Object.keys(history[phone]).forEach(productName => {
            const dates = history[phone][productName];

            // Need at least 2 purchases to establish an interval pattern
            if (dates.length < 2) return;

            // Calculate average interval in days
            let totalDays = 0;
            for (let i = 1; i < dates.length; i++) {
                const diffTime = Math.abs(dates[i] - dates[i - 1]);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalDays += diffDays;
            }

            const avgIntervalRaw = totalDays / (dates.length - 1);
            // Round to nearest int for simpler logic, but keep raw for precision? round is fine.
            const avgInterval = Math.round(avgIntervalRaw);

            if (avgInterval < 3) return; // Ignore very frequent/random small buys

            const lastPurchaseDate = dates[dates.length - 1];
            const nextPredictedDate = new Date(lastPurchaseDate);
            nextPredictedDate.setDate(nextPredictedDate.getDate() + avgInterval);

            // Check if "Due" is near Today
            // Logic: "Due" means nextPredictedDate is roughly Today, Tomorrow, or Day After (or slightly overdue)
            const diffFromTodayTime = nextPredictedDate - today;
            const diffFromTodayDays = Math.ceil(diffFromTodayTime / (1000 * 60 * 60 * 24));

            // We want to show items due soon (widen range to support filtering)
            // Range: Overdue by 10 days ... Due in next 60 days
            if (diffFromTodayDays >= -10 && diffFromTodayDays <= 60) {
                predictions.push({
                    customer: customerInfo[phone],
                    phone: phone,
                    product: productName,
                    lastBuy: lastPurchaseDate.toISOString().split('T')[0],
                    avgInterval: avgInterval,
                    dueInDays: diffFromTodayDays, // 0 = Today, 1 = Tomorrow, -1 = Yesterday
                    dueDate: nextPredictedDate.toISOString().split('T')[0]
                });
            }
        });
    });

    // Sort by Due Date (Overdue first, then today, then future)
    return predictions.sort((a, b) => a.dueInDays - b.dueInDays);
};
