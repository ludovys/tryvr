// Modals Module - Handles product detail and video modals

import { getCategoryIcon, getCategoryLabel, generateStarRating } from './products.js';

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
    const starsHtml = generateStarRating(rating);
    
    document.getElementById('modal-product-rating').innerHTML = starsHtml;
    document.getElementById('modal-product-rating-value').textContent = parseFloat(rating).toFixed(1);
    
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

// Setup modal event listeners
function setupModalEventListeners() {
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
}

export {
    openProductDetailModal,
    closeProductDetailModal,
    openVideoModal,
    closeVideoModal,
    setupModalEventListeners
}; 