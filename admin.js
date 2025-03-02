// Initialize SQLite database
const ITEMS_PER_PAGE = 10; // Fewer items per page for the admin table view
let currentPage = 1;
let totalProducts = 0;
let productToDelete = null;

// Your Amazon affiliate ID
const AFFILIATE_ID = "tryvr-20";

// Initialize the database
let db = {
    products: []
};

// Load database from localStorage
function loadDatabase() {
    const savedData = localStorage.getItem('vr-store-db');
    if (savedData) {
        try {
            db = JSON.parse(savedData);
            if (!db.products) {
                db.products = [];
            }
        } catch (error) {
            console.error('Error parsing database:', error);
            db = { products: [] };
        }
    }
}

// Save database to localStorage
function saveToLocalStorage() {
    localStorage.setItem('vr-store-db', JSON.stringify(db));
}

// Initialize the database
async function initDatabase() {
    try {
        // Load database from localStorage
        loadDatabase();
        
        // If no products exist, add some sample products
        if (db.products.length === 0) {
            // Add sample products
            db.products = [
                {
                    name: "Meta Quest 3",
                    price: 499.99,
                    category: "headsets",
                    description: "The Meta Quest 3 is a premium all-in-one VR headset with advanced mixed reality capabilities, high-resolution displays, and powerful performance.",
                    rating: 4.8,
                    image: "/vr-logo.svg"
                },
                {
                    name: "Meta Quest 2",
                    price: 249.99,
                    category: "headsets",
                    description: "The Meta Quest 2 is a versatile all-in-one VR headset that offers an immersive experience with crisp visuals, intuitive controls, and a wide range of games and applications.",
                    rating: 4.5,
                    image: "/vr-logo.svg"
                }
            ];
            
            // Save to localStorage
            saveToLocalStorage();
        }
        
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Function to convert external image URLs to local WebP images
async function convertExternalImagesToLocal() {
    try {
        // Show a notification that the process has started
        showNotification('Starting image conversion process...', 'success');
        
        // Get all products with external image URLs
        const result = db.exec(`SELECT id, image_url FROM products WHERE image_url LIKE 'http%'`);
        
        if (!result || !result[0] || !result[0].values || result[0].values.length === 0) {
            console.log('No products with external images found');
            showNotification('No products with external images found', 'success');
            return;
        }
        
        const products = result[0].values;
        console.log(`Found ${products.length} products with external images`);
        showNotification(`Found ${products.length} products with external images. Starting conversion...`, 'success');
        
        // Disable the convert button
        const convertButton = document.getElementById('convert-images-btn');
        const originalButtonText = convertButton.innerHTML;
        convertButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Converting (0/${products.length})...`;
        convertButton.disabled = true;
        
        // Process each product
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < products.length; i++) {
            const [id, imageUrl] = products[i];
            
            try {
                // Update button text with progress
                convertButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Converting (${i+1}/${products.length})...`;
                
                // Make a request to the server to download and convert the image
                const response = await fetch('/api/download-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ imageUrl })
                });
                
                if (!response.ok) {
                    console.error(`Failed to download image for product ${id}: ${response.statusText}`);
                    failCount++;
                    continue;
                }
                
                const data = await response.json();
                
                if (data.localPath) {
                    // Update the product with the local image path
                    db.run(`UPDATE products SET image_url = ? WHERE id = ?`, [data.localPath, id]);
                    console.log(`Updated product ${id} with local image: ${data.localPath}`);
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error(`Error processing image for product ${id}:`, error);
                failCount++;
            }
        }
        
        // Save database to localStorage
        saveToLocalStorage();
        
        // Reload products to show the changes
        loadProducts();
        
        // Restore the convert button
        convertButton.innerHTML = originalButtonText;
        convertButton.disabled = false;
        
        console.log('Image conversion completed');
        showNotification(`Image conversion completed: ${successCount} succeeded, ${failCount} failed`, 'success');
    } catch (error) {
        console.error('Error converting images:', error);
        showNotification('Failed to convert images: ' + error.message, 'error');
        
        // Restore the convert button
        const convertButton = document.getElementById('convert-images-btn');
        convertButton.innerHTML = `<i class="fas fa-images mr-2"></i>Convert Images to WebP`;
        convertButton.disabled = false;
    }
}

