// Initialize SQLite database
let db;
const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let totalProducts = 0;

// Your Amazon affiliate ID
const AFFILIATE_ID = "tryvr-20"; // Replace with your actual Amazon affiliate ID

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initDatabase()
        .then(() => {
            loadProducts();
            setupEventListeners();
        })
        .catch(error => {
            console.error('Failed to initialize the application:', error);
            alert('Failed to initialize the application. Please check the console for details.');
        });
});

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

// Load products from the database
function loadProducts() {
    const categoryFilter = document.getElementById('category').value;
    const ratingFilter = parseFloat(document.getElementById('min-rating').value);
    
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
    totalProducts = countResult[0]?.values[0][0] || 0;
    
    // Update product count display
    document.getElementById('product-count').textContent = `${totalProducts} products`;
    
    // Calculate pagination
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    
    // Update pagination controls
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages || 1}`;
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages || totalPages === 0;
    
    // Fetch products for current page
    query = `SELECT * FROM products`;
    
    if (whereClause.length > 0) {
        query += ` WHERE ${whereClause.join(' AND ')}`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $limit OFFSET $offset`;
    params.$limit = ITEMS_PER_PAGE;
    params.$offset = (currentPage - 1) * ITEMS_PER_PAGE;
    
    try {
        const result = db.exec(query, params);
        displayProducts(result[0]?.values || []);
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Failed to load products. Please check the console for details.');
    }
}

// Display products in the UI
function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-400 text-lg">No VR products found. Contact the administrator to add products.</p>
                <i class="fas fa-vr-cardboard text-6xl text-gray-500 mt-4"></i>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const [id, title, amazonUrl, affiliateUrl, rating, category, imageUrl, price, description, videoUrl] = product;
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card vr-card bg-gray-800 rounded-lg shadow-md overflow-hidden';
        
        // Store product data as attributes for the modal
        productCard.dataset.id = id;
        productCard.dataset.title = title;
        productCard.dataset.amazonUrl = amazonUrl;
        productCard.dataset.affiliateUrl = affiliateUrl;
        productCard.dataset.rating = rating;
        productCard.dataset.category = category;
        productCard.dataset.imageUrl = imageUrl;
        productCard.dataset.price = price;
        productCard.dataset.description = description;
        productCard.dataset.videoUrl = videoUrl || '';
        
        // Generate star rating HTML
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star empty"></i>';
        }
        
        // Get category icon
        const categoryIcon = getCategoryIcon(category);
        
        // Check if the product has a video URL ending with .mp4
        const hasVideo = videoUrl && videoUrl.toLowerCase().endsWith('.mp4');
        
        productCard.innerHTML = `
            <div class="relative">
                <img src="${imageUrl}" alt="${title}" class="w-full h-48 object-cover">
                <span class="price-tag absolute top-2 right-2">$${price.toFixed(2)}</span>
                <span class="absolute top-2 left-2 bg-purple-700 text-white px-2 py-1 rounded-lg text-xs">
                    ${categoryIcon} ${getCategoryLabel(category)}
                </span>
                ${hasVideo ? `
                <div class="video-play-button absolute bottom-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded-full cursor-pointer hover:bg-opacity-90 transition" data-video-url="${videoUrl}">
                    <i class="fas fa-play"></i>
                </div>` : ''}
            </div>
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-2 line-clamp-2 text-white">${title}</h3>
                <div class="flex items-center mb-2">
                    <div class="star-rating mr-2">${starsHtml}</div>
                    <span class="text-gray-400">${rating.toFixed(1)}</span>
                </div>
                <p class="text-gray-400 text-sm mb-3 line-clamp-3">${description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">${getCategoryLabel(category)}</span>
                    <a href="${affiliateUrl}" target="_blank" class="affiliate-link vr-button bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded text-white text-sm">
                        View on Amazon <i class="fas fa-external-link-alt ml-1"></i>
                    </a>
                </div>
            </div>
        `;
        
        container.appendChild(productCard);
    });
}

