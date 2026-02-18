export const storeConfig = {
    // Basic Store Info
    name: "Ram's Kirana", // Change this for each client
    logo: "Store", // Icon name from Lucide (or path to image)

    // Contact Info (Used for Order Routing)
    phone: "98XXXXXXXX",
    address: "Kathmandu, Nepal",

    // Theme Colors (Tailwind classes or hex)
    themeColor: "primary", // maps to tailwind config

    // Features
    enableWholesale: true,
    enableBroadcast: false, // Only clear for premium clients?

    // Platform Behavior
    // If true, shows links to other stores (Marketplace model).
    // If false, keeps the customer locked to this store (SaaS/Private model).
    showRelatedStores: false
};
