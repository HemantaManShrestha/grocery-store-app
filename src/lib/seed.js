
import { supabase } from './supabaseClient';

export const seedDatabase = async (storeId) => {
    console.log("Seeding database for store:", storeId);

    // 1. Ensure Store Exists
    const { error: storeError } = await supabase
        .from('stores')
        .upsert({
            id: storeId,
            name: "Ram's Kirana (Cloud)",
            logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200",
            contact: "9841XXXXXX",
            color: "green"
        });

    if (storeError) {
        console.error("Error creating store:", storeError);
        return { success: false, message: "Failed to create store." };
    }

    // 2. Define Products
    const products = [
        // Rice
        {
            store_id: storeId,
            name: "Premium Basmati Rice (Long Grain)",
            category: "Rice",
            wholesale_price: 2100,
            retail_price: 2400,
            unit: "20kg bag",
            image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
            description: "High quality aromatic basmati rice, perfect for biryani."
        },
        {
            store_id: storeId,
            name: "Jeera Masino Rice",
            category: "Rice",
            wholesale_price: 1750,
            retail_price: 1950,
            unit: "25kg bag",
            image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600",
            description: "Locally sourced Jeera Masino rice for daily consumption."
        },
        // Cold Drinks
        {
            store_id: storeId,
            name: "Coca Cola",
            category: "Cold Drinks",
            wholesale_price: 250,
            retail_price: 270,
            unit: "2.25L Bottle",
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600",
            description: "Chilled Coca Cola for refreshment."
        },
        {
            store_id: storeId,
            name: "Sprite",
            category: "Cold Drinks",
            wholesale_price: 250,
            retail_price: 270,
            unit: "2.25L Bottle",
            image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&q=80&w=600",
            description: "Clear lemon-lime sparkling beverage."
        },
        // Drinks / Juices
        {
            store_id: storeId,
            name: "Real Fruit Juice (Mixed)",
            category: "Drinks",
            wholesale_price: 220,
            retail_price: 250,
            unit: "1L Pack",
            image: "https://images.unsplash.com/photo-1613478223719-2db429127542?auto=format&fit=crop&q=80&w=600",
            description: "Healthy mixed fruit juice with no added preservatives."
        },
        {
            store_id: storeId,
            name: "Mineral Water Jar",
            category: "Drinks",
            wholesale_price: 40,
            retail_price: 50,
            unit: "20L Jar",
            image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&q=80&w=600",
            description: "Pure processed drinking water."
        },
        // Snacks (General)
        {
            store_id: storeId,
            name: "Wai Wai Noodles",
            category: "Snacks",
            wholesale_price: 18,
            retail_price: 20,
            unit: "Packet",
            image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=600",
            description: "Nepal's favorite instant noodles."
        },
        {
            store_id: storeId,
            name: "Digestive Biscuits",
            category: "Snacks",
            wholesale_price: 90,
            retail_price: 100,
            unit: "Pack",
            image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=600",
            description: "High fiber digestive biscuits."
        },
        // Essentials
        {
            store_id: storeId,
            name: "Sunflower Oil",
            category: "Essentials",
            wholesale_price: 230,
            retail_price: 250,
            unit: "1L Pouch",
            image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600",
            description: "Refined sunflower cooking oil."
        }
    ];

    const { error: productsError } = await supabase
        .from('products')
        .insert(products);

    if (productsError) {
        console.error("Error seeding products:", productsError);
        return { success: false, message: "Store created, but failed to add products." };
    }

    return { success: true, message: "Database populated with Store and Sample Products!" };
};
