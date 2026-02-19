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
        tags: p.tags
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
