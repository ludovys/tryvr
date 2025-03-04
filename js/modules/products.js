// Products Module - Handles product display and related functionality

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

// Display products in the UI
function displayProducts(products, openProductDetailModal, openVideoModal) {
    const container = document.getElementById('products-container');
    if (!container) {
        console.error('Products container not found');
        return;
    }
    
    container.innerHTML = '';
    
    // Handle null or undefined products
    if (!products || !Array.isArray(products) || products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-400 text-lg">No VR products found. Contact the administrator to add products.</p>
                <i class="fas fa-vr-cardboard text-6xl text-gray-500 mt-4"></i>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        try {
            // Handle both array and object formats
            let id, title, amazonUrl, affiliateUrl, rating, category, imageUrl, price, description, videoUrl;
            
            if (Array.isArray(product)) {
                [id, title, amazonUrl, affiliateUrl, rating, category, imageUrl, price, description, videoUrl] = product;
            } else {
                id = product.id || 0;
                title = product.title || product.name || 'Unnamed Product';
                amazonUrl = product.amazonUrl || product.amazon_url || '';
                affiliateUrl = product.affiliateUrl || product.affiliate_url || '';
                rating = parseFloat(product.rating) || 0;
                category = product.category || 'accessories';
                imageUrl = product.imageUrl || product.image_url || product.image || '/vr-logo.svg';
                price = parseFloat(product.price) || 0;
                description = product.description || '';
                videoUrl = product.videoUrl || product.video_url || null;
            }
            
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
                    <img src="${imageUrl}" alt="${title}" class="w-full h-48 object-cover" onerror="this.src='/vr-logo.svg'">
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
        } catch (error) {
            console.error('Error displaying product:', error, product);
        }
    });
}

// Generate star rating HTML
function generateStarRating(rating) {
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
    
    return starsHtml;
}

// Update pagination UI
function updatePagination(currentPage, totalProducts, itemsPerPage) {
    try {
        const totalPages = Math.ceil(totalProducts / itemsPerPage) || 1;
        
        // Update product count display
        const productCount = document.getElementById('product-count');
        if (productCount) {
            productCount.textContent = `${totalProducts} product${totalProducts !== 1 ? 's' : ''}`;
        }
        
        // Update pagination controls
        const pageInfo = document.getElementById('page-info');
        if (pageInfo) {
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        }
        
        const prevPage = document.getElementById('prev-page');
        if (prevPage) {
            prevPage.disabled = currentPage <= 1;
            prevPage.classList.toggle('opacity-50', currentPage <= 1);
        }
        
        const nextPage = document.getElementById('next-page');
        if (nextPage) {
            nextPage.disabled = currentPage >= totalPages || totalPages === 0;
            nextPage.classList.toggle('opacity-50', currentPage >= totalPages || totalPages === 0);
        }
        
        return totalPages;
    } catch (error) {
        console.error('Error updating pagination:', error);
        return 1; // Default to 1 page on error
    }
}

export {
    displayProducts,
    getCategoryLabel,
    getCategoryIcon,
    generateStarRating,
    updatePagination
}; 