// Get category label for display
function getCategoryLabel(category) {
    const categories = {
        'headsets': 'VR Headsets',
        'controllers': 'Controllers',
        'accessories': 'Accessories',
        'games': 'VR Games'
    };
    return categories[category] || category;
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'headsets': '<i class="fas fa-vr-cardboard"></i>',
        'controllers': '<i class="fas fa-gamepad"></i>',
        'accessories': '<i class="fas fa-plug"></i>',
        'games': '<i class="fas fa-dice-d20"></i>'
    };
    return icons[category] || '<i class="fas fa-tag"></i>';
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

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('status-notification');
    const messageElement = document.getElementById('status-message');
    
    // Set message
    messageElement.textContent = message;
    
    // Set color based on type
    if (type === 'success') {
        notification.classList.remove('bg-red-500');
        notification.classList.add('bg-green-500');
    } else {
        notification.classList.remove('bg-green-500');
        notification.classList.add('bg-red-500');
    }
    
    // Show notification
    notification.classList.remove('translate-y-20', 'opacity-0');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Category filter change
    document.getElementById('category').addEventListener('change', () => {
        currentPage = 1;
        loadProducts();
    });
    
    // Rating filter change
    document.getElementById('min-rating').addEventListener('change', () => {
        currentPage = 1;
        loadProducts();
    });
    
    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', async () => {
        // Reload database from localStorage to get the latest products
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
            }
        } catch (error) {
            console.error('Error reloading database from localStorage:', error);
        }
        
        // Now load products from the refreshed database
        loadProducts();
        showNotification('Products refreshed from latest data');
    });
    
    // Pagination controls
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadProducts();
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            loadProducts();
        }
    });
    
    // Video play button click event delegation
    document.getElementById('products-container').addEventListener('click', (event) => {
        // Handle video play button clicks
        const videoPlayButton = event.target.closest('.video-play-button');
        if (videoPlayButton) {
            event.stopPropagation(); // Prevent product card click
            const videoUrl = videoPlayButton.dataset.videoUrl;
            if (videoUrl && videoUrl.toLowerCase().endsWith('.mp4')) {
                openVideoModal(videoUrl);
            }
            return;
        }
        
        // Handle affiliate link clicks
        const affiliateLink = event.target.closest('.affiliate-link');
        if (affiliateLink) {
            event.stopPropagation(); // Prevent product card click
            return;
        }
        
        // Handle product card clicks
        const productCard = event.target.closest('.product-card');
        if (productCard) {
            openProductDetailModal(productCard);
        }
    });
    
    // Close video modal when clicking the close button
    document.getElementById('close-video-modal').addEventListener('click', closeVideoModal);
    
    // Close video modal when clicking outside the video player
    document.getElementById('video-modal').addEventListener('click', (event) => {
        if (event.target === document.getElementById('video-modal')) {
            closeVideoModal();
        }
    });
    
    // Close product detail modal when clicking the close button
    document.getElementById('close-product-modal').addEventListener('click', closeProductDetailModal);
    
    // Close product detail modal when clicking outside the modal content
    document.getElementById('product-detail-modal').addEventListener('click', (event) => {
        if (event.target === document.getElementById('product-detail-modal')) {
            closeProductDetailModal();
        }
    });
    
    // Export database button
    const exportDbBtn = document.getElementById('export-db-btn');
    if (exportDbBtn) {
        exportDbBtn.addEventListener('click', exportDatabase);
    }
    
    // Import database button
    const importDbBtn = document.getElementById('import-db-btn');
    if (importDbBtn) {
        importDbBtn.addEventListener('click', () => {
            document.getElementById('import-db-file').click();
        });
    }
    
    // Import database file input
    const importDbFile = document.getElementById('import-db-file');
    if (importDbFile) {
        importDbFile.addEventListener('change', (event) => {
            if (event.target.files.length > 0) {
                importDatabase(event.target.files[0]);
            }
        });
    }
    
    // Save database to localStorage before unloading the page
    window.addEventListener('beforeunload', () => {
        const data = db.export();
        const buffer = new Uint8Array(data);
        const jsonArray = Array.from(buffer);
        localStorage.setItem('tryvr_products_db', JSON.stringify(jsonArray));
    });
}