// Check authentication
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (localStorage.getItem('tryvr_admin_auth') !== 'true') {
        // Redirect to login page
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Initialize the application
    initDatabase()
        .then(() => {
            loadProducts();
            setupEventListeners();
            checkApiKey();
            
            // Initialize Bootstrap components
            initializeBootstrapComponents();
        })
        .catch(error => {
            console.error('Failed to initialize the application:', error);
            showNotification('Failed to initialize the application', 'error');
        });
});

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
                                <img class="h-10 w-10 rounded-md object-cover" src="${imageUrl}" alt="${title}" onerror="this.src='vr-logo.svg'">
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

// Save a product to the database
async function saveProduct(productData) {
    try {
        // Validate required fields
        if (!productData.name) throw new Error('Product name is required');
        if (isNaN(productData.price) || productData.price <= 0) throw new Error('Valid price is required');
        if (!productData.category) throw new Error('Category is required');
        
        // If this is a new product or we're changing the image
        let finalImageUrl = productData.image;
        
        // If image URL is provided and it's not already a local path
        if (finalImageUrl && !finalImageUrl.startsWith('/images/') && !finalImageUrl.startsWith('/vr-logo.svg')) {
            try {
                showNotification('Downloading and converting image...', 'info');
                
                // Download and convert the image
                const response = await fetch('/api/download-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ imageUrl: finalImageUrl })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to download image');
                }
                
                const data = await response.json();
                finalImageUrl = data.localPath;
                
                showNotification('Image downloaded and converted successfully!', 'success');
            } catch (error) {
                console.error('Error downloading image:', error);
                showNotification(`Warning: Using original image URL due to download error: ${error.message}`, 'warning');
                // Continue with the original URL if download fails
            }
        }
        
        // Save to database
        await saveProductToDatabase({
            ...productData,
            image: finalImageUrl
        });
        
        return true;
    } catch (error) {
        throw error;
    }
}

// Save product to database
function saveProductToDatabase(productData) {
    return new Promise((resolve) => {
        if (productData.id === null) {
            // Add new product
            db.products.push({
                name: productData.name,
                price: productData.price,
                category: productData.category,
                description: productData.description,
                rating: productData.rating,
                image: productData.image
            });
            showNotification('Product added successfully!', 'success');
        } else {
            // Update existing product
            db.products[productData.id] = {
                name: productData.name,
                price: productData.price,
                category: productData.category,
                description: productData.description,
                rating: productData.rating,
                image: productData.image
            };
            showNotification('Product updated successfully!', 'success');
        }
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Resolve the promise
        resolve(true);
    });
}

// Delete a product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        // Remove the product from the database
        db.products.splice(productId, 1);
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Reload products
        loadProducts();
        
        // Show notification
        showNotification('Product deleted successfully!', 'success');
    }
}

