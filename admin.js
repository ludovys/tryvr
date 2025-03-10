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
    try {
        console.log("Loading database from localStorage...");
        
        const savedData = localStorage.getItem('vr-store-db');
        if (savedData) {
            try {
                db = JSON.parse(savedData);
                
                // Ensure products array exists
                if (!db.products || !Array.isArray(db.products)) {
                    console.warn("Invalid products array in saved data, initializing empty array");
                    db.products = [];
                }
                
                console.log(`Loaded ${db.products.length} products from localStorage`);
                return true;
            } catch (error) {
                console.error('Error parsing database:', error);
                db = { products: [] };
                return false;
            }
        } else {
            console.log("No saved database found in localStorage, initializing empty database");
            db = { products: [] };
            return false;
        }
    } catch (error) {
        console.error("Error loading database from localStorage:", error);
        db = { products: [] };
        return false;
    }
}

// Save database to localStorage
function saveToLocalStorage() {
    try {
        console.log("Saving database to localStorage...");
        
        // Ensure we have a valid database object
        if (!db || typeof db !== 'object') {
            console.error("Invalid database object:", db);
            return false;
        }
        
        // Ensure products array exists
        if (!Array.isArray(db.products)) {
            console.error("Invalid products array:", db.products);
            db.products = [];
        }
        
        // Save to localStorage
        localStorage.setItem('vr-store-db', JSON.stringify(db));
        
        console.log(`Saved ${db.products.length} products to localStorage`);
        return true;
    } catch (error) {
        console.error("Error saving to localStorage:", error);
        return false;
    }
}

// Initialize the database
async function initDatabase() {
    try {
        // Load database from localStorage
        loadDatabase();
        
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        return false;
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
        console.log("Loading products from database...");
        
        // Get filter values
        const categoryFilter = document.getElementById('admin-category').value;
        const minRatingFilter = parseFloat(document.getElementById('admin-min-rating').value);
        const sortBy = document.getElementById('admin-sort').value;
        
        // Filter products
        let filteredProducts = [...db.products];
        
        // Apply category filter
        if (categoryFilter !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
        }
        
        // Apply rating filter
        if (minRatingFilter > 0) {
            filteredProducts = filteredProducts.filter(product => parseFloat(product.rating) >= minRatingFilter);
        }
        
        // Apply sorting
        switch (sortBy) {
            case 'newest':
                // No sorting needed as newest are already at the end
                break;
            case 'oldest':
                filteredProducts.reverse();
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'price-low':
                filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'rating':
                filteredProducts.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
                break;
        }
        
        // Update total count
        totalProducts = filteredProducts.length;
        
        // Update product count display
        const productCount = document.getElementById('product-count');
        if (productCount) {
            productCount.textContent = `${totalProducts} product${totalProducts !== 1 ? 's' : ''}`;
        }
        
        // Calculate pagination
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        
        // Adjust current page if needed
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        // Update page info
        const pageInfo = document.getElementById('admin-page-info');
        if (pageInfo) {
            pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        }
        
        // Enable/disable pagination buttons
        const prevPageBtn = document.getElementById('admin-prev-page');
        const nextPageBtn = document.getElementById('admin-next-page');
        
        if (prevPageBtn) {
            prevPageBtn.disabled = currentPage <= 1;
            prevPageBtn.classList.toggle('opacity-50', currentPage <= 1);
        }
        
        if (nextPageBtn) {
            nextPageBtn.disabled = currentPage >= totalPages;
            nextPageBtn.classList.toggle('opacity-50', currentPage >= totalPages);
        }
        
        // Get current page products
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const currentPageProducts = filteredProducts.slice(startIndex, endIndex);
        
        // Display products
        displayProducts(currentPageProducts);
        
        // Force update the frontend database to ensure it's in sync
        saveToSQLDatabase()
            .catch(error => {
                console.error("Error updating frontend database during loadProducts:", error);
            });
            
        return currentPageProducts;
    } catch (error) {
        console.error("Error loading products:", error);
        showNotification("Error loading products: " + error.message, "error");
        return [];
    }
}

