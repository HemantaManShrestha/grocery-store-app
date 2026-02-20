import { supabase } from './supabaseClient';

export const createStore = async (storeId) => {
    console.log("Creating store:", storeId);

    // 1. Ensure Store Exists (Idempotent)
    const { error: storeError } = await supabase
        .from('stores')
        .upsert({
            id: storeId,
            name: "Ram's Kirana (Demo)",
            logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200",
            contact: "9841XXXXXX",
            color: "blue",
            admin_ids: ["9841000000"] // Default admin for demo
        });

    if (storeError) {
        console.error("Error creating store:", storeError);
        return { success: false, message: "Failed to create store: " + (storeError.message || JSON.stringify(storeError)) };
    }

    return { success: true, message: "Store created successfully!" };
};

export const seedProducts = async (storeId) => {
    console.log("Seeding products for store:", storeId);

    // 2. Define Products (20 Items)
    const products = [
        // Rice & Staples
        { store_id: storeId, name: "Premium Basmati Rice", category: "Rice", wholesale_price: 2100, retail_price: 2400, unit: "20kg bag", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600", description: "Long grain aromatic rice.", discount: 10, discount_target: 'retail' },
        { store_id: storeId, name: "Jeera Masino Rice", category: "Rice", wholesale_price: 1750, retail_price: 1950, unit: "25kg bag", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600", description: "Daily use rice.", discount: 5, discount_target: 'wholesale' },
        { store_id: storeId, name: "Sona Mansuli Rice", category: "Rice", wholesale_price: 1500, retail_price: 1700, unit: "30kg bag", image: "https://images.unsplash.com/photo-1596568359553-a56de6970068?auto=format&fit=crop&q=80&w=600", description: "Economical rice option.", discount: 15, discount_target: 'both' },
        { store_id: storeId, name: "Red Lentils (Masoor)", category: "Pulses", wholesale_price: 120, retail_price: 140, unit: "1kg Pack", image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&q=80&w=600", description: "Rich in protein." },
        { store_id: storeId, name: "Chickpeas (Chana)", category: "Pulses", wholesale_price: 140, retail_price: 160, unit: "1kg Pack", image: "https://images.unsplash.com/photo-1585996650228-44d5673663b6?auto=format&fit=crop&q=80&w=600", description: "Great for curry." },

        // Drinks
        { store_id: storeId, name: "Coca Cola", category: "Cold Drinks", wholesale_price: 250, retail_price: 270, unit: "2.25L Bottle", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600", description: "Chilled refreshment." },
        { store_id: storeId, name: "Sprite", category: "Cold Drinks", wholesale_price: 250, retail_price: 270, unit: "2.25L Bottle", image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&q=80&w=600", description: "Lemon-lime soda." },
        { store_id: storeId, name: "Fanta", category: "Cold Drinks", wholesale_price: 250, retail_price: 270, unit: "2.25L Bottle", image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&q=80&w=600", description: "Orange soda." },
        { store_id: storeId, name: "Real Mixed Fruit", category: "Juices", wholesale_price: 220, retail_price: 250, unit: "1L Pack", image: "https://images.unsplash.com/photo-1613478223719-2db429127542?auto=format&fit=crop&q=80&w=600", description: "Healthy juice." },
        { store_id: storeId, name: "Mineral Water Jar", category: "Water", wholesale_price: 40, retail_price: 50, unit: "20L Jar", image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&q=80&w=600", description: "Pure drinking water." },

        // Snacks
        { store_id: storeId, name: "Wai Wai Noodles", category: "Snacks", wholesale_price: 18, retail_price: 20, unit: "Packet", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=600", description: "Ready to eat noodles." },
        { store_id: storeId, name: "Rara Noodles", category: "Snacks", wholesale_price: 18, retail_price: 20, unit: "Packet", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=600", description: "Classic white noodles." },
        { store_id: storeId, name: "Digestive Biscuits", category: "Biscuits", wholesale_price: 90, retail_price: 100, unit: "Pack", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=600", description: "Healthy snack." },
        { store_id: storeId, name: "Marie Gold", category: "Biscuits", wholesale_price: 40, retail_price: 50, unit: "Pack", image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=600", description: "Tea time biscuit." },
        { store_id: storeId, name: "Lays Chips (Classic)", category: "Chips", wholesale_price: 45, retail_price: 50, unit: "Pack", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=600", description: "Salted chips." },

        // Essentials
        { store_id: storeId, name: "Sunflower Oil", category: "Oil", wholesale_price: 230, retail_price: 250, unit: "1L Pouch", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600", description: "Cooking oil." },
        { store_id: storeId, name: "Mustard Oil", category: "Oil", wholesale_price: 280, retail_price: 320, unit: "1L Bottle", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600", description: "Traditional cooking oil." },
        { store_id: storeId, name: "Salt (Aayo Noon)", category: "Spices", wholesale_price: 20, retail_price: 25, unit: "1kg Packet", image: "https://images.unsplash.com/photo-1518110925495-5cb258beaeba?auto=format&fit=crop&q=80&w=600", description: "Iodized salt." },
        { store_id: storeId, name: "Sugar", category: "Essentials", wholesale_price: 90, retail_price: 100, unit: "1kg Pack", image: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&q=80&w=600", description: "White sugar." },
        { store_id: storeId, name: "Tea Dust (Tokla)", category: "Beverages", wholesale_price: 350, retail_price: 400, unit: "500g Pack", image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=600", description: "Strong CTC tea." }
    ];

    // Check existing products to avoid duplicates manually (safer than upsert if constraint missing)
    const { data: existing } = await supabase
        .from('products')
        .select('name')
        .eq('store_id', storeId);

    const existingNames = new Set((existing || []).map(p => p.name));

    // Filter out products that already exist
    const newProducts = products.filter(p => !existingNames.has(p.name));

    if (newProducts.length === 0) {
        return { success: true, message: "Products already seeded!" };
    }

    // Insert only new products
    const { error: productsError } = await supabase
        .from('products')
        .insert(newProducts);

    if (productsError) {
        console.error("Error seeding products:", productsError);
        return { success: false, message: "Failed to add products: " + (productsError.message || JSON.stringify(productsError)) };
    }

    return { success: true, message: "Sample products added successfully!" };
};

export const seedOrders = async (storeId) => {
    console.log("Seeding orders for store:", storeId);

    // 1. Get Products
    const { data: dbProducts } = await supabase.from('products').select('*').eq('store_id', storeId);
    if (!dbProducts || dbProducts.length === 0) return { success: false, message: "No products found to order." };

    // 2. Define Customers
    const customers = [
        { name: "Ram Sharma", phone: "9841111111", pref: ["Coca Cola", "Wai Wai Noodles"] },
        { name: "Sita Pyakurel", phone: "9841222222", pref: ["Premium Basmati Rice", "Sunflower Oil"] },
        { name: "Hari Krishna", phone: "9841333333", pref: ["Mineral Water Jar", "Digestive Biscuits"] },
        { name: "Gita Thapa", phone: "9841444444", pref: ["Sugar", "Tea Dust (Tokla)", "Marie Gold"] },
        { name: "Ramesh Gupta", phone: "9841555555", pref: ["Sprite", "Lays Chips (Classic)"] },
        { name: "Nita Adhikari", phone: "9841666666", pref: ["Jeera Masino Rice", "Red Lentils (Masoor)"] },
        { name: "Bikash Lama", phone: "9841777777", pref: ["Coca Cola", "Wai Wai Noodles", "Rara Noodles"] },
        { name: "Mina Shrestha", phone: "9841888888", pref: ["Mustard Oil", "Salt (Aayo Noon)", "Chickpeas (Chana)"] },
        { name: "Arjun Singh", phone: "9841999999", pref: ["Real Mixed Fruit", "Digestive Biscuits"] },
        { name: "Sarita Magar", phone: "9860111111", pref: ["Sona Mansuli Rice", "Sunflower Oil"] },
        { name: "Kiran KC", phone: "9860222222", pref: ["Fanta", "Lays Chips (Classic)"] },
        { name: "Deepa Joshi", phone: "9860333333", pref: ["Tea Dust (Tokla)", "Sugar", "Marie Gold"] },
        { name: "Suresh Tamang", phone: "9860444444", pref: ["Wai Wai Noodles", "Coca Cola"] },
        { name: "Puja Raya", phone: "9860555555", pref: ["Premium Basmati Rice", "Chickpeas (Chana)"] },
        { name: "Rajesh Hamal", phone: "9860666666", pref: ["Mineral Water Jar", "Digestive Biscuits"] }
    ];

    const orders = [];

    // 3. Generate Random Noise Orders (100 orders)
    for (let i = 0; i < 100; i++) {
        const cust = customers[Math.floor(Math.random() * customers.length)];
        const orderItems = [];
        const numItems = Math.floor(Math.random() * 3) + 1;

        for (let j = 0; j < numItems; j++) {
            const product = dbProducts[Math.floor(Math.random() * dbProducts.length)];
            if (product) {
                orderItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.retail_price,
                    quantity: Math.floor(Math.random() * 2) + 1,
                    unit: product.unit
                });
            }
        }

        const total = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 365) - 5); // 5-370 days ago
        const dateStr = date.toISOString();

        orders.push({
            id: `ORD-NOISE-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
            store_id: storeId,
            customer: cust.name,
            phone: cust.phone,
            address: "Kathmandu, Nepal",
            location: { lat: 27.7, lng: 85.3 },
            items: orderItems,
            total,
            status: 'Delivered',
            date: dateStr
        });
    }

    // 4. Generate STRICT PATTERN Orders (Crucial for Analytics Demo)
    // We want these people to be "Due Today", "Due next week", "Due next month", etc.
    const patterns = [
        // Ram buys Rice every 21 days. Last buy 21 days ago. Due Now.
        { phone: "9841111111", itemName: "Premium Basmati Rice", interval: 21, count: 4 },
        // Sita buys Oil every 30 days. Last buy 30 days ago. Due Today.
        { phone: "9841222222", itemName: "Sunflower Oil", interval: 30, count: 5 },
        // Hari buys Water every 7 days. Last buy 7 days ago. Due Today.
        { phone: "9841333333", itemName: "Mineral Water Jar", interval: 7, count: 12 },

        // NEW: "Due This Month" (e.g. Due in 10-15 days)
        // Gita buys Sugar every 30 days. Last buy 15 days ago. Due in 15 days.
        { phone: "9841444444", itemName: "Sugar", interval: 30, count: 6, offset: 15 },
        // Ramesh buys Sprite every 14 days. Last buy 4 days ago. Due in 10 days.
        { phone: "9841555555", itemName: "Sprite", interval: 14, count: 10, offset: 4 },

        // NEW: "Due Next Month" (e.g. Due in 30+ days)
        // Nita buys 25kg Rice every 60 days. Last buy 10 days ago. Due in 50 days.
        { phone: "9841666666", itemName: "Jeera Masino Rice", interval: 60, count: 3, offset: 10 },
        // Bikash buys Oil every 45 days. Last buy 5 days ago. Due in 40 days.
        { phone: "9841777777", itemName: "Sunflower Oil", interval: 45, count: 4, offset: 5 },

        // NEW: "Overdue" (e.g. Due 3 days ago)
        // Mina buys Tea every 30 days. Last buy 33 days ago. Overdue by 3 days.
        { phone: "9841888888", itemName: "Tea Dust (Tokla)", interval: 30, count: 3, offset: 33 },

        // Others
        { phone: "9841999999", itemName: "Real Mixed Fruit", interval: 10, count: 8 },
        { phone: "9860111111", itemName: "Sona Mansuli Rice", interval: 22, count: 4 }
    ];

    for (const p of patterns) {
        const cust = customers.find(c => c.phone === p.phone);
        const product = dbProducts.find(prod => prod.name === p.itemName);

        if (cust && product) {
            for (let k = 1; k <= p.count; k++) {
                // Determine date: Today - (k * interval)
                // e.g. k=1 (last order) = Today - 21 days. 
                // k=2 (prev order) = Today - 42 days.
                const date = new Date();
                const daysAgo = p.offset !== undefined
                    ? p.offset + ((k - 1) * p.interval)
                    : k * p.interval;
                date.setDate(date.getDate() - daysAgo);

                // Add slight noise (0 or -1 day) to make it look real? No, keep it clean for demo.
                const dateStr = date.toISOString();

                orders.push({
                    id: `ORD-PATTERN-${storeId.substring(0, 10)}-${p.phone.slice(-4)}-${k}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    store_id: storeId,
                    customer: cust.name,
                    phone: cust.phone,
                    address: "Kathmandu, Nepal",
                    location: { lat: 27.7, lng: 85.3 },
                    items: [{
                        id: product.id,
                        name: product.name,
                        price: product.retail_price,
                        quantity: 1,
                        unit: product.unit
                    }],
                    total: product.retail_price,
                    status: 'Delivered',
                    date: dateStr
                });
            }
        }
    }

    // Insert in chunks
    const chunkSize = 50;
    for (let i = 0; i < orders.length; i += chunkSize) {
        const chunk = orders.slice(i, i + chunkSize);
        const { error } = await supabase.from('orders').insert(chunk);
        if (error) {
            console.error(`Error seeding orders chunk ${i}:`, error);
            return { success: false, message: "Failed to seed orders: " + (error.message || JSON.stringify(error)) };
        }
    }

    return { success: true, message: "Sample orders generated successfully!" };
};


export const createDemoStore = async () => {
    const DEMO_ID = 'demo-store-' + Math.floor(Math.random() * 1000);

    console.log("Starting Demo Store Creation:", DEMO_ID);

    // 1. Create Store
    const s1 = await createStore(DEMO_ID);
    if (!s1.success) return s1;

    // 2. Add Products
    const s2 = await seedProducts(DEMO_ID);
    if (!s2.success) return s2;

    // 3. Add Orders (Transactions)
    const s3 = await seedOrders(DEMO_ID);
    if (!s3.success) return s3;

    return { success: true, storeId: DEMO_ID, message: `Demo Store ${DEMO_ID} created with data!` };
};

// Legacy support
export const seedDatabase = async (storeId) => {
    // Just seed products for manual store
    return await seedProducts(storeId);
};
