// Main Application File

import { initDatabase, getProducts, saveDatabase, reloadDatabase, forceReloadProducts } from './modules/database.js';
import { displayProducts, updatePagination } from './modules/products.js';
import { openProductDetailModal, openVideoModal, setupModalEventListeners } from './modules/modals.js';
import { showNotification } from './modules/utils.js';

// Constants
const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let totalProducts = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initApp()
        .then(() => {
            setupModalEventListeners();
        })
        .catch(error => {
            console.error('Failed to initialize the application:', error);
            alert('Failed to initialize the application. Please check the console for details.');
        });
});

// Initialize the app
async function initApp() {
    try {
        // Initialize database
        await initDatabase();
        
        // Force reload products from server to bypass cache
        await forceReloadProducts();
        
        // Load products
        const result = await getProducts();
        const products = result && result.products ? result.products : [];
        
        // Display products
        displayProducts(products, openProductDetailModal, openVideoModal);
        
        // Setup event listeners
        setupEventListeners();
        
        // Hide loading spinner if it exists
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        
        // Hide loading spinner if it exists
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }
        
        // Show error message if it exists
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.classList.remove('hidden');
        } else {
            console.error('Error message element not found');
        }
    }
}

// Load products from the database
function loadProducts() {
    try {
        const categoryFilter = document.getElementById('category')?.value || 'all';
        const ratingFilter = parseFloat(document.getElementById('min-rating')?.value || '0');
        
        console.log(`Loading products with filters: category=${categoryFilter}, rating=${ratingFilter}`);
        
        const result = getProducts(categoryFilter, ratingFilter, currentPage, ITEMS_PER_PAGE);
        const products = result && result.products ? result.products : [];
        totalProducts = result && typeof result.totalProducts === 'number' ? result.totalProducts : 0;
        
        console.log(`Found ${products.length} products (total: ${totalProducts})`);
        
        // Update product count display
        const productCount = document.getElementById('product-count');
        if (productCount) {
            productCount.textContent = `${totalProducts} product${totalProducts !== 1 ? 's' : ''}`;
        }
        
        // Update pagination UI
        const totalPages = updatePagination(currentPage, totalProducts, ITEMS_PER_PAGE);
        
        // If current page is beyond total pages, reset to last page
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
            loadProducts();
            return;
        }
        
        // Display products
        displayProducts(products, openProductDetailModal, openVideoModal);
    } catch (error) {
        console.error('Error loading products:', error);
        // Show an error message to the user
        const container = document.getElementById('products-container');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-500 text-lg">Error loading products. Please try refreshing the page.</p>
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mt-4"></i>
                </div>
            `;
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    try {
        // Category filter change
        const categoryFilter = document.getElementById('category');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                currentPage = 1;
                loadProducts();
            });
        }
        
        // Rating filter change
        const ratingFilter = document.getElementById('min-rating');
        if (ratingFilter) {
            ratingFilter.addEventListener('change', () => {
                currentPage = 1;
                loadProducts();
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                try {
                    // Reload database from localStorage to get the latest products
                    const success = await reloadDatabase();
                    
                    // Now load products from the refreshed database
                    loadProducts();
                    
                    if (success) {
                        showNotification('Products refreshed from latest data');
                    } else {
                        showNotification('No saved data found to refresh', 'error');
                    }
                } catch (error) {
                    console.error('Error refreshing products:', error);
                    showNotification('Error refreshing products', 'error');
                }
            });
        }
        
        // Pagination controls
        const prevPage = document.getElementById('prev-page');
        if (prevPage) {
            prevPage.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    loadProducts();
                }
            });
        }
        
        const nextPage = document.getElementById('next-page');
        if (nextPage) {
            nextPage.addEventListener('click', () => {
                const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
                if (currentPage < totalPages) {
                    currentPage++;
                    loadProducts();
                }
            });
        }
        
        // Product container click event delegation
        const productsContainer = document.getElementById('products-container');
        if (productsContainer) {
            productsContainer.addEventListener('click', (event) => {
                // Handle video play button clicks
                const videoPlayButton = event.target.closest('.video-play-button');
                if (videoPlayButton) {
                    event.stopPropagation(); // Prevent product card click
                    const videoUrl = videoPlayButton.dataset.videoUrl;
                    if (videoUrl && videoUrl.toLowerCase().endsWith('.mp4') && typeof openVideoModal === 'function') {
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
                if (productCard && typeof openProductDetailModal === 'function') {
                    openProductDetailModal(productCard);
                }
            });
        }
        
        // Save database to localStorage before unloading the page
        window.addEventListener('beforeunload', saveDatabase);
        
        console.log('Event listeners set up successfully');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
} 