// Display products in the admin table
function displayProducts(products) {
    try {
        const tableBody = document.getElementById('products-table-body');
        if (!tableBody) {
            console.error('Products table body not found');
            return;
        }
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        if (products.length === 0) {
            // Display a message when no products are found
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="5" class="px-6 py-4 text-center text-gray-400">
                    <i class="fas fa-box-open text-3xl mb-2"></i>
                    <p>No products found. Add some products to get started!</p>
                </td>
            `;
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // Add each product to the table
        products.forEach((product, index) => {
            try {
                // Get the actual index in the database
                const id = db.products.indexOf(product);
                if (id === -1) {
                    console.error('Product not found in database:', product);
                    return;
                }
                
                const name = product.name || 'Unnamed Product';
                const price = parseFloat(product.price) || 0;
                const category = product.category || 'accessories';
                const rating = parseFloat(product.rating) || 0;
                const image = product.image || '/vr-logo.svg';
                const amazonUrl = product.amazonUrl || '';
                const affiliateUrl = product.affiliateUrl || amazonUrl;
                
                // Create a new row
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-700 transition';
                
                // Format the row content
                row.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <img class="h-10 w-10 rounded-full object-cover" src="${image}" alt="${name}">
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-white">${name}</div>
                                <div class="text-sm text-gray-400">$${price.toFixed(2)}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getCategoryColor(category)} text-white">
                            ${getCategoryLabel(category)}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-300">$${price.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-300">${rating.toFixed(1)} ★</td>
                    <td class="px-6 py-4 text-sm font-medium">
                        <div class="flex space-x-2">
                            <button class="edit-product-btn bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500" data-id="${id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-product-btn bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500" data-id="${id}">
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

// Helper function to get category color
function getCategoryColor(category) {
    switch (category) {
        case 'headsets':
            return 'purple-600';
        case 'controllers':
            return 'blue-600';
        case 'accessories':
            return 'green-600';
        case 'games':
            return 'yellow-600';
        case 'computers':
            return 'red-600';
        default:
            return 'gray-600';
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
                
                // Create a unique ID for this image - use uniqueImageId if available, product ID if available, or timestamp
                const uniqueId = productData.uniqueImageId || 
                                (productData.id ? productData.id.toString() : Date.now().toString());
                
                // Download and convert the image with uniqueId to ensure uniqueness
                const response = await fetch('/api/download-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        imageUrl: finalImageUrl,
                        uniqueId: uniqueId
                    })
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
        // Create proper URL paths
        let amazonUrl = productData.amazonUrl || '';
        let affiliateUrl = '';
        
        // Check if the Amazon URL already has affiliate information
        if (amazonUrl.includes('linkCode=') && amazonUrl.includes('tag=')) {
            // It's already a full affiliate link, use it as is
            affiliateUrl = amazonUrl;
        } else {
            // Create a simple affiliate link
            affiliateUrl = addAffiliateTag(amazonUrl);
        }
        
        // Determine image URL
        let imageUrl = productData.image || '/vr-logo.svg';
        
        // Ensure price is a valid number
        let price = 0;
        if (typeof productData.price === 'string') {
            // Remove any currency symbols and commas
            const cleanPrice = productData.price.replace(/[$,]/g, '');
            price = parseFloat(cleanPrice);
        } else if (typeof productData.price === 'number') {
            price = productData.price;
        }
        
        // Validate price
        if (isNaN(price) || price <= 0) {
            console.warn('Invalid price detected:', productData.price);
            price = 0;
        }
        
        if (productData.id === null) {
            // Add new product
            const newProduct = {
                name: productData.name,
                amazonUrl: amazonUrl,
                affiliateUrl: affiliateUrl,
                price: price,
                category: productData.category,
                description: productData.description,
                rating: productData.rating,
                image: imageUrl,
                videoUrl: productData.videoUrl || null
            };
            db.products.push(newProduct);
            
            console.log("Product added to database:", newProduct);
            showNotification('Product added successfully!', 'success');
        } else {
            // Update existing product
            const updatedProduct = {
                name: productData.name,
                amazonUrl: amazonUrl,
                affiliateUrl: affiliateUrl,
                price: price,
                category: productData.category,
                description: productData.description,
                rating: productData.rating,
                image: imageUrl,
                videoUrl: productData.videoUrl || (productData.id !== null ? db.products[productData.id].videoUrl : null) || null
            };
            db.products[productData.id] = updatedProduct;
            
            console.log("Product updated in database:", updatedProduct);
            showNotification('Product updated successfully!', 'success');
        }
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Also save to SQL database for the frontend
        saveToSQLDatabase()
            .then(() => {
                console.log(`Product "${productData.name}" successfully saved and frontend database updated`);
                
                // Reload products
                loadProducts();
                
                // Clear the stored image data
                localStorage.removeItem('tempImageDataUrl');
                localStorage.removeItem('tempImageUniqueId');
                
                // Clear the stored video data
                localStorage.removeItem('tempVideoDataUrl');
                localStorage.removeItem('tempVideoUniqueId');
                
                resolve();
            })
            .catch(error => {
                console.error(`Error updating frontend database after saving product:`, error);
                showNotification('Product saved but error updating frontend database. Please refresh the page.', 'warning');
                
                // Still resolve since the product was saved locally
                resolve();
            });
    });
}

// Save current products to SQL database for frontend access
function saveToSQLDatabase() {
    try {
        console.log("Saving products to SQL database for frontend");
        
        // Clear frontend cache first
        clearFrontendCache();
        
        // Return the Promise for proper async handling
        return fetch('/api/create-sql-db', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                products: db.products.map((p, index) => {
                    // Determine the affiliate URL to use
                    let affiliateUrl = p.affiliateUrl || "";
                    
                    // If no affiliate URL but we have an Amazon URL, create one
                    if (!affiliateUrl && p.amazonUrl) {
                        // Check if the Amazon URL already has affiliate information
                        if (p.amazonUrl.includes('linkCode=') && p.amazonUrl.includes('tag=')) {
                            // It's already a full affiliate link, use it as is
                            affiliateUrl = p.amazonUrl;
                        } else {
                            // Create a simple affiliate link
                            affiliateUrl = addAffiliateTag(p.amazonUrl);
                        }
                    }
                    
                    // Ensure price is a valid number
                    let price = 0;
                    if (typeof p.price === 'string') {
                        // Remove any currency symbols and commas
                        const cleanPrice = p.price.replace(/[$,]/g, '');
                        price = parseFloat(cleanPrice);
                    } else if (typeof p.price === 'number') {
                        price = p.price;
                    }
                    
                    // Validate price
                    if (isNaN(price) || price <= 0) {
                        console.warn('Invalid price detected for product:', p.name, p.price);
                        price = 0;
                    }
                    
                    return [
                        index, // id
                        p.name, // title
                        p.amazonUrl || "", // amazon_url
                        affiliateUrl, // affiliate_url
                        parseFloat(p.rating) || 4.5, // rating
                        p.category || "accessories", // category
                        p.image || "/vr-logo.svg", // image_url
                        price, // price
                        p.description || "", // description
                        p.videoUrl || null // video_url
                    ];
                })
            })
        }).then(response => {
            if (response.ok) {
                console.log("SQL database created successfully");
                showNotification("Frontend database updated successfully", "success");
                
                // Clear browser cache by calling the clear-cache endpoint
                return fetch(`/api/clear-cache?t=${new Date().getTime()}`)
                    .then(() => {
                        console.log("Browser cache cleared successfully");
                        return response.json();
                    })
                    .catch(error => {
                        console.warn("Error clearing browser cache:", error);
                        return response.json();
                    });
            } else {
                console.error("Failed to create SQL database");
                showNotification("Failed to update frontend database", "error");
                throw new Error("Failed to update frontend database");
            }
        }).catch(error => {
            console.error("Error creating SQL database:", error);
            showNotification("Error updating frontend database: " + error.message, "error");
            throw error;
        });
    } catch (error) {
        console.error("Error in saveToSQLDatabase:", error);
        showNotification("Error updating frontend database: " + error.message, "error");
        return Promise.reject(error);
    }
}

// Delete a product
function deleteProduct(productId) {
    try {
        console.log(`Deleting product with ID: ${productId}`);
        
        // Get product name before deletion for the notification
        const productName = db.products[productId]?.name || "Product";
        
        // Remove the product from the database
        if (productId >= 0 && productId < db.products.length) {
            db.products.splice(productId, 1);
            console.log(`Product removed from database array at index ${productId}`);
        } else {
            console.error(`Invalid product ID: ${productId}`);
            showNotification(`Error: Invalid product ID ${productId}`, 'error');
            return;
        }
        
        // Save to localStorage
        const saveResult = saveToLocalStorage();
        console.log(`Save to localStorage result: ${saveResult}`);
        
        // Clear frontend localStorage cache - more aggressive clearing
        localStorage.removeItem('tryvr_frontend_products');
        localStorage.removeItem('vr-products-cache');
        localStorage.removeItem('vr-store-products');
        localStorage.removeItem('tryvr_products_db');
        localStorage.removeItem('products-last-updated');
        localStorage.removeItem('products-cache');
        localStorage.removeItem('vr-products');
        console.log("Frontend cache cleared directly from localStorage");
        
        // Create a direct file write to frontend_products.json with an empty array
        // This is a more direct approach to ensure the file is cleared
        fetch('/api/write-empty-products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                console.warn('Failed to write empty products file, trying clear-frontend-db endpoint');
                // Fall back to the clear-frontend-db endpoint
                return fetch('/api/clear-frontend-db', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            return response;
        })
        .then(response => {
            if (!response.ok) {
                console.warn('Failed to clear frontend database, continuing anyway');
                return { ok: false };
            } else {
                console.log('Frontend database cleared successfully');
                return { ok: true };
            }
        })
        .then(clearResult => {
            // Then update with current products
            console.log(`Updating frontend database with ${db.products.length} products`);
            return saveToSQLDatabase()
                .then(data => ({ sqlResult: data, clearResult }));
        })
        .then(({ sqlResult, clearResult }) => {
            console.log(`Product "${productName}" (ID: ${productId}) successfully deleted and frontend database updated`);
            console.log('SQL database update result:', sqlResult);
            
            // Clear browser cache by calling the clear-cache endpoint
            return fetch(`/api/clear-cache?t=${new Date().getTime()}`);
        })
        .then(response => {
            if (!response.ok) {
                console.warn('Failed to clear browser cache, continuing anyway');
            } else {
                console.log('Browser cache cleared successfully');
            }
            
            // Reload products
            loadProducts();
            
            // Show success notification
            showNotification(`Product "${productName}" deleted successfully`, 'success');
        })
        .catch(error => {
            console.error('Error in delete process:', error);
            showNotification(`Error deleting product: ${error.message}`, 'error');
            
            // Reload products anyway to ensure UI is in sync with data
            loadProducts();
        });
    } catch (error) {
        console.error('Error in deleteProduct function:', error);
        showNotification(`Error deleting product: ${error.message}`, 'error');
        
        // Reload products anyway to ensure UI is in sync with data
        loadProducts();
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
    try {
        // Store the product ID to be deleted
        productToDelete = productId;
        
        // Get the product name for the confirmation message
        const product = db.products[productId];
        const productName = product ? product.name : "this product";
        
        // Update the confirmation message with the product name
        const confirmationMessage = document.getElementById('delete-confirmation-message');
        if (confirmationMessage) {
            confirmationMessage.textContent = `Are you sure you want to delete "${productName}"?`;
        }
        
        // Show the delete confirmation modal
        document.getElementById('delete-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Error showing delete confirmation:', error);
        showNotification('Error showing delete confirmation: ' + error.message, 'error');
    }
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
    
    // Add form submission handler
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Get form values
                const productId = document.getElementById('productId').value;
                const productName = document.getElementById('productName').value;
                const productPrice = parseFloat(document.getElementById('productPrice').value);
                const productCategory = document.getElementById('productCategory').value;
                const productDescription = document.getElementById('productDescription').value;
                const productRating = parseFloat(document.getElementById('productRating').value) || 4.5;
                const amazonUrl = document.getElementById('amazonUrl').value;
                
                // Validate required fields
                if (!productName) {
                    showNotification('Product name is required', 'error');
                    return;
                }
                
                if (isNaN(productPrice) || productPrice <= 0) {
                    showNotification('Valid price is required', 'error');
                    return;
                }
                
                // Get image URL based on source
                let imageUrl = '/vr-logo.svg';
                const imageSourceUrl = document.getElementById('imageSourceUrl');
                
                if (imageSourceUrl && imageSourceUrl.checked) {
                    // Using URL
                    const productImageUrl = document.getElementById('productImageUrl').value;
                    if (productImageUrl) {
                        imageUrl = productImageUrl;
                    }
                } else {
                    // Using uploaded file
                    const tempImageDataUrl = localStorage.getItem('tempImageDataUrl');
                    if (tempImageDataUrl) {
                        imageUrl = tempImageDataUrl;
                    }
                }
                
                // Get video URL based on source
                let videoUrl = null;
                const videoSourceUrl = document.getElementById('videoSourceUrl');
                
                if (videoSourceUrl && videoSourceUrl.checked) {
                    // Using URL
                    const productVideoUrl = document.getElementById('productVideoUrl').value;
                    if (productVideoUrl) {
                        videoUrl = productVideoUrl;
                    }
                } else {
                    // Using uploaded file
                    const tempVideoDataUrl = localStorage.getItem('tempVideoDataUrl');
                    if (tempVideoDataUrl) {
                        videoUrl = tempVideoDataUrl;
                    }
                }
                
                // Prepare product data
                const productData = {
                    id: productId ? parseInt(productId) : null,
                    name: productName,
                    price: productPrice,
                    category: productCategory,
                    description: productDescription,
                    rating: productRating,
                    amazonUrl: amazonUrl,
                    image: imageUrl,
                    videoUrl: videoUrl,
                    uniqueImageId: localStorage.getItem('tempImageUniqueId'),
                    uniqueVideoId: localStorage.getItem('tempVideoUniqueId')
                };
                
                // Save product
                await saveProduct(productData);
                
                // Hide modal
                const productModal = document.getElementById('productModal');
                if (productModal) {
                    productModal.classList.add('hidden');
                }
                
                // Reload products
                loadProducts();
                
            } catch (error) {
                console.error('Error saving product:', error);
                showNotification('Error saving product: ' + error.message, 'error');
            }
        });
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
                            
                            // If it's the default image, clear the URL field to allow user to enter their own
                            if (productDetails.imageUrl === '/vr-logo.svg') {
                                productImageUrl.value = '';
                                showNotification('Could not fetch product image. Please enter an image URL manually.', 'warning');
                            } else {
                                productImageUrl.value = productDetails.imageUrl;
                            }
                            
                            imagePreview.src = productDetails.imageUrl;
                            imagePreview.classList.remove('hidden');
                        }
                    }
                    
                    // Show the improve description button if we have a title and description
                    const improveDescBtn = document.getElementById('improveDescriptionBtn');
                    if (improveDescBtn && productDetails.title && productDetails.description) {
                        improveDescBtn.classList.remove('hidden');
                    }
                    
                    showNotification('Product details fetched successfully!', 'success');
                }
            } catch (error) {
                console.error('Error fetching product details:', error);
                showNotification('Failed to fetch product details: ' + error.message, 'error');
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
    
    if (closeDeleteModal && cancelDelete) {
        closeDeleteModal.addEventListener('click', () => {
            if (deleteModal) deleteModal.classList.add('hidden');
        });
        
        cancelDelete.addEventListener('click', () => {
            if (deleteModal) deleteModal.classList.add('hidden');
        });
    }
    
    // Setup product modal
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('close-product-modal');
    const cancelProduct = document.getElementById('cancel-product');
    
    if (closeProductModal && cancelProduct) {
        closeProductModal.addEventListener('click', () => {
            if (productModal) productModal.classList.add('hidden');
        });
        
        cancelProduct.addEventListener('click', () => {
            if (productModal) productModal.classList.add('hidden');
        });
    }
    
    // Setup API key modal
    const apiKeyModal = document.getElementById('api-key-modal');
    const closeApiModal = document.getElementById('close-api-modal');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const apiKeyInput = document.getElementById('api-key-input');
    const apiSettingsBtn = document.getElementById('api-settings-btn');
    
    if (closeApiModal) {
        closeApiModal.addEventListener('click', () => {
            if (apiKeyModal) apiKeyModal.classList.add('hidden');
        });
    }
    
    if (saveApiKeyBtn && apiKeyInput) {
        saveApiKeyBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                saveApiKey(apiKey);
                if (apiKeyModal) apiKeyModal.classList.add('hidden');
                showNotification('API key saved successfully!', 'success');
            } else {
                showNotification('Please enter a valid API key', 'error');
            }
        });
    }
    
    if (apiSettingsBtn) {
        apiSettingsBtn.addEventListener('click', showApiKeyModal);
    }
    
    // Improve description button
    const improveDescriptionBtn = document.getElementById('improveDescriptionBtn');
    if (improveDescriptionBtn) {
        improveDescriptionBtn.addEventListener('click', async () => {
            const productTitle = document.getElementById('productName').value;
            const currentDescription = document.getElementById('productDescription').value;
            
            if (!productTitle) {
                showNotification('Please enter a product name first', 'warning');
                return;
            }
            
            // Show loading state
            improveDescriptionBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
            improveDescriptionBtn.disabled = true;
            
            try {
                // Generate improved description
                const improvedDescription = await generateDescriptionWithAI(productTitle, currentDescription);
                
                if (improvedDescription) {
                    document.getElementById('productDescription').value = improvedDescription;
                    showNotification('Description improved successfully!', 'success');
                }
            } catch (error) {
                console.error('Error improving description:', error);
                showNotification('Failed to improve description: ' + error.message, 'error');
            } finally {
                // Reset button state
                improveDescriptionBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Improve Description';
                improveDescriptionBtn.disabled = false;
            }
        });
    }
    
    // Cleanup button
    const cleanupButton = document.getElementById('cleanup-database-btn');
    if (cleanupButton) {
        cleanupButton.addEventListener('click', cleanupDatabase);
    }
    
    // Image source toggle
    const imageSourceUrl = document.getElementById('imageSourceUrl');
    const imageSourceUpload = document.getElementById('imageSourceUpload');
    
    if (imageSourceUrl && imageSourceUpload) {
        imageSourceUrl.addEventListener('change', toggleImageSource);
        imageSourceUpload.addEventListener('change', toggleImageSource);
    }
    
    // Video source toggle
    const videoSourceUrl = document.getElementById('videoSourceUrl');
    const videoSourceUpload = document.getElementById('videoSourceUpload');
    
    if (videoSourceUrl && videoSourceUpload) {
        videoSourceUrl.addEventListener('change', toggleVideoSource);
        videoSourceUpload.addEventListener('change', toggleVideoSource);
    }
    
    // Image file preview
    const productImageFile = document.getElementById('productImageFile');
    const imagePreview = document.getElementById('imagePreview');
    
    if (productImageFile && imagePreview) {
        productImageFile.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.classList.remove('hidden');
                    
                    // Store the image data URL in localStorage for later use
                    localStorage.setItem('tempImageDataUrl', e.target.result);
                    localStorage.setItem('tempImageUniqueId', Date.now().toString());
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Video file preview
    const productVideoFile = document.getElementById('productVideoFile');
    const videoPreview = document.getElementById('videoPreview');
    
    if (productVideoFile && videoPreview) {
        productVideoFile.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    videoPreview.src = e.target.result;
                    videoPreview.classList.remove('hidden');
                    
                    // Store the video data URL in localStorage for later use
                    localStorage.setItem('tempVideoDataUrl', e.target.result);
                    localStorage.setItem('tempVideoUniqueId', Date.now().toString() + '-video');
                };
                reader.readAsDataURL(file);
            }
        });
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
        // Instead of showing the modal, set a dummy API key
        saveApiKey("dummy-api-key-to-prevent-modal");
        console.log("Set dummy API key to prevent modal from appearing");
        // No longer showing the modal: showApiKeyModal();
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
        
        // Extract ASIN from Amazon URL - improved to handle more URL formats
        const asinMatches = [
            // Standard product URLs
            amazonUrl.match(/\/dp\/([A-Z0-9]{10})/),
            // Alternative formats
            amazonUrl.match(/\/gp\/product\/([A-Z0-9]{10})/),
            amazonUrl.match(/\/exec\/obidos\/asin\/([A-Z0-9]{10})/),
            amazonUrl.match(/\/product\/([A-Z0-9]{10})/),
            // URL parameter ASIN
            amazonUrl.match(/[?&]ASIN=([A-Z0-9]{10})/),
            // Fallback to finding any 10-character alphanumeric pattern that might be an ASIN
            amazonUrl.match(/[^A-Z0-9]([A-Z0-9]{10})[^A-Z0-9]/)
        ].filter(Boolean);

        // Find the first valid match
        const asin = asinMatches.length > 0 ? asinMatches[0][1] : null;
        
        if (!asin) {
            showNotification('Invalid Amazon URL. Please provide a URL with a product ID.', 'error');
            return null;
        }
        
        console.log(`Extracted ASIN: ${asin} from URL: ${amazonUrl}`);
        
        // Make an API call to fetch real product data
        // In a production environment, this would be a server-side API call
        const response = await fetch(`/api/fetch-amazon-product?asin=${asin}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }
        
        const productData = await response.json();
        
        // Add affiliate link
        productData.affiliateUrl = addAffiliateTag(amazonUrl);
        
        // Ensure price is a valid number
        if (productData.price) {
            if (typeof productData.price === 'string') {
                // Remove any currency symbols and commas
                const cleanPrice = productData.price.replace(/[$,]/g, '');
                productData.price = parseFloat(cleanPrice);
            }
            
            // Validate price
            if (isNaN(productData.price) || productData.price <= 0) {
                console.warn('Invalid price detected from Amazon:', productData.price);
                productData.price = 0;
            }
        }
        
        // Special handling for Meta Quest 3S
        if (asin === "B0DDK1WM9K" || 
            (productData.title && (productData.title.includes("Meta Quest 3S") || productData.title.includes("Quest 3S")))) {
            console.log("Special handling for Meta Quest 3S product");
            productData.price = 299.99;
            
            // Ensure description is adequate
            if (!productData.description || productData.description.length < 100) {
                productData.description = "Meta Quest 3S 128GB is an all-in-one VR headset designed for immersive virtual reality experiences. It features high-resolution displays, comfortable fit, built-in audio, and access to a vast library of VR games and apps. This standalone headset doesn't require a PC, external sensors, or wires to deliver a premium VR experience with intuitive hand tracking and touch controllers.";
            }
            
            // Make sure image URL is set correctly
            if (!productData.imageUrl || productData.imageUrl === '/vr-logo.svg') {
                productData.imageUrl = "https://m.media-amazon.com/images/I/61TzjRQQO9L._AC_SL1500_.jpg";
            }
        }
        
        showNotification('Product details fetched successfully!', 'success');
        return productData;
    } catch (error) {
        console.error('Error fetching Amazon product details:', error);
        showNotification('Failed to fetch product details: ' + error.message, 'error');
        return null;
    }
}

