// Database Module - Handles all database operations

// Your Amazon affiliate ID
const AFFILIATE_ID = "tryvr-20"; // Replace with your actual Amazon affiliate ID

let db;
let productsLoaded = false;

// Initialize SQLite database
async function initDatabase() {
    try {
        // Try to load products from our server-side products first
        const serverProducts = await loadProductsFromServer();
        
        if (serverProducts && serverProducts.length > 0) {
            console.log('Loaded products from server:', serverProducts.length);
            productsLoaded = true;
            
            // Create a simple in-memory object to hold the products
            db = { products: serverProducts };
            return;
        }
        
        // If no server products, continue with SQL.js
        const sqlPromise = initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        const SQL = await sqlPromise;
        
        // Create a new database
        db = new SQL.Database();
        
        // Create products table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                amazon_url TEXT NOT NULL,
                affiliate_url TEXT NOT NULL,
                rating REAL NOT NULL,
                category TEXT NOT NULL,
                image_url TEXT NOT NULL,
                price REAL NOT NULL,
                description TEXT NOT NULL,
                video_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('Database initialized successfully');
        
        // Check if there are any products
        const countResult = db.exec('SELECT COUNT(*) FROM products');
        if (countResult[0]?.values[0][0] === 0) {
            // No products, try to load from localStorage
            const frontendProducts = localStorage.getItem('tryvr_frontend_products');
            if (frontendProducts) {
                try {
                    const products = JSON.parse(frontendProducts);
                    console.log('Loading products from localStorage cache:', products.length);
                    
                    // Insert products into the database
                    products.forEach(p => {
                        db.run(`
                            INSERT INTO products (
                                title, amazon_url, affiliate_url, rating, category, 
                                image_url, price, description, video_url
                            ) VALUES (
                                $title, $amazonUrl, $affiliateUrl, $rating, $category,
                                $imageUrl, $price, $description, $videoUrl
                            )
                        `, {
                            $title: p.title,
                            $amazonUrl: p.amazon_url,
                            $affiliateUrl: p.affiliate_url,
                            $rating: p.rating,
                            $category: p.category,
                            $imageUrl: p.image_url,
                            $price: p.price,
                            $description: p.description,
                            $videoUrl: p.video_url || null
                        });
                    });
                    
                    productsLoaded = true;
                } catch (error) {
                    console.error('Error loading products from localStorage:', error);
                    productsLoaded = true;
                }
            } else {
                // No saved products, just set productsLoaded to true
                productsLoaded = true;
            }
        } else {
            productsLoaded = true;
        }
    } catch (error) {
        console.error('Error initializing database:', error);
        // Create a fallback database object
        db = { products: [] };
        
        // Try to load from localStorage cache as fallback
        const frontendProducts = localStorage.getItem('tryvr_frontend_products');
        if (frontendProducts) {
            try {
                db.products = JSON.parse(frontendProducts);
                productsLoaded = true;
            } catch (e) {
                console.error('Error parsing localStorage products:', e);
            }
        }
    }
}

// Load products from server endpoint
async function loadProductsFromServer() {
    try {
        console.log('Loading products from server...');
        const response = await fetch('/api/frontend-products');
        if (!response.ok) {
            throw new Error(`Failed to load products: ${response.status} ${response.statusText}`);
        }
        const products = await response.json();
        console.log(`Loaded ${products.length} products from server`);
        
        // Log the first product to help with debugging
        if (products.length > 0) {
            console.log('First product sample:', products[0]);
        }
        
        return products;
    } catch (error) {
        console.error('Error loading products from server:', error);
        return null;
    }
}

// Add Amazon affiliate tag to URL
function addAffiliateTag(amazonUrl) {
    try {
        // If the URL already contains our affiliate tag, return it as is
        if (amazonUrl && amazonUrl.includes(`tag=${AFFILIATE_ID}`)) {
            console.log('URL already contains our affiliate tag, keeping original URL');
            return amazonUrl;
        }
        
        // If it's a full affiliate link with other parameters, preserve those
        if (amazonUrl && amazonUrl.includes('linkCode=') && amazonUrl.includes('linkId=')) {
            console.log('URL appears to be a complete affiliate link, keeping original URL');
            return amazonUrl;
        }
        
        // Otherwise, add our tag to a simple URL
        const url = new URL(amazonUrl);
        
        // Remove any existing tag that isn't ours
        if (url.searchParams.has('tag') && url.searchParams.get('tag') !== AFFILIATE_ID) {
            url.searchParams.delete('tag');
            url.searchParams.set('tag', AFFILIATE_ID);
        } else if (!url.searchParams.has('tag')) {
            // Add our affiliate tag if no tag exists
            url.searchParams.set('tag', AFFILIATE_ID);
        }
        
        return url.toString();
    } catch (error) {
        console.error('Invalid Amazon URL:', error);
        return amazonUrl;
    }
}

