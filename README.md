# TryVR - Virtual Reality Affiliate Showcase

A lightweight, single-page web application for showcasing VR products with automatic Amazon affiliate link integration. Built with HTML5, JavaScript, Tailwind CSS, and SQLite3.

## Features

- **VR-Focused Product Showcase**: Dedicated to virtual reality headsets, controllers, accessories, and games
- **Automatic Affiliate Link Integration**: Automatically adds your Amazon affiliate ID to all product links
- **SQLite3 Database**: Lightweight client-side database for storing product information
- **Responsive Design**: Works on desktop and mobile devices
- **Product Filtering**: Filter VR products by category and rating
- **Pagination**: Handles large product collections with scrollable interface
- **AI-Generated Descriptions**: Button to generate VR product descriptions with AI (mock implementation)
- **Import/Export**: Save and load your product database
- **Interactive VR Animations**: Engaging animations and 3D effects for an immersive experience

## Setup Instructions

1. **Configure Your Affiliate ID**:
   - Open `app.js`
   - Find the line `const AFFILIATE_ID = "youraffiliateid-20";`
   - Replace `youraffiliateid-20` with your actual Amazon affiliate ID

2. **Launch the Application**:
   - **Option 1: Direct File Opening**
     - Simply open `index.html` in a web browser
     - No server setup required - everything runs in the browser
   
   - **Option 2: Using the Built-in Server**
     - Install Node.js if you don't have it already
     - Run `npm install` to install dependencies
     - Run `npm start` to start the server
     - Open `http://localhost:3000` in your browser
     - For development with auto-reload, use `npm run dev` instead

3. **Adding VR Products**:
   - Click the "Add New VR Product" button
   - Enter the Amazon product URL, title, rating, and other details
   - Click "Save Product" to add it to your showcase
   - The affiliate link will be automatically generated

4. **AI-Generated VR Descriptions**:
   - When adding a product, enter the title first
   - Click "Generate Description" to create an AI-generated VR product description
   - (Note: The current implementation uses mock data. To integrate with a real AI service, modify the `generateDescriptionWithAI` function in `app.js`)

5. **Filtering VR Products**:
   - Use the category and rating filters in the sidebar
   - Products will update automatically when filters change
   - Quick filter buttons in the header for VR headsets and accessories

6. **Saving Your Database**:
   - Click the "Export Database" button in the sidebar
   - This will download a .db file with your product data

7. **Loading a Saved Database**:
   - Click the "Import Database" button in the sidebar
   - Select your previously saved .db file

## Technical Details

- **SQLite**: Uses SQL.js, a JavaScript implementation of SQLite
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Font Awesome**: Icon library for UI elements
- **Three.js**: 3D animation library for immersive background effects
- **No External Dependencies**: No build process or server required

## VR Product Categories

The application comes with predefined VR product categories:

- **VR Headsets**: Standalone and PC-connected virtual reality headsets
- **Controllers**: VR controllers and input devices
- **Accessories**: Comfort mods, cables, and other VR accessories
- **VR Games**: Software titles for various VR platforms

## Customization

- **Styling**: Modify `styles.css` and `vr-animations.css` to change the appearance
- **Categories**: Add more categories by updating the select options in `index.html` and the `getCategoryLabel` function in `app.js`
- **Product Display**: Modify the `displayProducts` function in `app.js` to change how products are displayed
- **Animations**: Adjust the Three.js animation in the index.html file

## License

This project is open source and available under the MIT License.

## Disclaimer

This application is for demonstration purposes. Make sure to comply with Amazon's Affiliate Program policies when using this in production. 