// Open video modal and play the video
function openVideoModal(videoUrl) {
    const videoPlayer = document.getElementById('video-player');
    const videoSource = videoPlayer.querySelector('source');
    videoSource.src = videoUrl;
    videoPlayer.load();
    
    const videoModal = document.getElementById('video-modal');
    videoModal.classList.remove('hidden');
    
    // Auto play the video
    videoPlayer.play().catch(error => {
        console.warn('Auto-play was prevented:', error);
    });
}

// Close video modal and stop the video
function closeVideoModal() {
    const videoModal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
    
    videoModal.classList.add('hidden');
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
}

// Open product detail modal
function openProductDetailModal(productCard) {
    // Get product data from dataset
    const {
        title, imageUrl, price, rating, category, description, affiliateUrl
    } = productCard.dataset;
    
    // Set modal content
    document.getElementById('modal-product-title').textContent = title;
    document.getElementById('modal-product-image').src = imageUrl;
    document.getElementById('modal-product-image').alt = title;
    document.getElementById('modal-product-price').textContent = `$${parseFloat(price).toFixed(2)}`;
    document.getElementById('modal-product-description').textContent = description;
    document.getElementById('modal-product-link').href = affiliateUrl;
    
    // Prevent the affiliate link from closing the modal when clicked
    document.getElementById('modal-product-link').onclick = (e) => {
        e.stopPropagation();
    };
    
    // Set category with icon
    const categoryIcon = getCategoryIcon(category);
    document.getElementById('modal-product-category').innerHTML = `${categoryIcon} ${getCategoryLabel(category)}`;
    
    // Generate star rating HTML
    const ratingValue = parseFloat(rating);
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star empty"></i>';
    }
    
    document.getElementById('modal-product-rating').innerHTML = starsHtml;
    document.getElementById('modal-product-rating-value').textContent = ratingValue.toFixed(1);
    
    // Show the modal
    document.getElementById('product-detail-modal').classList.remove('hidden');
    
    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';
}

// Close product detail modal
function closeProductDetailModal() {
    document.getElementById('product-detail-modal').classList.add('hidden');
    
    // Re-enable scrolling on the body
    document.body.style.overflow = '';
}

// Export database to a JSON file
function exportDatabase() {
    try {
        // Export the database to a Uint8Array
        const data = db.export();
        const buffer = new Uint8Array(data);
        
        // Convert to JSON
        const jsonData = JSON.stringify(Array.from(buffer));
        
        // Create a blob and download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create a download link and trigger it
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tryvr_products.json';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Database exported successfully');
    } catch (error) {
        console.error('Error exporting database:', error);
        showNotification('Failed to export database', 'error');
    }
}

// Import database from a JSON file
async function importDatabase(file) {
    try {
        // Read the file
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            try {
                // Parse the JSON data
                const jsonData = JSON.parse(event.target.result);
                const uint8Array = new Uint8Array(jsonData);
                
                // Load SQL.js library
                const sqlPromise = initSqlJs({
                    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
                });
                
                const SQL = await sqlPromise;
                
                // Create a new database from the imported data
                db = new SQL.Database(uint8Array);
                
                // Save to localStorage
                const data = db.export();
                const buffer = new Uint8Array(data);
                const jsonArray = Array.from(buffer);
                localStorage.setItem('tryvr_products_db', JSON.stringify(jsonArray));
                
                // Reload products
                loadProducts();
                
                showNotification('Database imported successfully');
            } catch (error) {
                console.error('Error processing imported file:', error);
                showNotification('Failed to import database', 'error');
            }
        };
        
        reader.readAsText(file);
    } catch (error) {
        console.error('Error importing database:', error);
        showNotification('Failed to import database', 'error');
    }
} 