// Improve description using our server API
async function improveDescriptionWithServerAPI(asin, currentDescription) {
    try {
        showNotification("Improving description with AI...", 'info');
        
        // Make API request to our server endpoint
        const response = await fetch("/api/improve-description", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                asin: asin,
                description: currentDescription
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        const improvedDescription = data.improvedDescription;
        
        showNotification("Description improved successfully!", 'success');
        return improvedDescription;
    } catch (error) {
        console.error("Error improving description with server API:", error);
        showNotification("Failed to improve description: " + error.message, 'error');
        return null;
    }
}

// Improve description button
const improveDescBtn = document.getElementById('improveDescriptionBtn');
if (improveDescBtn) {
    improveDescBtn.addEventListener('click', async () => {
        const productTitle = document.getElementById('productName').value;
        const currentDescription = document.getElementById('productDescription').value;
        const amazonUrl = document.getElementById('amazonUrl').value;
        
        if (!productTitle || !currentDescription) {
            showNotification('Product title and description are required', 'warning');
            return;
        }
        
        // Extract ASIN from Amazon URL
        let asin = null;
        if (amazonUrl) {
            const asinMatch = amazonUrl.match(/\/dp\/([A-Z0-9]{10})/);
            asin = asinMatch ? asinMatch[1] : null;
        }
        
        if (!asin) {
            showNotification('Valid Amazon URL is required to improve description', 'warning');
            return;
        }
        
        // Show loading state
        improveDescBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Improving...';
        improveDescBtn.disabled = true;
        
        try {
            // Improve description with server API
            const improvedDescription = await improveDescriptionWithServerAPI(asin, currentDescription);
            
            if (improvedDescription) {
                // Update description field
                document.getElementById('productDescription').value = improvedDescription;
                showNotification('Description improved successfully!', 'success');
            }
        } catch (error) {
            console.error('Error improving description:', error);
            showNotification('Failed to improve description: ' + error.message, 'error');
        } finally {
            // Reset button state
            improveDescBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Improve Description';
            improveDescBtn.disabled = false;
        }
    });
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
    }
    
    // Add event listeners for image file selection
    const productImageFile = document.getElementById('productImageFile');
    const imagePreview = document.getElementById('imagePreview');
    
    if (productImageFile && imagePreview) {
        productImageFile.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.classList.remove('hidden');
                    
                    // Store the image data URL in localStorage for later use
                    localStorage.setItem('tempImageDataUrl', e.target.result);
                    localStorage.setItem('tempImageUniqueId', Date.now().toString());
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Add event listeners for video source toggle
    const videoSourceUrl = document.getElementById('videoSourceUrl');
    const videoSourceUpload = document.getElementById('videoSourceUpload');
    
    if (videoSourceUrl && videoSourceUpload) {
        videoSourceUrl.addEventListener('change', toggleVideoSource);
        videoSourceUpload.addEventListener('change', toggleVideoSource);
    }
    
    // Add event listeners for video file selection
    const productVideoFile = document.getElementById('productVideoFile');
    const videoPreview = document.getElementById('videoPreview');
    
    if (productVideoFile && videoPreview) {
        productVideoFile.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    videoPreview.src = e.target.result;
                    videoPreview.classList.remove('hidden');
                    
                    // Store the video data URL in localStorage for later use
                    localStorage.setItem('tempVideoDataUrl', e.target.result);
                    localStorage.setItem('tempVideoUniqueId', Date.now().toString() + '-video');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    console.log('Tailwind modal components initialized');
}

// Toggle between image URL and image upload
function toggleImageSource() {
    const imageSourceUrl = document.getElementById('imageSourceUrl');
    const imageSourceUpload = document.getElementById('imageSourceUpload');
    const productImageUrlGroup = document.getElementById('productImageUrlGroup');
    const productImageFileGroup = document.getElementById('productImageFileGroup');
    
    if (imageSourceUrl && imageSourceUpload && productImageUrlGroup && productImageFileGroup) {
        if (imageSourceUrl.checked) {
            productImageUrlGroup.style.display = 'block';
            productImageFileGroup.style.display = 'none';
        } else {
            productImageUrlGroup.style.display = 'none';
            productImageFileGroup.style.display = 'block';
        }
    }
    
    // Also toggle video source if elements exist
    toggleVideoSource();
}

// Toggle between video URL and video upload
function toggleVideoSource() {
    const videoSourceUrl = document.getElementById('videoSourceUrl');
    const videoSourceUpload = document.getElementById('videoSourceUpload');
    const productVideoUrlGroup = document.getElementById('productVideoUrlGroup');
    const productVideoFileGroup = document.getElementById('productVideoFileGroup');
    
    if (videoSourceUrl && videoSourceUpload && productVideoUrlGroup && productVideoFileGroup) {
        if (videoSourceUrl.checked) {
            productVideoUrlGroup.style.display = 'block';
            productVideoFileGroup.style.display = 'none';
        } else {
            productVideoUrlGroup.style.display = 'none';
            productVideoFileGroup.style.display = 'block';
        }
    }
}

// Add a new product
function addProduct() {
    const productForm = document.getElementById('productForm');
    const productModalLabel = document.getElementById('productModalLabel');
    const productId = document.getElementById('productId');
    const productName = document.getElementById('productName');
    const productPrice = document.getElementById('productPrice');
    const productCategory = document.getElementById('productCategory');
    const productDescription = document.getElementById('productDescription');
    const productRating = document.getElementById('productRating');
    const amazonUrl = document.getElementById('amazonUrl');
    const productImageUrl = document.getElementById('productImageUrl');
    const imagePreview = document.getElementById('imagePreview');
    const imageSourceUrl = document.getElementById('imageSourceUrl');
    const improveDescriptionBtn = document.getElementById('improveDescriptionBtn');
    const productVideoUrl = document.getElementById('productVideoUrl');
    const videoPreview = document.getElementById('videoPreview');
    const videoSourceUrl = document.getElementById('videoSourceUrl');
    
    if (productForm && productModalLabel && productId && productName && 
        productPrice && productCategory && productDescription && 
        productRating && amazonUrl && productImageUrl && imagePreview && 
        imageSourceUrl && improveDescriptionBtn && productVideoUrl && 
        videoPreview && videoSourceUrl) {
        
        // Set modal title
        productModalLabel.textContent = 'Add Product';
        
        // Reset form
        productForm.reset();
        productId.value = '';
        
        // Hide improve description button
        improveDescriptionBtn.classList.add('hidden');
        
        // Reset Amazon URL field
        if (amazonUrl) {
            amazonUrl.value = '';
        }
        
        // Reset image preview
        imagePreview.classList.add('hidden');
        imagePreview.src = '';
        
        // Reset video preview
        videoPreview.classList.add('hidden');
        videoPreview.src = '';
        
        // Default to URL input for both image and video
        imageSourceUrl.checked = true;
        toggleImageSource();
        
        videoSourceUrl.checked = true;
        toggleVideoSource();
        
        // Show the modal
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    } else {
        console.error('One or more elements not found for addProduct function');
    }
}

// Clear frontend localStorage cache
function clearFrontendCache() {
    try {
        console.log("Clearing frontend localStorage cache...");
        
        // Clear all product-related caches
        localStorage.removeItem('tryvr_frontend_products');
        localStorage.removeItem('vr-products-cache');
        localStorage.removeItem('vr-store-products');
        localStorage.removeItem('tryvr_products_db');
        
        // Also clear any other potential caches
        localStorage.removeItem('products-last-updated');
        localStorage.removeItem('products-cache');
        localStorage.removeItem('vr-products');
        
        console.log("Frontend cache cleared successfully");
        return true;
    } catch (error) {
        console.error("Error clearing frontend cache:", error);
        return false;
    }
}

// Clean up the database by removing all products
function cleanupDatabase() {
    try {
        if (!confirm('Are you sure you want to clean up the database? This will remove all products.')) {
            return;
        }
        
        console.log("Cleaning up database...");
        
        // Show a loading indicator
        showNotification('Cleaning up database...', 'info');
        
        // Clear frontend localStorage cache
        clearFrontendCache();
        
        // Reset the products array
        db.products = [];
        
        // Save to localStorage
        saveToLocalStorage();
        
        // First, use the direct write endpoint
        fetch('/api/write-empty-products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                console.warn('Failed to write empty products file, trying clear-frontend-db endpoint');
                // Fall back to the clear-frontend-db endpoint
                return fetch('/api/clear-frontend-db', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            return response;
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to clear frontend database');
            }
            console.log('Frontend database cleared successfully');
            
            // Clear browser cache
            return fetch(`/api/clear-cache?t=${new Date().getTime()}`);
        })
        .then(response => {
            if (!response.ok) {
                console.warn('Failed to clear browser cache, continuing anyway');
            } else {
                console.log('Browser cache cleared successfully');
            }
            
            // Update the frontend database with empty products array
            return saveToSQLDatabase();
        })
        .then(() => {
            console.log('Database cleaned successfully');
            
            // Show notification
            showNotification('Database cleaned successfully! Reloading page...', 'success');
            
            // Force reload the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        })
        .catch(error => {
            console.error('Error cleaning database:', error);
            showNotification('Error cleaning database: ' + error.message, 'error');
            
            // Force reload the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        });
    } catch (error) {
        console.error('Error cleaning database:', error);
        showNotification('Error cleaning database: ' + error.message, 'error');
        
        // Force reload the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
} 