// Edit product
function editProduct(productId) {
    const product = db.products[productId];
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    // Get all required elements
    const productIdInput = document.getElementById('productId');
    const productName = document.getElementById('productName');
    const productPrice = document.getElementById('productPrice');
    const productCategory = document.getElementById('productCategory');
    const productDescription = document.getElementById('productDescription');
    const productRating = document.getElementById('productRating');
    const imageSourceUrl = document.getElementById('imageSourceUrl');
    const imageSourceUpload = document.getElementById('imageSourceUpload');
    const productImageUrl = document.getElementById('productImageUrl');
    const imagePreview = document.getElementById('imagePreview');
    const productModalLabel = document.getElementById('productModalLabel');
    const amazonUrl = document.getElementById('amazonUrl');
    
    // Check if all elements exist
    if (!productIdInput || !productName || !productPrice || !productCategory || 
        !productDescription || !productRating || !imageSourceUrl || !imageSourceUpload || 
        !productImageUrl || !imagePreview || !productModalLabel) {
        console.error('One or more elements not found for editProduct function');
        return;
    }
    
    // Populate the form
    productIdInput.value = productId;
    productName.value = product.name || '';
    productPrice.value = product.price || '';
    productCategory.value = product.category || 'headsets';
    productDescription.value = product.description || '';
    productRating.value = product.rating || '';
    
    // Clear Amazon URL field since we're editing an existing product
    if (amazonUrl) {
        amazonUrl.value = '';
    }
    
    // Set image source based on the image path
    if (product.image && (product.image.startsWith('/images/') || product.image.startsWith('/vr-logo.svg'))) {
        // Local image, use file upload option
        imageSourceUpload.checked = true;
        productImageUrl.value = '';
        
        // Show image preview
        imagePreview.src = product.image;
        imagePreview.classList.remove('hidden');
    } else {
        // External image, use URL option
        imageSourceUrl.checked = true;
        productImageUrl.value = product.image || '';
        
        // Show image preview if URL exists
        if (product.image) {
            imagePreview.src = product.image;
            imagePreview.classList.remove('hidden');
        } else {
            imagePreview.classList.add('hidden');
        }
    }
    
    // Update image source groups visibility
    toggleImageSource();
    
    // Set modal title
    productModalLabel.textContent = 'Edit Product';
    
    // Show the modal
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Show delete confirmation
function showDeleteConfirmation(productId) {
    productToDelete = productId;
    document.getElementById('delete-modal').classList.remove('hidden');
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
    // Special case for Meta Quest 3S
    if (productTitle.toLowerCase().includes('quest 3s')) {
        return "The Meta Quest 3S is an all-in-one VR headset that offers an immersive experience with high-resolution displays, intuitive controllers, and a vast library of games and apps. Featuring a powerful processor, comfortable design, and the ability to switch between immersive VR and mixed reality, it's perfect for gaming, fitness, social experiences, and productivity. Includes Batman: Arkham Shadow and a 3-month trial of Meta Quest+.";
    }
    
    // Special case for Meta Quest 3
    if (productTitle.toLowerCase().includes('quest 3') && !productTitle.toLowerCase().includes('quest 3s')) {
        return "The Meta Quest 3 is a premium all-in-one VR headset with advanced mixed reality capabilities, high-resolution displays, and powerful performance. Experience the next generation of virtual and mixed reality with unparalleled clarity and immersion.";
    }
    
    // Special case for Meta Quest 2
    if (productTitle.toLowerCase().includes('quest 2')) {
        return "The Meta Quest 2 is a versatile all-in-one VR headset that offers an immersive experience with crisp visuals, intuitive controls, and a wide range of games and applications. Step into virtual worlds with ease and comfort.";
    }
    
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
    const statusNotification = document.getElementById('status-notification');
    const statusMessage = document.getElementById('status-message');
    
    if (!statusNotification || !statusMessage) {
        console.error('Notification elements not found');
        alert(message);
        return;
    }
    
    // Set the message
    statusMessage.textContent = message;
    
    // Set the color based on type
    statusNotification.className = 'fixed bottom-4 right-4 left-4 md:left-auto p-4 rounded-lg shadow-lg transform transition-transform duration-300 vr-glow max-w-md mx-auto md:mx-0';
    
    switch (type) {
        case 'success':
            statusNotification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            statusNotification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            statusNotification.classList.add('bg-yellow-500', 'text-white');
            break;
        case 'info':
            statusNotification.classList.add('bg-blue-500', 'text-white');
            break;
        default:
            statusNotification.classList.add('bg-green-500', 'text-white');
    }
    
    // Show the notification
    statusNotification.classList.remove('translate-y-20', 'opacity-0');
    
    // Hide the notification after 3 seconds
    setTimeout(() => {
        statusNotification.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
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
    // Add product button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', addProduct);
    }
    
    // Fetch product details button
    const fetchDetailsBtn = document.getElementById('fetchDetailsBtn');
    if (fetchDetailsBtn) {
        fetchDetailsBtn.addEventListener('click', async () => {
            const amazonUrl = document.getElementById('amazonUrl').value;
            if (!amazonUrl) {
                showNotification('Please enter an Amazon product URL', 'warning');
                return;
            }
            
            // Show loading state
            fetchDetailsBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Fetching...';
            fetchDetailsBtn.disabled = true;
            
            try {
                // Fetch product details
                const productDetails = await fetchAmazonProductDetails(amazonUrl);
                
                if (productDetails) {
                    // Populate form fields with fetched data
                    document.getElementById('productName').value = productDetails.title || '';
                    document.getElementById('productPrice').value = productDetails.price || '';
                    document.getElementById('productDescription').value = productDetails.description || '';
                    document.getElementById('productRating').value = productDetails.rating || '';
                    
                    // Set category if available
                    if (productDetails.category) {
                        const categorySelect = document.getElementById('productCategory');
                        // Try to match the category, default to 'headsets' if no match
                        const categoryValue = productDetails.category.toLowerCase();
                        if (Array.from(categorySelect.options).some(option => option.value === categoryValue)) {
                            categorySelect.value = categoryValue;
                        }
                    }
                    
                    // Set image URL if available
                    if (productDetails.imageUrl) {
                        const imageSourceUrl = document.getElementById('imageSourceUrl');
                        const productImageUrl = document.getElementById('productImageUrl');
                        const imagePreview = document.getElementById('imagePreview');
                        
                        if (imageSourceUrl && productImageUrl && imagePreview) {
                            imageSourceUrl.checked = true;
                            toggleImageSource();
                            productImageUrl.value = productDetails.imageUrl;
                            imagePreview.src = productDetails.imageUrl;
                            imagePreview.classList.remove('hidden');
                        }
                    }
                    
                    showNotification('Product details fetched successfully!', 'success');
                }
            } catch (error) {
                console.error('Error fetching product details:', error);
                showNotification('Failed to fetch product details', 'error');
            } finally {
                // Reset button state
                fetchDetailsBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Fetch';
                fetchDetailsBtn.disabled = false;
            }
        });
    }
    
    // Setup delete modal
    const deleteModal = document.getElementById('delete-modal');
    const closeDeleteModal = document.getElementById('close-delete-modal');
    const cancelDelete = document.getElementById('cancel-delete');
    const confirmDelete = document.getElementById('confirm-delete');
    
    if (deleteModal) {
        // Close when clicking outside the modal content
        deleteModal.addEventListener('click', (event) => {
            if (event.target === deleteModal) {
                deleteModal.classList.add('hidden');
            }
        });
    }
    
    if (closeDeleteModal) {
        closeDeleteModal.addEventListener('click', () => {
            deleteModal.classList.add('hidden');
        });
    }
    
    if (cancelDelete) {
        cancelDelete.addEventListener('click', () => {
            deleteModal.classList.add('hidden');
        });
    }
    
    if (confirmDelete) {
        confirmDelete.addEventListener('click', () => {
            if (productToDelete !== null) {
                deleteProduct(productToDelete);
                deleteModal.classList.add('hidden');
                productToDelete = null;
            }
        });
    }
    
    // Setup API key modal
    const apiKeyModal = document.getElementById('api-key-modal');
    const closeApiModal = document.getElementById('close-api-modal');
    const saveApiKey = document.getElementById('save-api-key');
    const showApiKey = document.getElementById('show-api-key');
    const apiKeyInput = document.getElementById('api-key-input');
    
    if (apiKeyModal) {
        // Close when clicking outside the modal content
        apiKeyModal.addEventListener('click', (event) => {
            if (event.target === apiKeyModal) {
                apiKeyModal.classList.add('hidden');
            }
        });
    }
    
    if (closeApiModal) {
        closeApiModal.addEventListener('click', () => {
            apiKeyModal.classList.add('hidden');
        });
    }
    
    if (saveApiKey && apiKeyInput) {
        saveApiKey.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            saveApiKey(apiKey);
            apiKeyModal.classList.add('hidden');
        });
    }
    
    if (showApiKey && apiKeyInput) {
        showApiKey.addEventListener('change', () => {
            apiKeyInput.type = showApiKey.checked ? 'text' : 'password';
        });
    }
    
    // Product form submission
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const productId = document.getElementById('productId').value;
            const name = document.getElementById('productName').value;
            const price = parseFloat(document.getElementById('productPrice').value);
            const category = document.getElementById('productCategory').value;
            const description = document.getElementById('productDescription').value;
            const rating = parseFloat(document.getElementById('productRating').value) || 0;
            const amazonUrl = document.getElementById('amazonUrl').value;
            
            // Get image data
            let image = '';
            const imageSourceUrl = document.getElementById('imageSourceUrl');
            if (imageSourceUrl.checked) {
                image = document.getElementById('productImageUrl').value;
            } else {
                const imageFile = document.getElementById('productImageFile').files[0];
                if (imageFile) {
                    // For simplicity, we'll use the default logo if a file is selected
                    // In a real app, you'd upload the file to a server
                    image = '/vr-logo.svg';
                }
            }
            
            // Create affiliate link if Amazon URL is provided
            const affiliateUrl = amazonUrl ? addAffiliateTag(amazonUrl) : '';
            
            // Create product data object
            const productData = {
                name,
                price,
                category,
                description,
                rating,
                image,
                amazonUrl,
                affiliateUrl
            };
            
            // Save product
            if (productId) {
                // Update existing product
                db.products[productId] = productData;
            } else {
                // Add new product
                db.products.push(productData);
            }
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Reload products
            loadProducts();
            
            // Hide modal
            const modal = document.getElementById('productModal');
            if (modal) {
                modal.classList.add('hidden');
            }
            
            // Show success notification
            showNotification(`Product ${productId ? 'updated' : 'added'} successfully!`);
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('tryvr_admin_auth');
            window.location.href = 'admin-login.html';
        });
    }
    
    // Convert images button
    const convertImagesBtn = document.getElementById('convert-images-btn');
    if (convertImagesBtn) {
        convertImagesBtn.addEventListener('click', convertExternalImagesToLocal);
    }
    
    // Export database button
    const exportDbBtn = document.getElementById('export-db-btn');
    if (exportDbBtn) {
        exportDbBtn.addEventListener('click', exportDatabase);
    }
    
    // Import database button
    const importDbBtn = document.getElementById('import-db-btn');
    if (importDbBtn) {
        importDbBtn.addEventListener('click', () => {
            document.getElementById('import-db-input').click();
        });
    }
    
    // Import database input
    const importDbInput = document.getElementById('import-db-input');
    if (importDbInput) {
        importDbInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                importDatabase(file);
            }
        });
    }
    
    // API settings button
    const apiSettingsBtn = document.getElementById('api-settings-btn');
    if (apiSettingsBtn) {
        apiSettingsBtn.addEventListener('click', showApiKeyModal);
    }
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
        showNotification('Fetching product details...', 'info');
        
        // For demonstration purposes, we'll simulate fetching product details
        // In a real application, you would make an API call to your server
        // which would then scrape or use Amazon's API to get the product details
        
        // Extract ASIN from Amazon URL
        const asinMatch = amazonUrl.match(/\/dp\/([A-Z0-9]{10})/);
        const asin = asinMatch ? asinMatch[1] : null;
        
        if (!asin) {
            showNotification('Invalid Amazon URL. Please provide a URL with a product ID.', 'error');
            return null;
        }
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Sample product data based on ASIN
        const productData = {
            title: '',
            price: 0,
            description: '',
            rating: 4.5,
            category: 'headsets',
            imageUrl: ''
        };
        
        // Populate with sample data based on ASIN
        switch(asin) {
            case 'B09B8DQ26F': // Meta Quest 2
                productData.title = 'Meta Quest 2 — Advanced All-In-One Virtual Reality Headset — 128 GB';
                productData.price = 249.99;
                productData.description = 'The Meta Quest 2 is a versatile all-in-one VR headset that offers an immersive experience with crisp visuals, intuitive controls, and a wide range of games and applications. Step into virtual worlds with ease and comfort.';
                productData.rating = 4.7;
                productData.imageUrl = 'https://m.media-amazon.com/images/I/615YaAiA-ML._AC_SL1500_.jpg';
                break;
                
            case 'B0C5QW5STJ': // Meta Quest 3
                productData.title = 'Meta Quest 3 128GB — Advanced All-In-One Mixed Reality Headset';
                productData.price = 499.99;
                productData.description = 'The Meta Quest 3 is a premium all-in-one VR headset with advanced mixed reality capabilities, high-resolution displays, and powerful performance. Experience the next generation of virtual and mixed reality with unparalleled clarity and immersion.';
                productData.rating = 4.8;
                productData.imageUrl = 'https://m.media-amazon.com/images/I/61Yw7IEK-QL._AC_SL1500_.jpg';
                break;
                
            case 'B0DDK1WM9K': // Meta Quest 3S
                productData.title = 'Meta Quest 3S 128GB — All-In-One Mixed Reality Headset';
                productData.price = 299.99;
                productData.description = "The Meta Quest 3S is an all-in-one VR headset that offers an immersive experience with high-resolution displays, intuitive controllers, and a vast library of games and apps. Featuring a powerful processor, comfortable design, and the ability to switch between immersive VR and mixed reality, it's perfect for gaming, fitness, social experiences, and productivity.";
                productData.rating = 4.5;
                productData.imageUrl = 'https://m.media-amazon.com/images/I/61Yw7IEK-QL._AC_SL1500_.jpg';
                break;
                
            default:
                // Generic VR product data
                productData.title = `VR Headset (ASIN: ${asin})`;
                productData.price = 299.99;
                productData.description = `This VR headset offers an immersive virtual reality experience with high-quality visuals and comfortable design. Perfect for gaming, entertainment, and exploring virtual worlds.`;
                productData.rating = 4.2;
                productData.imageUrl = '/vr-logo.svg';
        }
        
        // Add affiliate link
        productData.affiliateUrl = addAffiliateTag(amazonUrl);
        
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

