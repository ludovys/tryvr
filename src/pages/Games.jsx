import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';

const Games = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-[var(--theme-bg-primary)]' : 'bg-gray-50'}`}>
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-12">
          {/* Page heading */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Game Collection
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This page is under development for a new feature
            </p>
          </div>
          
          {/* Content placeholder */}
          <div className={`rounded-lg p-8 ${isDarkMode ? 'bg-[var(--theme-card-bg)]' : 'bg-white'} shadow-lg`}>
            <div className="text-center py-16">
              <i className={`fas fa-tools text-5xl mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}></i>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Coming Soon</h2>
              <p className={`max-w-md mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                We're working on something exciting for this page. The games are now available on the homepage.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Games; 