# TryVR - Browser-Based VR Games

TryVR is a platform for discovering and playing virtual reality games directly in your browser. No downloads required - just click and play!

## Live Demo

Visit the live demo at [https://tryvr.pages.dev](https://tryvr.pages.dev) or [https://dev.tryvr.pages.dev](https://dev.tryvr.pages.dev)

## Features

- Browse a curated collection of browser-based VR games
- Filter games by category
- Search for games by title or description
- Play games directly in your browser
- Admin dashboard for managing games
- Responsive design for all devices

## Tech Stack

- **Frontend**: React, React Router, TailwindCSS
- **Backend**: Cloudflare Workers, Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Pages

## Development

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Wrangler CLI (for Cloudflare Workers)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tryvr.git
   cd tryvr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Cloudflare Workers Development

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Start the local development server:
   ```bash
   wrangler dev
   ```

## Deployment

### Deploy to Cloudflare Pages

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare Pages:
   ```bash
   wrangler pages publish dist
   ```

## Admin Access

To access the admin dashboard, navigate to `/admin-login` and use the following credentials:

- Username: `admin`
- Password: `password`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [PlayCanvas](https://playcanvas.com/) - For providing the WebGL engine used by many of the games
- [Unsplash](https://unsplash.com/) - For the game images
- [Font Awesome](https://fontawesome.com/) - For the icons
- [TailwindCSS](https://tailwindcss.com/) - For the styling