// Initialize Bootstrap components
function initializeBootstrapComponents() {
    // Create a simple modal implementation for Tailwind CSS
    
    // Handle modal open/close
    const productModal = document.getElementById('productModal');
    if (!productModal) {
        console.error('Product modal not found');
        return;
    }
    
    // Close button event listener
    const closeButton = document.getElementById('close-product-modal');
    const cancelButton = document.getElementById('cancel-product');
    
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            productModal.classList.add('hidden');
        });
    }
    
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            productModal.classList.add('hidden');
        });
    }
    
    // Close modal when clicking outside the modal content
    productModal.addEventListener('click', (event) => {
        // Check if the click was directly on the modal background (not on its children)
        if (event.target === productModal) {
            productModal.classList.add('hidden');
        }
    });
    
    // Add event listeners for image source toggle
    const imageSourceUrl = document.getElementById('imageSourceUrl');
    const imageSourceUpload = document.getElementById('imageSourceUpload');
    
    if (imageSourceUrl && imageSourceUpload) {
        imageSourceUrl.addEventListener('change', toggleImageSource);
        imageSourceUpload.addEventListener('change', toggleImageSource);
        
        // Add event listener for image file selection
        const productImageFile = document.getElementById('productImageFile');
        if (productImageFile) {
            productImageFile.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const imagePreview = document.getElementById('imagePreview');
                        if (imagePreview) {
                            imagePreview.src = e.target.result;
                            imagePreview.classList.remove('hidden');
                        }
                    };
                    reader.readAsDataURL(file);
                } else {
                    const imagePreview = document.getElementById('imagePreview');
                    if (imagePreview) {
                        imagePreview.classList.add('hidden');
                    }
                }
            });
        }
        
        // Add event listener for image URL input
        const productImageUrl = document.getElementById('productImageUrl');
        if (productImageUrl) {
            productImageUrl.addEventListener('input', function(event) {
                const url = event.target.value;
                const imagePreview = document.getElementById('imagePreview');
                if (imagePreview) {
                    if (url) {
                        imagePreview.src = url;
                        imagePreview.classList.remove('hidden');
                    } else {
                        imagePreview.classList.add('hidden');
                    }
                }
            });
        }
    }
    
    // Add event listener for add product button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', addProduct);
    }
    
    console.log('Tailwind modal components initialized');
}

