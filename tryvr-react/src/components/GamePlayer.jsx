import { useState, useEffect, useRef } from 'react';

const GamePlayer = ({ game, onClose }) => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    if (!document.fullscreenElement) {
      const container = document.getElementById('game-container');
      if (container && container.requestFullscreen) {
        container.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={game.imageUrl} 
            alt={game.title} 
            className="h-10 w-10 rounded object-cover mr-3"
          />
          <h2 className="text-xl font-bold text-white">{game.title}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleFullscreen}
            className="text-gray-300 hover:text-white transition"
          >
            {isFullscreen ? (
              <i className="fas fa-compress"></i>
            ) : (
              <i className="fas fa-expand"></i>
            )}
          </button>
          <button 
            onClick={onClose}
            className="text-gray-300 hover:text-white transition"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Game Container */}
      <div 
        id="game-container"
        className="flex-grow relative flex items-center justify-center"
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
            <p className="text-white text-lg">Loading game...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 z-10">
            <div className="text-red-500 text-6xl mb-4">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <p className="text-white text-lg mb-4">{error}</p>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded text-white"
            >
              Back to Games
            </button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={game.gameUrl}
          title={game.title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; microphone; camera"
          sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-popups"
        ></iframe>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="text-gray-300 text-sm">
          <span className="mr-4">
            <i className="fas fa-gamepad mr-1"></i> {game.playCount.toLocaleString()} plays
          </span>
          <span>
            <i className="fas fa-star mr-1 text-yellow-400"></i> {game.rating.toFixed(1)}
          </span>
        </div>
        <div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            Close Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePlayer; 