// Get products from the database
function getProducts(categoryFilter = '', minRating = 0, page = 1, itemsPerPage = 10) {
    try {
        if (!db || !db.products || !Array.isArray(db.products)) {
            console.error('Database not initialized or products not loaded');
            return { products: [], totalProducts: 0 };
        }
        
        console.log('Getting products from database:', db.products.length);
        
        // Filter products by category and rating
        let filteredProducts = db.products;
        
        if (categoryFilter && categoryFilter !== 'all') {
            filteredProducts = filteredProducts.filter(product => {
                // Handle both array format and object format
                if (Array.isArray(product)) {
                    return product[5] === categoryFilter; // category is at index 5
                } else {
                    return product.category === categoryFilter;
                }
            });
        }
        
        if (minRating > 0) {
            filteredProducts = filteredProducts.filter(product => {
                // Handle both array format and object format
                if (Array.isArray(product)) {
                    return product[4] >= minRating; // rating is at index 4
                } else {
                    return product.rating >= minRating;
                }
            });
        }
        
        // Calculate pagination
        const totalProducts = filteredProducts.length;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Get products for current page
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        // Convert object format to array format if needed
        const formattedProducts = paginatedProducts.map(product => {
            if (Array.isArray(product)) {
                return product;
            } else {
                return [
                    product.id || 0,
                    product.title || product.name || '',
                    product.amazon_url || product.amazonUrl || '',
                    product.affiliate_url || product.affiliateUrl || '',
                    product.rating || 0,
                    product.category || '',
                    product.image_url || product.imageUrl || product.image || '',
                    product.price || 0,
                    product.description || '',
                    product.video_url || product.videoUrl || null
                ];
            }
        });
        
        return { products: formattedProducts, totalProducts };
    } catch (error) {
        console.error('Error getting products:', error);
        return { products: [], totalProducts: 0 };
    }
}

// Save database to localStorage
function saveDatabase() {
    const data = db.export();
    const buffer = new Uint8Array(data);
    const jsonArray = Array.from(buffer);
    localStorage.setItem('tryvr_products_db', JSON.stringify(jsonArray));
}

// Reload database from server
async function reloadDatabase() {
    try {
        console.log('Reloading database from server...');
        
        // Try to load products from server again
        const serverProducts = await loadProductsFromServer();
        
        if (serverProducts && serverProducts.length > 0) {
            console.log(`Reloaded ${serverProducts.length} products from server`);
            db = { products: serverProducts };
            return true;
        }
        
        console.log('No products found on server, keeping current database');
        return false;
    } catch (error) {
        console.error('Error reloading database:', error);
        return false;
    }
}

// Load products from the server
async function loadProducts() {
    try {
        if (productsLoaded) {
            return db.products;
        }
        
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/frontend-products?t=${timestamp}`);
        if (!response.ok) {
            throw new Error('Failed to load products from server');
        }
        
        const data = await response.json();
        
        // Store in localStorage as a cache
        localStorage.setItem('tryvr_frontend_products', JSON.stringify(data));
        
        // Update the database
        db.products = data;
        productsLoaded = true;
        
        return db.products;
    } catch (error) {
        console.error('Error loading products:', error);
        
        // Try to load from localStorage cache as fallback
        const cachedProducts = localStorage.getItem('tryvr_frontend_products');
        if (cachedProducts) {
            try {
                db.products = JSON.parse(cachedProducts);
                productsLoaded = true;
                return db.products;
            } catch (e) {
                console.error('Error parsing cached products:', e);
            }
        }
        
        return [];
    }
}

// Force reload products from server (bypass cache)
async function forceReloadProducts() {
    try {
        // Call the clear-cache endpoint to ensure we get fresh data
        const clearCacheResponse = await fetch(`/api/clear-cache?t=${new Date().getTime()}`);
        if (!clearCacheResponse.ok) {
            console.warn('Failed to clear cache, continuing with reload anyway');
        } else {
            console.log('Cache cleared successfully');
        }
    } catch (error) {
        console.warn('Error clearing cache:', error);
    }
    
    // Reset local state
    productsLoaded = false;
    localStorage.removeItem('tryvr_frontend_products');
    
    // Load fresh data
    return await loadProducts();
}

export {
    initDatabase,
    getProducts,
    saveDatabase,
    reloadDatabase,
    loadProducts,
    forceReloadProducts
}; 