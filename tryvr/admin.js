// Initialize SQLite database
let db;
const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let totalPages = 1;
let productsPerPage = 10;
let productToDelete = null;
// Define a consistent storage key
const DB_STORAGE_KEY = 'tryvr_products_db';

// Check authentication and initialize database
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    if (localStorage.getItem('tryvr_admin_auth') !== 'true') {
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
            const uint8Array = new Uint8Array(JSON.parse(savedDb));
            db = new SQL.Database(uint8Array);
        } else {
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
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        }

        // Load products after database is initialized
        loadProducts();
        setupEventListeners();
        
    } catch (error) {
        console.error('Failed to initialize database:', error);
        alert('Failed to initialize the database. Please try refreshing the page.');
    }
});

// Get database instance
function getDatabase() {
    try {
        // Get database from localStorage
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

// Save database to localStorage
function saveDatabase() {
    try {
        const db = getDatabase();
        if (!db) {
            throw new Error('Database not found');
        }
        
        // Export database to Uint8Array
        const data = db.export();
        const buffer = new Uint8Array(data);
        
        // Convert Uint8Array to base64
        const base64 = btoa(String.fromCharCode.apply(null, buffer));
        
        // Save to localStorage using the consistent storage key
        localStorage.setItem(DB_STORAGE_KEY, base64);
    } catch (error) {
        console.error('Error saving database:', error);
        showNotification('Error saving database: ' + error.message, 'error');
    }
}

// Load products from database
function loadProducts(page = 1, category = 'all', searchTerm = '') {
    try {
        const db = getDatabase();
        if (!db) {
            throw new Error('Database not found');
        }
        
        // Set current page
        currentPage = page;
        
        // Build query
        let query = 'SELECT * FROM products';
        const queryParams = [];
        
        // Add category filter
        if (category !== 'all') {
            query += ' WHERE category = ?';
            queryParams.push(category);
        }
        
        // Add search filter
        if (searchTerm) {
            query += category !== 'all' ? ' AND' : ' WHERE';
            query += ' (title LIKE ? OR description LIKE ?)';
            queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }
        
        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as count FROM products';
        if (category !== 'all' || searchTerm) {
            countQuery += ' WHERE ';
            const conditions = [];
            if (category !== 'all') {
                conditions.push('category = ?');
            }
            if (searchTerm) {
                conditions.push('(title LIKE ? OR description LIKE ?)');
            }
            countQuery += conditions.join(' AND ');
        }
        
        const countResult = db.exec(countQuery, queryParams);
        const totalProducts = countResult[0]?.values[0]?.[0] || 0;
        totalPages = Math.ceil(totalProducts / productsPerPage);
        
        // Add pagination
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(productsPerPage, (page - 1) * productsPerPage);
        
        // Execute query
        const result = db.exec(query, queryParams);
        
        // Display products
        displayProducts(result);
        
        // Update pagination UI
        updatePagination();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products: ' + error.message, 'error');
    }
}

// Save database to localStorage after any changes
function saveToLocalStorage() {
    try {
        const data = db.export();
        const array = Array.from(data);
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(array));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Validate admin login
function validateLogin(username, password) {
    try {
        // Check if username and password are correct
        if (username === 'admin' && password === 'password') {
            // Set admin authentication in localStorage
            localStorage.setItem('adminAuthenticated', 'true');
            
            // Redirect to admin dashboard
            window.location.href = 'admin-dashboard.html';
            return true;
        } else {
            showNotification('Invalid username or password', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error validating login:', error);
        showNotification('Error during login: ' + error.message, 'error');
        return false;
    }
}

// Add login form handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (validateLogin(username, password)) {
                window.location.href = 'admin-dashboard.html';
            } else {
                alert('Invalid username or password');
            }
        });
    }
});

