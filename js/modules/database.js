// Database Module - Handles all database operations

// Your Amazon affiliate ID
const AFFILIATE_ID = "tryvr-20"; // Replace with your actual Amazon affiliate ID

let db;

// Initialize SQLite database
async function initDatabase() {
    // Load SQL.js library
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
        const savedDb = localStorage.getItem('tryvr_products_db');
        if (savedDb) {
            try {
                const uint8Array = new Uint8Array(JSON.parse(savedDb));
                db = new SQL.Database(uint8Array);
                console.log('Database loaded from localStorage');
            } catch (error) {
                console.error('Error loading database from localStorage:', error);
                // If loading from localStorage fails, add sample products
                addSampleVRProducts();
            }
        } else {
            // No saved database, add sample products
            addSampleVRProducts();
        }
    }
}

// Add sample VR products
function addSampleVRProducts() {
    const sampleProducts = [
        {
            title: "Meta Quest 3 VR Headset",
            amazonUrl: "https://www.amazon.com/dp/B0C8JNRWBJ",
            rating: 4.7,
            category: "headsets",
            imageUrl: "https://m.media-amazon.com/images/I/61J5g6hev8L._AC_SL1500_.jpg",
            price: 499.99,
            description: "The Meta Quest 3 is a powerful all-in-one VR headset with mixed reality capabilities. Experience immersive virtual worlds with high-resolution displays and intuitive controllers. No PC or console required.",
            videoUrl: "https://example.com/videos/meta-quest-3-demo.mp4"
        },
        {
            title: "Valve Index VR Full Kit",
            amazonUrl: "https://www.amazon.com/dp/B07VPRVBFF",
            rating: 4.8,
            category: "headsets",
            imageUrl: "https://m.media-amazon.com/images/I/61aE3I4wjvL._AC_SL1500_.jpg",
            price: 999.00,
            description: "The Valve Index is a premium PC-powered VR system with industry-leading display technology, off-ear audio, and advanced controllers that track individual finger movements for more natural interactions in VR.",
            videoUrl: "https://example.com/videos/valve-index-review.mp4"
        },
        {
            title: "Meta Quest 2 VR Headset",
            amazonUrl: "https://www.amazon.com/dp/B099VMT8VZ",
            rating: 4.6,
            category: "headsets",
            imageUrl: "https://m.media-amazon.com/images/I/615YaAiA-ML._AC_SL1500_.jpg",
            price: 299.99,
            description: "The Meta Quest 2 is an affordable all-in-one VR headset with a vast library of games and experiences. Featuring a high-resolution display and intuitive controls, it's perfect for VR beginners and enthusiasts alike."
        },
        {
            title: "KIWI Design Controller Grips for Meta Quest 3",
            amazonUrl: "https://www.amazon.com/dp/B0CJHZXQ7S",
            rating: 4.5,
            category: "accessories",
            imageUrl: "https://m.media-amazon.com/images/I/61Jw-mJldaL._AC_SL1500_.jpg",
            price: 39.99,
            description: "Enhance your VR experience with these ergonomic controller grips for Meta Quest 3. They provide better grip, prevent controller drops, and reduce hand fatigue during extended play sessions."
        },
        {
            title: "VR Cover Facial Interface for Valve Index",
            amazonUrl: "https://www.amazon.com/dp/B07YFSZVBV",
            rating: 4.4,
            category: "accessories",
            imageUrl: "https://m.media-amazon.com/images/I/71Zl+xaoYtL._AC_SL1500_.jpg",
            price: 59.99,
            description: "Upgrade your Valve Index comfort with this premium facial interface replacement. Made with PU leather, it's more hygienic, comfortable, and easier to clean than the original foam padding."
        },
        {
            title: "Meta Quest Link Cable",
            amazonUrl: "https://www.amazon.com/dp/B081SHD773",
            rating: 4.5,
            category: "accessories",
            imageUrl: "https://m.media-amazon.com/images/I/61VVPxpBDVL._AC_SL1500_.jpg",
            price: 79.99,
            description: "Connect your Meta Quest headset to a gaming PC with this high-quality, 5-meter fiber optic cable. Experience PC VR games with optimal performance and minimal latency.",
            videoUrl: "https://example.com/videos/quest-link-tutorial.mp4"
        }
    ];
    
    sampleProducts.forEach(product => {
        const affiliateUrl = addAffiliateTag(product.amazonUrl);
        
        db.run(`
            INSERT INTO products (
                title, amazon_url, affiliate_url, rating, category, 
                image_url, price, description, video_url
            ) VALUES (
                $title, $amazonUrl, $affiliateUrl, $rating, $category,
                $imageUrl, $price, $description, $videoUrl
            )
        `, {
            $title: product.title,
            $amazonUrl: product.amazonUrl,
            $affiliateUrl: affiliateUrl,
            $rating: product.rating,
            $category: product.category,
            $imageUrl: product.imageUrl,
            $price: product.price,
            $description: product.description,
            $videoUrl: product.videoUrl || null
        });
    });
    
    console.log('Sample VR products added');
}

// Add Amazon affiliate tag to URL
function addAffiliateTag(amazonUrl) {
    try {
        const url = new URL(amazonUrl);
        
        // Remove any existing tag
        url.searchParams.delete('tag');
        
        // Add our affiliate tag
        url.searchParams.set('tag', AFFILIATE_ID);
        
        return url.toString();
    } catch (error) {
        console.error('Invalid Amazon URL:', error);
        return amazonUrl;
    }
}

// Get products with filters
function getProducts(categoryFilter, ratingFilter, page, itemsPerPage) {
    let query = `SELECT COUNT(*) as count FROM products`;
    let whereClause = [];
    let params = {};
    
    if (categoryFilter !== 'all') {
        whereClause.push(`category = $category`);
        params.$category = categoryFilter;
    }
    
    if (ratingFilter > 0) {
        whereClause.push(`rating >= $rating`);
        params.$rating = ratingFilter;
    }
    
    if (whereClause.length > 0) {
        query += ` WHERE ${whereClause.join(' AND ')}`;
    }
    
    // Get total count for pagination
    const countResult = db.exec(query, params);
    const totalProducts = countResult[0]?.values[0][0] || 0;
    
    // Fetch products for current page
    query = `SELECT * FROM products`;
    
    if (whereClause.length > 0) {
        query += ` WHERE ${whereClause.join(' AND ')}`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $limit OFFSET $offset`;
    params.$limit = itemsPerPage;
    params.$offset = (page - 1) * itemsPerPage;
    
    try {
        const result = db.exec(query, params);
        return {
            products: result[0]?.values || [],
            totalProducts
        };
    } catch (error) {
        console.error('Error loading products:', error);
        return {
            products: [],
            totalProducts: 0
        };
    }
}

// Save database to localStorage
function saveDatabase() {
    const data = db.export();
    const buffer = new Uint8Array(data);
    const jsonArray = Array.from(buffer);
    localStorage.setItem('tryvr_products_db', JSON.stringify(jsonArray));
}

// Reload database from localStorage
async function reloadDatabase() {
    try {
        const savedDb = localStorage.getItem('tryvr_products_db');
        if (savedDb) {
            // Load SQL.js library again if needed
            const sqlPromise = initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });
            
            const SQL = await sqlPromise;
            const uint8Array = new Uint8Array(JSON.parse(savedDb));
            db = new SQL.Database(uint8Array);
            console.log('Database reloaded from localStorage');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error reloading database from localStorage:', error);
        return false;
    }
}

export {
    initDatabase,
    getProducts,
    saveDatabase,
    reloadDatabase
}; 