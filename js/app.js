// Main Application File

import { initDatabase, getProducts, saveDatabase, reloadDatabase } from './modules/database.js';
import { displayProducts, updatePagination } from './modules/products.js';
import { openProductDetailModal, openVideoModal, setupModalEventListeners } from './modules/modals.js';
import { showNotification } from './modules/utils.js';

// Constants
const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let totalProducts = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initDatabase()
        .then(() => {
            loadProducts();
            setupEventListeners();
            setupModalEventListeners();
        })
        .catch(error => {
            console.error('Failed to initialize the application:', error);
            alert('Failed to initialize the application. Please check the console for details.');
        });
});

// Load products from the database
function loadProducts() {
    const categoryFilter = document.getElementById('category').value;
    const ratingFilter = parseFloat(document.getElementById('min-rating').value);
    
    const { products, totalProducts: total } = getProducts(categoryFilter, ratingFilter, currentPage, ITEMS_PER_PAGE);
    totalProducts = total;
    
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
        const success = await reloadDatabase();
        
        // Now load products from the refreshed database
        loadProducts();
        
        if (success) {
            showNotification('Products refreshed from latest data');
        } else {
            showNotification('No saved data found to refresh', 'error');
        }
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
    
    // Product container click event delegation
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
    
    // Save database to localStorage before unloading the page
    window.addEventListener('beforeunload', saveDatabase);
} 