// Setup event listeners
function setupEventListeners() {
    // Logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('adminAuthenticated');
            window.location.href = 'admin-login.html';
        });
    }
    
    // Sidebar navigation
    const manageProductsLink = document.getElementById('manage-products-link');
    if (manageProductsLink) {
        manageProductsLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById('products-section').classList.remove('hidden');
            loadProducts();
        });
    }
    
    // Filter changes
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            currentPage = 1;
            loadProducts(currentPage, categoryFilter.value, document.getElementById('search-input')?.value || '');
        });
    }
    
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            currentPage = 1;
            loadProducts(currentPage, document.getElementById('category-filter')?.value || 'all', searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentPage = 1;
                loadProducts(currentPage, document.getElementById('category-filter')?.value || 'all', searchInput.value);
            }
        });
    }
    
    // Add product button
    const addProductButton = document.getElementById('add-product-button');
    if (addProductButton) {
        addProductButton.addEventListener('click', () => {
            // Reset form
            document.getElementById('product-form').reset();
            document.getElementById('product-id').value = '';
            
            // Update modal title
            document.getElementById('product-modal-title').textContent = 'Add New VR Product';
            
            // Show modal
            document.getElementById('product-modal').classList.remove('hidden');
        });
    }
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.add('hidden');
            });
        });
    });
    
    // Cancel product button
    const cancelProductButton = document.getElementById('cancel-product-button');
    if (cancelProductButton) {
        cancelProductButton.addEventListener('click', () => {
            document.getElementById('product-modal').classList.add('hidden');
        });
    }
    
    // Product form submission
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const productData = {
                id: document.getElementById('product-id').value || null,
                title: document.getElementById('product-title').value,
                amazonUrl: document.getElementById('amazon-url').value,
                rating: parseFloat(document.getElementById('product-rating').value),
                category: document.getElementById('product-category').value,
                imageUrl: document.getElementById('product-image').value,
                price: parseFloat(document.getElementById('product-price').value),
                description: document.getElementById('product-description').value
            };
            
            // Save product
            saveProduct(productData);
        });
    }
    
    // Delete confirmation
    const confirmDeleteButton = document.getElementById('confirm-delete-button');
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', () => {
            if (productToDelete) {
                deleteProduct(productToDelete);
            }
        });
    }
    
    const cancelDeleteButton = document.getElementById('cancel-delete-button');
    if (cancelDeleteButton) {
        cancelDeleteButton.addEventListener('click', () => {
            document.getElementById('delete-confirmation-modal').classList.add('hidden');
            productToDelete = null;
        });
    }
    
    // Export database
    const exportDbButton = document.getElementById('export-db-button');
    if (exportDbButton) {
        exportDbButton.addEventListener('click', () => {
            try {
                const dbData = localStorage.getItem(DB_STORAGE_KEY);
                if (!dbData) {
                    throw new Error('No database found');
                }
                
                // Create download link
                const blob = new Blob([dbData], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'vrproducts_' + new Date().toISOString().split('T')[0] + '.db';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification('Database exported successfully', 'success');
            } catch (error) {
                console.error('Error exporting database:', error);
                showNotification('Error exporting database: ' + error.message, 'error');
            }
        });
    }
    
    // Import database
    const importDbButton = document.getElementById('import-db-button');
    const importDbInput = document.getElementById('import-db-input');
    if (importDbButton && importDbInput) {
        importDbButton.addEventListener('click', () => {
            importDbInput.click();
        });
        
        importDbInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const dbData = event.target.result;
                    localStorage.setItem(DB_STORAGE_KEY, dbData);
                    loadProducts();
                    showNotification('Database imported successfully', 'success');
                } catch (error) {
                    console.error('Error importing database:', error);
                    showNotification('Error importing database: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        });
    }
}

// Display products in the admin table
function displayProducts(result) {
    const productsTable = document.getElementById('products-table');
    const productsBody = document.getElementById('products-body');
    
    if (!productsTable || !productsBody) {
        console.error('Products table elements not found');
        return;
    }
    
    // Clear table completely to prevent UI issues
    productsBody.innerHTML = '';
    
    // Check if there are products
    if (!result || !result[0] || !result[0].values || result[0].values.length === 0) {
        // No products found
        const noProductsRow = document.createElement('tr');
        noProductsRow.innerHTML = `
            <td colspan="6" class="px-4 py-2 text-center text-gray-500">
                No products found. Add some products to get started.
            </td>
        `;
        productsBody.appendChild(noProductsRow);
        return;
    }
    
    // Get column names
    const columns = result[0].columns;
    
    // Create a document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Add products to table
    result[0].values.forEach(product => {
        const row = document.createElement('tr');
        row.classList.add('border-b', 'hover:bg-gray-50', 'transition-colors');
        
        // Map values to column names
        const productObj = {};
        columns.forEach((col, index) => {
            productObj[col] = product[index];
        });
        
        // Create row content
        row.innerHTML = `
            <td class="px-4 py-2">${productObj.id}</td>
            <td class="px-4 py-2">
                <div class="flex items-center">
                    <img src="${productObj.image_url}" alt="${productObj.title}" class="w-10 h-10 object-cover mr-2"
                         onerror="this.onerror=null; this.src='vr-logo.svg'; this.classList.add('bg-gray-200', 'p-1', 'rounded');">
                    <span class="font-medium">${productObj.title}</span>
                </div>
            </td>
            <td class="px-4 py-2">$${parseFloat(productObj.price).toFixed(2)}</td>
            <td class="px-4 py-2">${productObj.category}</td>
            <td class="px-4 py-2">${productObj.rating} ★</td>
            <td class="px-4 py-2">
                <div class="flex space-x-2">
                    <button class="edit-product-btn bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" data-id="${productObj.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-product-btn bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-id="${productObj.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        
        // Add to fragment instead of directly to DOM
        fragment.appendChild(row);
    });
    
    // Append all rows at once
    productsBody.appendChild(fragment);
    
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
}

// Update pagination controls
function updatePagination() {
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) return;
    
    // Clear pagination
    paginationElement.innerHTML = '';
    
    // Add previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&laquo; Previous';
    prevButton.classList.add('px-3', 'py-1', 'bg-gray-200', 'rounded', 'mr-2');
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            loadProducts(currentPage - 1);
        }
    });
    paginationElement.appendChild(prevButton);
    
    // Add page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('px-3', 'py-1', 'rounded', 'mx-1');
        
        if (i === currentPage) {
            pageButton.classList.add('bg-blue-500', 'text-white');
        } else {
            pageButton.classList.add('bg-gray-200');
            pageButton.addEventListener('click', () => {
                loadProducts(i);
            });
        }
        
        paginationElement.appendChild(pageButton);
    }
    
    // Add next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = 'Next &raquo;';
    nextButton.classList.add('px-3', 'py-1', 'bg-gray-200', 'rounded', 'ml-2');
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadProducts(currentPage + 1);
        }
    });
    paginationElement.appendChild(nextButton);
}

// Edit a product
function editProduct(productId) {
    try {
        // Get product data from database
        const result = db.exec(`SELECT * FROM products WHERE id = ${productId}`);
        
        if (result.length > 0 && result[0].values.length > 0) {
            const product = result[0].values[0];
            const [id, title, amazonUrl, affiliateUrl, rating, category, imageUrl, price, description] = product;
            
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

// Delete a product
function deleteProduct(productId) {
    try {
        const db = getDatabase();
        
        // Get product title before deletion for the notification
        const product = db.exec(`SELECT title FROM products WHERE id = ${productId}`);
        let productTitle = "Product";
        if (product && product[0] && product[0].values && product[0].values[0]) {
            productTitle = product[0].values[0][0];
        }
        
        // Delete the product
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        stmt.run(productId);
        
        // Save changes to localStorage
        saveDatabase();
        
        // Reload product list
        loadProducts();
        
        // Hide confirmation modal
        document.getElementById('delete-confirmation-modal').classList.add('hidden');
        
        // Reset productToDelete
        productToDelete = null;
        
        // Show success message
        showNotification(`Product "${productTitle}" deleted successfully!`, 'success');
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product: ' + error.message, 'error');
    }
}

// Save product to database
function saveProduct(productData) {
    try {
        const db = getDatabase();
        
        // Check if product already exists (edit mode)
        if (productData.id) {
            // Update existing product
            const stmt = db.prepare(`
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
            // Add new product
            const stmt = db.prepare(`
                INSERT INTO products (title, amazon_url, rating, category, image_url, price, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
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
        
        // Save changes to localStorage
        saveToLocalStorage();
        
        // Reload product list
        loadProducts();
        
        // Hide modal
        document.getElementById('product-modal').classList.add('hidden');
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error saving product: ' + error.message, 'error');
    }
}

// Add affiliate tag to Amazon URL
function addAffiliateTag(url) {
    try {
        if (!url) return url;
        
        // Parse URL
        const parsedUrl = new URL(url);
        
        // Remove existing tag if present
        let search = parsedUrl.search;
        if (search) {
            const params = new URLSearchParams(search);
            params.delete('tag');
            parsedUrl.search = params.toString();
        }
        
        // Add our affiliate tag
        const params = new URLSearchParams(parsedUrl.search);
        params.append('tag', 'tryvr-20');
        parsedUrl.search = params.toString();
        
        return parsedUrl.toString();
    } catch (error) {
        console.error('Error adding affiliate tag:', error);
        showNotification('Error processing Amazon URL', 'error');
        return url;
    }
}

// Show delete confirmation modal
function showDeleteConfirmation(productId) {
    productToDelete = productId;
    const deleteModal = document.getElementById('delete-confirmation-modal');
    if (deleteModal) {
        deleteModal.classList.remove('hidden');
    } else {
        console.error('Delete confirmation modal not found');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('status-notification');
    const messageElement = document.getElementById('status-message');
    
    if (!notification || !messageElement) {
        console.error('Notification elements not found');
        return;
    }
    
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
    notification.classList.add('notification-enter');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('notification-enter');
        notification.classList.add('notification-exit');
        
        setTimeout(() => {
            notification.classList.remove('notification-exit');
            notification.classList.add('translate-y-20', 'opacity-0');
        }, 300);
    }, 3000);
} 