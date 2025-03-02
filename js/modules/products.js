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
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    
    // Update product count display
    document.getElementById('product-count').textContent = `${totalProducts} products`;
    
    // Update pagination controls
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages || 1}`;
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages || totalPages === 0;
    
    return totalPages;
}

export {
    displayProducts,
    getCategoryLabel,
    getCategoryIcon,
    generateStarRating,
    updatePagination
}; 