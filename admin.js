// Initialize SQLite database
let db;
const ITEMS_PER_PAGE = 10; // Fewer items per page for the admin table view
let currentPage = 1;
let totalProducts = 0;
let productToDelete = null;
const DB_STORAGE_KEY = 'tryvr_products_db'; // Consistent storage key

// Your Amazon affiliate ID
const AFFILIATE_ID = "tryvr-20";

// Check authentication
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    if (localStorage.getItem('tryvr_admin_auth') !== 'true') {
        // Redirect to login page
        window.location.href = 'admin-login.html';
        return;
    }
    
    try {
        // Load SQL.js library
        const sqlPromise = initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        const SQL = await sqlPromise;
        
        // Try to load existing database from localStorage
        const savedDb = localStorage.getItem(DB_STORAGE_KEY);
        
        if (savedDb) {
            try {
                const uint8Array = new Uint8Array(JSON.parse(savedDb));
                db = new SQL.Database(uint8Array);
                console.log('Database loaded from localStorage');
            } catch (error) {
                console.error('Error parsing database:', error);
                // Create new database if loading fails
                createNewDatabase(SQL);
            }
        } else {
            // Create new database if none exists
            createNewDatabase(SQL);
        }
        
        console.log('Database initialized successfully');
        
        // Load products after database is initialized
        loadProducts();
        setupEventListeners();
        checkApiKey();
    } catch (error) {
        console.error('Failed to initialize database:', error);
        showNotification('Failed to initialize the database', 'error');
    }
});

// Create a new database
function createNewDatabase(SQL) {
    console.log('Creating new database...');
    // Create new database if none exists
    db = new SQL.Database();
    // Create products table
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
    // Save the new database
    saveToLocalStorage();
}

// Get database instance
function getDatabase() {
    try {
        // Get database from localStorage - Use consistent key
        const base64 = localStorage.getItem(DB_STORAGE_KEY);
        if (!base64) {
            throw new Error('Database not found in localStorage');
        }
        
        // Convert base64 to Uint8Array
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        
        // Create database from Uint8Array
        return new SQL.Database(bytes);
    } catch (error) {
        console.error('Error getting database:', error);
        showNotification('Error accessing database: ' + error.message, 'error');
        return null;
    }
}