// Function to toggle between image source options
function toggleImageSource() {
    const imageSourceUrl = document.getElementById('imageSourceUrl');
    const productImageUrlGroup = document.getElementById('productImageUrlGroup');
    const productImageFileGroup = document.getElementById('productImageFileGroup');
    
    if (imageSourceUrl && productImageUrlGroup && productImageFileGroup) {
        if (imageSourceUrl.checked) {
            productImageUrlGroup.style.display = 'block';
            productImageFileGroup.style.display = 'none';
        } else {
            productImageUrlGroup.style.display = 'none';
            productImageFileGroup.style.display = 'block';
        }
    }
}

// Function to open the product modal for adding a new product
function addProduct() {
    // Reset the form
    const productForm = document.getElementById('productForm');
    const productId = document.getElementById('productId');
    const productModalLabel = document.getElementById('productModalLabel');
    const imagePreview = document.getElementById('imagePreview');
    const imageSourceUrl = document.getElementById('imageSourceUrl');
    const amazonUrl = document.getElementById('amazonUrl');
    
    if (productForm && productId && productModalLabel && imagePreview && imageSourceUrl) {
        productForm.reset();
        productId.value = '';
        productModalLabel.textContent = 'Add Product';
        
        // Reset Amazon URL field
        if (amazonUrl) {
            amazonUrl.value = '';
        }
        
        // Reset image preview
        imagePreview.classList.add('hidden');
        imagePreview.src = '';
        
        // Default to URL input
        imageSourceUrl.checked = true;
        toggleImageSource();
        
        // Show the modal
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    } else {
        console.error('One or more elements not found for addProduct function');
    }
}

