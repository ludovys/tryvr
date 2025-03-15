import { useState, useEffect, useRef } from 'react';

const GamePlayer = ({ game, onClose }) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    // Track when the iframe is loaded
    const handleIframeLoad = () => {
      setIsLoading(false);
    };

    const handleIframeError = () => {
      setIsLoading(false);
      setError('Failed to load the game. Please try again later.');
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      iframe.addEventListener('error', handleIframeError);

      // Set a timeout in case the game takes too long to load
      const timeout = setTimeout(() => {
        if (isLoading) {
          setError('Game is taking too long to load. Please check your connection or try again later.');
          setIsLoading(false);
        }
      }, 15000);

      return () => {
        iframe.removeEventListener('load', handleIframeLoad);
        iframe.removeEventListener('error', handleIframeError);
        clearTimeout(timeout);
      };
    }
  }, [isLoading, game]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    const container = containerRef.current;
    
    if (!document.fullscreenElement && container) {
      if (container.requestFullscreen) {
        container.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else if (container.webkitRequestFullscreen) { /* Safari */
        container.webkitRequestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else if (container.msRequestFullscreen) { /* IE11 */
        container.msRequestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls after inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      
      // Initial timeout
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Handle escape key to exit fullscreen or close player
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header - only visible when showControls is true */}
      <div 
        className={`bg-gray-900/90 backdrop-blur-md p-4 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center">
          <img 
            src={game.imageUrl} 
            alt={game.title} 
            className="h-10 w-10 rounded-lg object-cover mr-3 border border-purple-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNhODU1ZjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWdhbWVwYWQiPjxsaW5lIHgxPSI2IiB5MT0iMTIiIHgyPSIxMCIgeTI9IjEyIj48L2xpbmU+PGxpbmUgeDE9IjgiIHkxPSIxMCIgeDI9IjgiIHkyPSIxNCI+PC9saW5lPjxsaW5lIHgxPSIxNSIgeTE9IjEzIiB4Mj0iMTUuMDEiIHkyPSIxMyI+PC9saW5lPjxsaW5lIHgxPSIxOCIgeTE9IjExIiB4Mj0iMTguMDEiIHkyPSIxMSI+PC9saW5lPjxwYXRoIGQ9Ik0xNyA4aC0yYTIgMiAwIDAgMC0yIDJ2OGEyIDIgMCAwIDAgMiAyaDJhMiAyIDAgMCAwIDItMnYtOGEyIDIgMCAwIDAtMi0yeiI+PC9wYXRoPjxwYXRoIGQ9Ik05IDhoLTJhMiAyIDAgMCAwLTIgMnY4YTIgMiAwIDAgMCAyIDJoMmEyIDIgMCAwIDAgMi0ydi04YTIgMiAwIDAgMC0yLTJ6Ij48L3BhdGg+PC9zdmc+';
            }}
          />
          <div>
            <h2 className="text-xl font-bold text-white">{game.title}</h2>
            <div className="flex items-center text-sm text-gray-300">
              <span className="mr-3">
                <i className="fas fa-gamepad mr-1"></i> {game.playCount.toLocaleString()} plays
              </span>
              <span className="flex items-center">
                <i className="fas fa-star text-yellow-400 mr-1"></i> {game.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleFullscreen}
            className="text-gray-300 hover:text-white transition p-2 rounded-full hover:bg-gray-800"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <i className="fas fa-compress text-lg"></i>
            ) : (
              <i className="fas fa-expand text-lg"></i>
            )}
          </button>
          <button 
            onClick={onClose}
            className="text-gray-300 hover:text-white transition p-2 rounded-full hover:bg-gray-800"
            title="Close Game"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
      </div>

      {/* Game Container */}
      <div 
        id="game-container"
        ref={containerRef}
        className={`flex-grow relative flex items-center justify-center bg-black ${isFullscreen ? 'w-screen h-screen' : 'w-full h-full'}`}
        onMouseEnter={() => setShowControls(true)}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-md z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-6"></div>
            <p className="text-white text-xl">Loading {game.title}...</p>
            <p className="text-gray-400 mt-2">This may take a few moments</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-md z-10">
            <div className="text-red-500 text-6xl mb-6">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <p className="text-white text-xl mb-4 max-w-md text-center">{error}</p>
            <button 
              onClick={onClose}
              className="vr-button px-6 py-3 rounded-lg text-white"
            >
              Back to Games
            </button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={game.gameUrl}
          title={game.title}
          className={`w-full h-full border-0 ${!isLoading ? 'z-10' : ''}`}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; microphone; camera; fullscreen"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-popups allow-presentation allow-orientation-lock"
        ></iframe>
        
        {/* Floating controls - only visible when showControls is true */}
        <div 
          className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-900/80 backdrop-blur-md px-6 py-3 rounded-full transition-opacity duration-300 z-20 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-300 transition"
            title="Close Game"
          >
            <i className="fas fa-times-circle text-xl"></i>
          </button>
          <button 
            onClick={toggleFullscreen}
            className="text-white hover:text-gray-300 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <i className="fas fa-compress-alt text-xl"></i>
            ) : (
              <i className="fas fa-expand-alt text-xl"></i>
            )}
          </button>
          <div className="text-white text-sm">
            Press <kbd className="bg-gray-700 px-2 py-1 rounded">ESC</kbd> to exit
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlayer; 