// Load products from the database
function loadProducts() {
    try {
        const categoryFilter = document.getElementById('admin-category')?.value || 'all';
        const ratingFilter = parseFloat(document.getElementById('admin-min-rating')?.value || '0');
        const sortOption = document.getElementById('admin-sort')?.value || 'newest';
        
        // Update product count display
        let countQuery = `SELECT COUNT(*) as count FROM products`;
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
            countQuery += ` WHERE ${whereClause.join(' AND ')}`;
        }
        
        // Get total count for pagination
        try {
            const countResult = db.exec(countQuery);
            totalProducts = countResult[0]?.values[0][0] || 0;
            
            // Update product count display
            const productCountElement = document.getElementById('product-count');
            if (productCountElement) {
                productCountElement.textContent = `${totalProducts} products`;
            }
        } catch (error) {
            console.error('Error counting products:', error);
            totalProducts = 0;
        }
        
        // Calculate pagination
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE) || 1;
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        // Update pagination controls
        const pageInfoElement = document.getElementById('admin-page-info');
        const prevPageButton = document.getElementById('admin-prev-page');
        const nextPageButton = document.getElementById('admin-next-page');
        
        if (pageInfoElement) {
            pageInfoElement.textContent = `Page ${currentPage} of ${totalPages}`;
        }
        
        if (prevPageButton) {
            prevPageButton.disabled = currentPage <= 1;
        }
        
        if (nextPageButton) {
            nextPageButton.disabled = currentPage >= totalPages || totalPages === 0;
        }
        
        // Fetch products for current page
        let query = `SELECT * FROM products`;
        
        if (whereClause.length > 0) {
            query += ` WHERE ${whereClause.join(' AND ')}`;
        }
        
        // Add sorting
        switch (sortOption) {
            case 'oldest':
                query += ` ORDER BY created_at ASC`;
                break;
            case 'price-high':
                query += ` ORDER BY price DESC`;
                break;
            case 'price-low':
                query += ` ORDER BY price ASC`;
                break;
            case 'rating':
                query += ` ORDER BY rating DESC`;
                break;
            case 'newest':
            default:
                query += ` ORDER BY created_at DESC`;
                break;
        }
        
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        query += ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`;
        
        try {
            const result = db.exec(query);
            if (result.length > 0) {
                displayProducts(result[0].values);
            } else {
                displayProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            displayProducts([]);
        }
        
        // Save database state after any operation
        saveToLocalStorage();
        
    } catch (error) {
        console.error('Error in loadProducts:', error);
        showNotification('Error loading products', 'error');
    }
}

// Display products in the admin table
function displayProducts(products) {
    try {
        const tableBody = document.getElementById('products-table-body');
        if (!tableBody) {
            console.error('Products table body element not found');
            return;
        }
        
        tableBody.innerHTML = '';
        
        if (!products || products.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="5" class="px-6 py-8 text-center text-gray-400">
                    <p class="text-lg">No VR products found. Add some products to get started!</p>
                    <i class="fas fa-vr-cardboard text-6xl text-gray-500 mt-4"></i>
                </td>
            `;
            tableBody.appendChild(emptyRow);
            return;
        }
        
        products.forEach(product => {
            try {
                const [id, title, amazonUrl, affiliateUrl, rating, category, imageUrl, price, description] = product;
                
                const row = document.createElement('tr');
                
                // Generate star rating HTML
                const fullStars = Math.floor(rating);
                const hasHalfStar = rating % 1 >= 0.5;
                const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
                
                let starsHtml = '';
                for (let i = 0; i < fullStars; i++) {
                    starsHtml += '<i class="fas fa-star text-yellow-400"></i>';
                }
                if (hasHalfStar) {
                    starsHtml += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
                }
                for (let i = 0; i < emptyStars; i++) {
                    starsHtml += '<i class="far fa-star text-gray-500"></i>';
                }
                
                // Get category icon
                const categoryIcon = getCategoryIcon(category);
                
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <img class="h-10 w-10 rounded-md object-cover" src="${imageUrl}" alt="${title}" 
                                     onerror="this.onerror=null; this.src='vr-logo.svg'; this.classList.add('bg-gray-200', 'p-1', 'rounded');">
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-white">${title}</div>
                                <div class="text-sm text-gray-400 truncate max-w-xs">${description ? description.substring(0, 60) + '...' : 'No description available'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-800 text-indigo-100">
                            ${categoryIcon} ${getCategoryLabel(category)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                        $${typeof price === 'number' ? price.toFixed(2) : '0.00'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div class="flex items-center">
                            <div class="mr-2">${starsHtml}</div>
                            <span>${typeof rating === 'number' ? rating.toFixed(1) : '0.0'}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                            <button class="edit-product-btn text-blue-400 hover:text-blue-300" data-id="${id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-product-btn text-red-400 hover:text-red-300" data-id="${id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                            <a href="${affiliateUrl}" target="_blank" class="text-green-400 hover:text-green-300">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    </td>
                `;
                
                tableBody.appendChild(row);
            } catch (error) {
                console.error('Error displaying product:', error, product);
            }
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-product-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                editProduct(productId);
            });
        });
        
        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                showDeleteConfirmation(productId);
            });
        });
    } catch (error) {
        console.error('Error in displayProducts:', error);
        showNotification('Error displaying products', 'error');
    }
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

// Save product to database
function saveProduct(productData) {
    try {
        const database = getDatabase();
        if (!database) {
            throw new Error('Database not found');
        }
        
        // Check if product already exists (edit mode)
        if (productData.id) {
            // Update existing product
            const stmt = database.prepare(`
                UPDATE products 
                SET title = ?, 
                    amazon_url = ?, 
                    rating = ?, 
                    category = ?, 
                    image_url = ?, 
                    price = ?, 
                    description = ? 
                WHERE id = ?
            `);
            
            stmt.run(
                productData.title,
                productData.amazonUrl,
                productData.rating,
                productData.category,
                productData.imageUrl,
                productData.price,
                productData.description,
                productData.id
            );
            
            showNotification(`Product "${productData.title}" updated successfully!`, 'success');
        } else {
            // Insert new product
            const stmt = database.prepare(`
                INSERT INTO products (
                    title, amazon_url, rating, category, image_url, price, description
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?
                )
            `);
            
            stmt.run(
                productData.title,
                productData.amazonUrl,
                productData.rating,
                productData.category,
                productData.imageUrl,
                productData.price,
                productData.description
            );
            
            showNotification(`Product "${productData.title}" added successfully!`, 'success');
        }
        
        // Save database to localStorage
        saveToLocalStorage();
        
        // Reload products to show the changes
        loadProducts();
        
        return true;
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Failed to save VR product', 'error');
        return false;
    }
}

// Delete product from database
function deleteProduct(productId) {
    try {
        const database = getDatabase();
        if (!database) {
            throw new Error('Database not found');
        }
        
        // Get product title before deletion for the notification
        const product = database.exec(`SELECT title FROM products WHERE id = ${productId}`);
        let productTitle = "Product";
        if (product && product[0] && product[0].values && product[0].values[0]) {
            productTitle = product[0].values[0][0];
        }
        
        // Delete the product
        const stmt = database.prepare('DELETE FROM products WHERE id = ?');
        stmt.run(productId);
        
        // Save changes to localStorage
        saveToLocalStorage();
        
        // Reload products
        loadProducts();
        
        // Hide confirmation modal
        document.getElementById('delete-confirmation-modal').classList.add('hidden');
        
        // Reset productToDelete
        productToDelete = null;
        
        // Show success message
        showNotification(`Product "${productTitle}" deleted successfully!`, 'success');
        
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product: ' + error.message, 'error');
        return false;
    }
}

// Edit product
function editProduct(productId) {
    try {
        const database = getDatabase();
        if (!database) {
            throw new Error('Database not found');
        }
        
        const result = database.exec(`SELECT * FROM products WHERE id = ${productId}`);
        
        if (result.length > 0 && result[0].values.length > 0) {
            const product = result[0].values[0];
            const [id, title, amazonUrl, affiliateUrl, rating, category, imageUrl, price, description, videoUrl] = product;
            
            // Fill form with product data
            const productForm = document.getElementById('product-form');
            if (productForm) {
                const productIdInput = document.getElementById('product-id');
                if (productIdInput) {
                    productIdInput.value = id;
                }
                
                const titleInput = document.getElementById('product-title');
                if (titleInput) {
                    titleInput.value = title;
                }
                
                const amazonUrlInput = document.getElementById('amazon-url');
                if (amazonUrlInput) {
                    amazonUrlInput.value = amazonUrl;
                }
                
                const ratingInput = document.getElementById('product-rating');
                if (ratingInput) {
                    ratingInput.value = rating;
                }
                
                const categoryInput = document.getElementById('product-category');
                if (categoryInput) {
                    categoryInput.value = category;
                }
                
                const imageUrlInput = document.getElementById('product-image');
                if (imageUrlInput) {
                    imageUrlInput.value = imageUrl;
                }
                
                const priceInput = document.getElementById('product-price');
                if (priceInput) {
                    priceInput.value = price;
                }
                
                const descriptionInput = document.getElementById('product-description');
                if (descriptionInput) {
                    descriptionInput.value = description;
                }
                
                const videoUrlInput = document.getElementById('product-video-url');
                if (videoUrlInput) {
                    videoUrlInput.value = videoUrl || '';
                }
                
                // Update modal title
                const modalTitle = document.getElementById('modal-title');
                if (modalTitle) {
                    modalTitle.textContent = 'Edit VR Product';
                }
                
                // Show modal
                const productModal = document.getElementById('product-modal');
                if (productModal) {
                    productModal.classList.remove('hidden');
                }
            }
        } else {
            console.error('Product not found:', productId);
            alert('Product not found');
        }
    } catch (error) {
        console.error('Error editing product:', error);
        alert('Error editing product');
    }
}

// Show delete confirmation
function showDeleteConfirmation(productId) {
    productToDelete = productId;
    document.getElementById('delete-confirmation-modal').classList.remove('hidden');
}

// Generate product description with AI
async function generateDescriptionWithAI(productTitle) {
    try {
        // Get API key from secure storage
        const apiKey = getApiKey();
        
        // Check if API key is set
        if (!apiKey) {
            console.warn("DeepSeek API key not configured. Using fallback description generation.");
            return generateFallbackDescription(productTitle);
        }
        
        // In a production environment, you would make this request through your server
        // to protect your API key. For demo purposes, we're showing the client-side implementation.
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional copywriter specializing in VR product descriptions. Write engaging, detailed, and SEO-friendly product descriptions."
                    },
                    {
                        role: "user",
                        content: `Write a compelling product description for this VR product: "${productTitle}". The description should be 3-4 sentences long, highlight key features, benefits, and create excitement about the product. Do not include pricing information.`
                    }
                ],
                max_tokens: 300
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generating description with DeepSeek API:", error);
        return generateFallbackDescription(productTitle);
    }
}

// Fallback description generation when API is not available
function generateFallbackDescription(productTitle) {
    const descriptions = [
        `The ${productTitle} offers an immersive VR experience with cutting-edge technology. Its high-resolution displays provide crystal-clear visuals, while the ergonomic design ensures comfort during extended sessions. Perfect for gaming, education, or virtual exploration.`,
        
        `Experience virtual reality like never before with the ${productTitle}. This premium VR device features advanced tracking technology, intuitive controls, and stunning visual fidelity. Whether you're a VR enthusiast or first-time user, this product delivers exceptional performance.`,
        
        `The ${productTitle} represents the next generation of virtual reality technology. With its wide field of view, precise motion tracking, and immersive audio, it creates a truly convincing sense of presence in virtual worlds. Lightweight and comfortable for extended use.`,
        
        `Dive into virtual worlds with the ${productTitle}, a state-of-the-art VR solution that balances performance, comfort, and value. Its intuitive interface makes it accessible to beginners, while the advanced features will satisfy experienced VR users.`
    ];
    
    const randomIndex = Math.floor(Math.random() * descriptions.length);
    return descriptions[randomIndex];
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

// Save database to localStorage
function saveToLocalStorage() {
    try {
        const data = db.export();
        const array = Array.from(data);
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(array));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Export database to file
function exportDatabase() {
    const data = db.export();
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tryvr-products.db';
    a.click();
    
    URL.revokeObjectURL(url);
}

// Import database from file
async function importDatabase(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Load SQL.js if not already loaded
        if (!window.SQL) {
            const sqlPromise = initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });
            window.SQL = await sqlPromise;
        }
        
        // Create a new database using the file data
        db = new window.SQL.Database(uint8Array);
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Reload products
        currentPage = 1;
        loadProducts();
        
        return true;
    } catch (error) {
        console.error('Error importing database:', error);
        return false;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('tryvr_admin_auth');
        window.location.href = 'admin-login.html';
    });
    
    // Sidebar navigation links
    const sidebarLinks = document.querySelectorAll('aside nav a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('bg-purple-700'));
            l.classList.add('hover:bg-gray-700');
            
            // Add active class to clicked link
            link.classList.add('bg-purple-700');
            link.classList.remove('hover:bg-gray-700');
            
            // Handle specific actions based on link text
            const linkText = link.textContent.trim();
            if (linkText.includes('Manage Products')) {
                // Already on the products page, just refresh the product list
                loadProducts();
            }
            // Add other navigation actions as needed
        });
    });
    
    // Filter change events
    document.getElementById('admin-category').addEventListener('change', () => {
        currentPage = 1; // Reset to first page when filter changes
        loadProducts();
    });
    
    document.getElementById('admin-min-rating').addEventListener('change', () => {
        currentPage = 1; // Reset to first page when filter changes
        loadProducts();
    });
    
    document.getElementById('admin-sort').addEventListener('change', () => {
        currentPage = 1; // Reset to first page when sort changes
        loadProducts();
    });
    
    // Pagination controls
    document.getElementById('admin-prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadProducts();
        }
    });
    
    document.getElementById('admin-next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            loadProducts();
        }
    });
    
    // Add product button
    document.getElementById('add-product-btn').addEventListener('click', () => {
        // Reset form
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
        document.getElementById('modal-title').textContent = 'Add New VR Product';
        document.getElementById('product-modal').classList.remove('hidden');
    });
    
    // API Settings button
    document.getElementById('api-settings-btn').addEventListener('click', () => {
        showApiKeyModal();
    });
    
    // API Key modal close button
    document.getElementById('close-api-modal').addEventListener('click', () => {
        document.getElementById('api-key-modal').classList.add('hidden');
    });
    
    // API Key save button
    document.getElementById('save-api-key').addEventListener('click', () => {
        const apiKeyInput = document.getElementById('api-key-input');
        const apiKey = apiKeyInput.value.trim();
        
        // If the value is masked, don't update
        if (apiKey === '••••••••••••••••••••••••••••••••') {
            document.getElementById('api-key-modal').classList.add('hidden');
            return;
        }
        
        saveApiKey(apiKey);
        document.getElementById('api-key-modal').classList.add('hidden');
    });
    
    // Show API key checkbox
    document.getElementById('show-api-key').addEventListener('change', (event) => {
        const apiKeyInput = document.getElementById('api-key-input');
        const currentKey = getApiKey() || '';
        
        if (event.target.checked) {
            // Show the actual key
            apiKeyInput.value = currentKey;
            apiKeyInput.type = 'text';
        } else {
            // Mask the key if it exists
            if (currentKey) {
                apiKeyInput.value = '••••••••••••••••••••••••••••••••';
            }
            apiKeyInput.type = 'password';
        }
    });
    
    // Close modal buttons
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('product-modal').classList.add('hidden');
    });
    
    document.getElementById('close-delete-modal').addEventListener('click', () => {
        document.getElementById('delete-confirmation-modal').classList.add('hidden');
        productToDelete = null;
    });
    
    document.getElementById('cancel-delete').addEventListener('click', () => {
        document.getElementById('delete-confirmation-modal').classList.add('hidden');
        productToDelete = null;
    });
    
    // Confirm delete button
    document.getElementById('confirm-delete').addEventListener('click', () => {
        if (productToDelete) {
            deleteProduct(productToDelete);
            document.getElementById('delete-confirmation-modal').classList.add('hidden');
            productToDelete = null;
        }
    });
    
    // Amazon URL input change - fetch product details
    document.getElementById('amazon-url').addEventListener('blur', async () => {
        const amazonUrl = document.getElementById('amazon-url').value.trim();
        if (amazonUrl && amazonUrl.includes('amazon.com')) {
            const fetchButton = document.getElementById('fetch-amazon-details');
            if (fetchButton) {
                fetchButton.click();
            }
        }
    });
    
    // Fetch Amazon details button
    document.getElementById('fetch-amazon-details').addEventListener('click', async () => {
        const amazonUrl = document.getElementById('amazon-url').value.trim();
        if (!amazonUrl) {
            alert('Please enter an Amazon product URL first');
            return;
        }
        
        const fetchButton = document.getElementById('fetch-amazon-details');
        const originalText = fetchButton.innerHTML;
        
        try {
            fetchButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Fetching...';
            fetchButton.disabled = true;
            
            const productData = await fetchAmazonProductDetails(amazonUrl);
            if (productData) {
                // Fill form with fetched data
                document.getElementById('product-title').value = productData.title;
                document.getElementById('product-rating').value = productData.rating;
                document.getElementById('product-category').value = productData.category;
                document.getElementById('product-image').value = productData.imageUrl;
                document.getElementById('product-price').value = productData.price;
                
                // Generate AI description based on the title
                const aiButton = document.getElementById('ai-generate');
                if (aiButton) {
                    aiButton.click();
                }
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            alert('Failed to fetch product details. Please try again or enter details manually.');
        } finally {
            fetchButton.innerHTML = originalText;
            fetchButton.disabled = false;
        }
    });
    
    // AI generate description button
    document.getElementById('ai-generate').addEventListener('click', async () => {
        const titleInput = document.getElementById('product-title');
        const descriptionInput = document.getElementById('product-description');
        
        if (!titleInput.value) {
            alert('Please enter a product title first');
            return;
        }
        
        const generateButton = document.getElementById('ai-generate');
        const originalText = generateButton.innerHTML;
        
        try {
            generateButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
            generateButton.disabled = true;
            
            const description = await generateDescriptionWithAI(titleInput.value);
            descriptionInput.value = description;
        } catch (error) {
            console.error('Error generating description:', error);
            alert('Failed to generate description. Please try again.');
        } finally {
            generateButton.innerHTML = originalText;
            generateButton.disabled = false;
        }
    });
    
    // Product form submission
    document.getElementById('product-form').addEventListener('submit', (event) => {
        event.preventDefault();
        
        const productData = {
            id: document.getElementById('product-id').value || null,
            title: document.getElementById('product-title').value,
            amazonUrl: document.getElementById('amazon-url').value,
            rating: parseFloat(document.getElementById('product-rating').value),
            category: document.getElementById('product-category').value,
            imageUrl: document.getElementById('product-image').value,
            price: parseFloat(document.getElementById('product-price').value),
            description: document.getElementById('product-description').value,
            videoUrl: document.getElementById('product-video-url').value || null
        };
        
        if (saveProduct(productData)) {
            // Close modal
            document.getElementById('product-modal').classList.add('hidden');
        } else {
            alert('Failed to save product. Please try again.');
        }
    });
    
    // Handle modal responsiveness on resize
    window.addEventListener('resize', () => {
        adjustModalHeight();
    });
    
    // Adjust modal height when opened
    document.getElementById('add-product-btn').addEventListener('click', () => {
        setTimeout(adjustModalHeight, 100);
    });
    
    document.querySelectorAll('.edit-product-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(adjustModalHeight, 100);
        });
    });
    
    // Close modals when clicking outside
    document.getElementById('product-modal').addEventListener('click', (event) => {
        if (event.target === document.getElementById('product-modal')) {
            document.getElementById('product-modal').classList.add('hidden');
        }
    });
    
    document.getElementById('delete-confirmation-modal').addEventListener('click', (event) => {
        if (event.target === document.getElementById('delete-confirmation-modal')) {
            document.getElementById('delete-confirmation-modal').classList.add('hidden');
            productToDelete = null;
        }
    });
    
    // Export database button
    document.getElementById('export-db-btn').addEventListener('click', () => {
        exportDatabase();
        showNotification('Database exported successfully!', 'success');
    });
    
    // Import database button
    document.getElementById('import-db-btn').addEventListener('click', () => {
        document.getElementById('import-db-input').click();
    });
    
    // Import database file input
    document.getElementById('import-db-input').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const success = await importDatabase(file);
            if (success) {
                showNotification('Database imported successfully!', 'success');
            } else {
                showNotification('Failed to import database', 'error');
            }
        } catch (error) {
            console.error('Error importing database:', error);
            showNotification('Failed to import database', 'error');
        }
        
        // Reset file input
        event.target.value = '';
    });
}