// Function to open the product modal for editing an existing product
function editProduct(productId) {
    const product = db.products[productId];
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    // Get all required elements
    const productIdInput = document.getElementById('productId');
    const productName = document.getElementById('productName');
    const productPrice = document.getElementById('productPrice');
    const productCategory = document.getElementById('productCategory');
    const productDescription = document.getElementById('productDescription');
    const productRating = document.getElementById('productRating');
    const imageSourceUrl = document.getElementById('imageSourceUrl');
    const imageSourceUpload = document.getElementById('imageSourceUpload');
    const productImageUrl = document.getElementById('productImageUrl');
    const imagePreview = document.getElementById('imagePreview');
    const productModalLabel = document.getElementById('productModalLabel');
    const amazonUrl = document.getElementById('amazonUrl');
    
    // Check if all elements exist
    if (!productIdInput || !productName || !productPrice || !productCategory || 
        !productDescription || !productRating || !imageSourceUrl || !imageSourceUpload || 
        !productImageUrl || !imagePreview || !productModalLabel) {
        console.error('One or more elements not found for editProduct function');
        return;
    }
    
    // Populate the form
    productIdInput.value = productId;
    productName.value = product.name || '';
    productPrice.value = product.price || '';
    productCategory.value = product.category || 'headsets';
    productDescription.value = product.description || '';
    productRating.value = product.rating || '';
    
    // Clear Amazon URL field since we're editing an existing product
    if (amazonUrl) {
        amazonUrl.value = '';
    }
    
    // Set image source based on the image path
    if (product.image && (product.image.startsWith('/images/') || product.image.startsWith('/vr-logo.svg'))) {
        // Local image, use file upload option
        imageSourceUpload.checked = true;
        productImageUrl.value = '';
        
        // Show image preview
        imagePreview.src = product.image;
        imagePreview.classList.remove('hidden');
    } else {
        // External image, use URL option
        imageSourceUrl.checked = true;
        productImageUrl.value = product.image || '';
        
        // Show image preview if URL exists
        if (product.image) {
            imagePreview.src = product.image;
            imagePreview.classList.remove('hidden');
        } else {
            imagePreview.classList.add('hidden');
        }
    }
    
    // Update image source groups visibility
    toggleImageSource();
    
    // Set modal title
    productModalLabel.textContent = 'Edit Product';
    
    // Show the modal
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
} 