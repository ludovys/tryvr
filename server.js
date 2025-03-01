// Simple HTTP server for local development
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wasm': 'application/wasm'
};

// Create the server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Handle API endpoints
    if (pathname === '/api/scrape-amazon' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { amazonUrl } = JSON.parse(body);
                
                if (!amazonUrl) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Amazon URL is required' }));
                    return;
                }
                
                // Extract ASIN from Amazon URL
                const asinMatch = amazonUrl.match(/\/dp\/([A-Z0-9]{10})/);
                const asin = asinMatch ? asinMatch[1] : null;
                
                if (!asin) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid Amazon URL. Please provide a URL with a product ID.' }));
                    return;
                }
                
                // Scrape Amazon product page
                scrapeAmazonProduct(amazonUrl, (error, productData) => {
                    if (error) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: error.message }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(productData));
                    }
                });
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request body' }));
            }
        });
        
        return;
    }
    
    // Get the file path
    let filePath = '.' + parsedUrl.pathname;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Get the file extension
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // Read the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                fs.readFile('./index.html', (err, content) => {
                    if (err) {
                        // Can't even serve index.html
                        res.writeHead(500);
                        res.end('Error loading index.html');
                    } else {
                        // Serve index.html instead (for SPA routing)
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Function to scrape Amazon product page
function scrapeAmazonProduct(amazonUrl, callback) {
    // Set up the request options with headers to mimic a browser
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        }
    };
    
    // Make the request to Amazon
    https.get(amazonUrl, options, (response) => {
        let data = '';
        
        // Handle redirects (Amazon often redirects)
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            scrapeAmazonProduct(response.headers.location, callback);
            return;
        }
        
        // A chunk of data has been received
        response.on('data', (chunk) => {
            data += chunk;
        });
        
        // The whole response has been received
        response.on('end', () => {
            try {
                // Extract product information from the HTML
                const productData = extractProductData(data, amazonUrl);
                callback(null, productData);
            } catch (error) {
                callback(error, null);
            }
        });
    }).on('error', (error) => {
        callback(error, null);
    });
}

// Function to extract product data from HTML
function extractProductData(html, amazonUrl) {
    // Extract title
    const titleMatch = html.match(/<span id="productTitle"[^>]*>([^<]+)<\/span>/);
    const title = titleMatch ? titleMatch[1].trim() : 'Unknown Product';
    
    // Extract price
    let price = 0;
    const priceMatch = html.match(/id="priceblock_ourprice"[^>]*>([^<]+)</) || 
                      html.match(/id="priceblock_dealprice"[^>]*>([^<]+)</) ||
                      html.match(/class="a-offscreen">([^<]+)<\/span>/);
    
    if (priceMatch) {
        const priceText = priceMatch[1].trim();
        // Remove currency symbol and convert to number
        price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }
    
    // Extract rating
    let rating = 0;
    const ratingMatch = html.match(/id="acrPopover"[^>]*title="([^"]+)"/);
    if (ratingMatch) {
        const ratingText = ratingMatch[1];
        const ratingNumberMatch = ratingText.match(/([0-9.]+)/);
        if (ratingNumberMatch) {
            rating = parseFloat(ratingNumberMatch[1]);
        }
    }
    
    // Extract image URL
    let imageUrl = '';
    const imageMatch = html.match(/id="landingImage"[^>]*data-old-hires="([^"]+)"/) ||
                      html.match(/id="landingImage"[^>]*src="([^"]+)"/) ||
                      html.match(/id="imgBlkFront"[^>]*src="([^"]+)"/);
    
    if (imageMatch) {
        imageUrl = imageMatch[1].trim();
    }
    
    // Extract description
    let description = '';
    const descriptionMatch = html.match(/<div id="productDescription"[^>]*>[\s\S]*?<p>([^<]+)<\/p>/) ||
                            html.match(/<div id="feature-bullets"[^>]*>[\s\S]*?<ul>([\s\S]*?)<\/ul>/);
    
    if (descriptionMatch) {
        if (descriptionMatch[1].includes('<li>')) {
            // Handle bullet points
            const bulletPoints = [];
            const bulletMatches = descriptionMatch[1].matchAll(/<li[^>]*>([^<]+)<\/li>/g);
            for (const match of bulletMatches) {
                bulletPoints.push(match[1].trim());
            }
            description = bulletPoints.join(' ');
        } else {
            description = descriptionMatch[1].trim();
        }
    }
    
    // Determine category based on URL or title
    let category = 'accessories'; // Default category
    
    if (amazonUrl.includes('/vr-headset') || title.toLowerCase().includes('headset') || title.toLowerCase().includes('oculus') || title.toLowerCase().includes('quest')) {
        category = 'headsets';
    } else if (amazonUrl.includes('/controller') || title.toLowerCase().includes('controller')) {
        category = 'controllers';
    } else if (amazonUrl.includes('/games') || title.toLowerCase().includes('game')) {
        category = 'games';
    }
    
    return {
        title,
        rating,
        category,
        imageUrl,
        price: isNaN(price) ? 0 : price,
        description: description || `This is a product available on Amazon. Check the product page for more details.`
    };
}

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop the server');
}); 