// Adjust modal height based on viewport
function adjustModalHeight() {
    const modal = document.querySelector('#product-modal .bg-gray-800');
    if (modal && !modal.closest('#product-modal').classList.contains('hidden')) {
        const viewportHeight = window.innerHeight;
        const modalHeight = modal.offsetHeight;
        
        if (modalHeight > viewportHeight * 0.9) {
            modal.style.height = `${viewportHeight * 0.9}px`;
        } else {
            modal.style.height = 'auto';
        }
    }
}

// API Key Management Functions
function checkApiKey() {
    const apiKey = getApiKey();
    if (!apiKey) {
        // Show API key configuration modal on first load if no key is set
        showApiKeyModal();
    }
}

function getApiKey() {
    try {
        const encryptedKey = localStorage.getItem('tryvr_api_key');
        if (!encryptedKey) return null;
        
        // In a real app, you would use a proper encryption library
        // This is a simple obfuscation for demo purposes only
        return atob(encryptedKey);
    } catch (error) {
        console.error('Error retrieving API key:', error);
        return null;
    }
}

function saveApiKey(apiKey) {
    try {
        if (!apiKey) {
            localStorage.removeItem('tryvr_api_key');
            return;
        }
        
        // In a real app, you would use a proper encryption library
        // This is a simple obfuscation for demo purposes only
        const encryptedKey = btoa(apiKey);
        localStorage.setItem('tryvr_api_key', encryptedKey);
        
        showNotification('API key saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving API key:', error);
        showNotification('Failed to save API key', 'error');
    }
}

