import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Component to display the current deployment status
 * Useful for verifying that CI/CD is working correctly
 */
const DeploymentStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Determine the base URL based on environment
        const baseUrl = import.meta.env.PROD 
          ? 'https://tryvr.pages.dev/api/status' 
          : '/api/status';
        
        const response = await fetch(baseUrl);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        console.error('Error fetching status:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className={`text-center p-4 rounded-md ${isDarkMode ? 'bg-[var(--theme-bg-secondary)]' : 'bg-gray-100'}`}>
        <p className={isDarkMode ? 'text-[var(--theme-text-secondary)]' : 'text-gray-600'}>
          Loading deployment status...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-4 rounded-md ${isDarkMode ? 'bg-red-900/20' : 'bg-red-100'}`}>
        <p className={isDarkMode ? 'text-red-300' : 'text-red-600'}>
          Error loading status: {error}
        </p>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className={`p-4 rounded-md ${isDarkMode ? 'bg-[var(--theme-bg-secondary)]' : 'bg-gray-100'}`}>
      <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-[var(--theme-text-primary)]' : 'text-gray-800'}`}>
        Deployment Status
      </h3>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className={isDarkMode ? 'text-[var(--theme-text-secondary)]' : 'text-gray-600'}>Status:</div>
        <div className={`font-medium ${status.status === 'ok' ? 'text-green-500' : 'text-red-500'}`}>
          {status.status.toUpperCase()}
        </div>
        
        <div className={isDarkMode ? 'text-[var(--theme-text-secondary)]' : 'text-gray-600'}>Environment:</div>
        <div className={isDarkMode ? 'text-[var(--theme-text-primary)]' : 'text-gray-800'}>
          {status.environment}
        </div>
        
        <div className={isDarkMode ? 'text-[var(--theme-text-secondary)]' : 'text-gray-600'}>Branch:</div>
        <div className={isDarkMode ? 'text-[var(--theme-text-primary)]' : 'text-gray-800'}>
          {status.deployment.branch}
        </div>
        
        <div className={isDarkMode ? 'text-[var(--theme-text-secondary)]' : 'text-gray-600'}>Commit:</div>
        <div className={isDarkMode ? 'text-[var(--theme-text-primary)]' : 'text-gray-800'}>
          {status.deployment.id.substring(0, 7)}
        </div>
        
        <div className={isDarkMode ? 'text-[var(--theme-text-secondary)]' : 'text-gray-600'}>Version:</div>
        <div className={isDarkMode ? 'text-[var(--theme-text-primary)]' : 'text-gray-800'}>
          {status.version}
        </div>
        
        <div className={isDarkMode ? 'text-[var(--theme-text-secondary)]' : 'text-gray-600'}>Timestamp:</div>
        <div className={isDarkMode ? 'text-[var(--theme-text-primary)]' : 'text-gray-800'}>
          {new Date(status.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default DeploymentStatus; 