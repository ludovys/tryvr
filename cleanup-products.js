/**
 * Product Database Cleanup Script
 * 
 * This script helps clean up any stuck or orphaned products in the database.
 * It clears all caches and ensures the frontend_products.json file is properly updated.
 */

const fs = require('fs');
const path = require('path');

// Clear frontend_products.json
function clearFrontendDatabase() {
    try {
        console.log('Clearing frontend_products.json...');
        
        // Write an empty array to the file
        fs.writeFileSync('frontend_products.json', '[]');
        
        // Verify the file was written correctly
        const data = fs.readFileSync('frontend_products.json', 'utf8');
        if (data !== '[]') {
            console.error('Failed to clear frontend database: File content is not an empty array');
            return false;
        }
        
        console.log('Frontend database cleared successfully!');
        return true;
    } catch (error) {
        console.error('Error clearing frontend database:', error);
        return false;
    }
}

// Check if frontend_products.json exists
function checkFrontendDatabase() {
    try {
        console.log('Checking frontend_products.json...');
        if (fs.existsSync('frontend_products.json')) {
            const data = fs.readFileSync('frontend_products.json', 'utf8');
            const products = JSON.parse(data);
            console.log(`Frontend database contains ${products.length} products.`);
            return products.length;
        } else {
            console.log('Frontend database does not exist.');
            return 0;
        }
    } catch (error) {
        console.error('Error checking frontend database:', error);
        return -1;
    }
}

// Main cleanup function
function cleanupProducts() {
    console.log('Starting product database cleanup...');
    
    // Clear frontend database
    clearFrontendDatabase();
    
    // Check if cleanup was successful
    const productCount = checkFrontendDatabase();
    if (productCount === 0) {
        console.log('Cleanup successful! All products have been removed from the frontend database.');
    } else {
        console.error('Cleanup failed! Frontend database still contains products.');
    }
    
    console.log('\nTo complete the cleanup:');
    console.log('1. Start the server: node server.js');
    console.log('2. Open the admin dashboard in your browser');
    console.log('3. Clear your browser cache (Ctrl+Shift+Delete)');
    console.log('4. Refresh the page');
}

// Run the cleanup
cleanupProducts(); 