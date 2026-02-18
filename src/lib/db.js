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
        storeId: p.store_id
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
        image: product.image,
        description: product.description
    };

    const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single();

    if (error) console.error('Error adding product:', error);
    return data;
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
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderId = `ORD-${timestamp}-${random}`;

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