function showApiKeyModal() {
    const apiKeyModal = document.getElementById('api-key-modal');
    const currentKey = getApiKey() || '';
    
    // Mask the key if it exists
    document.getElementById('api-key-input').value = currentKey ? '••••••••••••••••••••••••••••••••' : '';
    
    // Show the modal
    apiKeyModal.classList.remove('hidden');
}

// Fetch product details from Amazon URL
async function fetchAmazonProductDetails(amazonUrl) {
    try {
        showNotification('Fetching product details...', 'success');
        
        // Extract ASIN from Amazon URL
        const asinMatch = amazonUrl.match(/\/dp\/([A-Z0-9]{10})/);
        const asin = asinMatch ? asinMatch[1] : null;
        
        if (!asin) {
            showNotification('Invalid Amazon URL. Please provide a URL with a product ID.', 'error');
            return null;
        }
        
        // Call our server-side scraping endpoint
        const response = await fetch('/api/scrape-amazon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amazonUrl })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch product details');
        }
        
        const productData = await response.json();
        
        showNotification('Product details fetched successfully!', 'success');
        return productData;
    } catch (error) {
        console.error('Error fetching Amazon product details:', error);
        showNotification('Failed to fetch product details: ' + error.message, 'error');
        return null;
    }
}

function validateLogin(username, password) {
    // Default admin credentials
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "tryvr2023";

    try {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Store login state in localStorage
            localStorage.setItem('tryvr_admin_auth', 'true');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login validation error:', error);
        return false;
    }
} 