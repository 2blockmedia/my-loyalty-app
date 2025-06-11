import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

const Header = ({ mode = 'tablet' }) => {
  const location = useLocation();
  const { business, resetCurrentCustomer } = useAppContext();
  
  // Determine if we're in tablet mode or admin mode
  const isTablet = mode === 'tablet';
  const isAdmin = mode === 'admin';
  
  // For tablet mode, show a simpler header with logo and title
  if (isTablet) {
    return (
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo or first letter in a colored box */}
            <div 
              className="w-10 h-10 rounded-md flex items-center justify-center mr-3" 
              style={{ backgroundColor: business?.primaryColor || '#4F46E5', color: 'white' }}
            >
              <span className="text-xl font-bold">{business?.name?.charAt(0) || 'C'}</span>
            </div>
            
            <div>
              <h1 className="text-lg font-bold" style={{ color: business?.primaryColor || '#4F46E5' }}>
                {business?.name || 'Coffee & Co.'}
              </h1>
              <p className="text-xs text-gray-500">Loyalty Rewards</p>
            </div>
          </div>
          
          {/* Reset button to go back to welcome screen */}
          {location.pathname !== '/tablet' && (
            <button
              onClick={resetCurrentCustomer}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
          )}
        </div>
      </header>
    );
  }
  
  // For admin mode, show a more detailed header with navigation links
  if (isAdmin) {
    return (
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div 
                  className="w-10 h-10 rounded-md flex items-center justify-center" 
                  style={{ backgroundColor: business?.primaryColor || '#4F46E5', color: 'white' }}
                >
                  <span className="text-xl font-bold">{business?.name?.charAt(0) || 'C'}</span>
                </div>
                <span className="ml-3 text-lg font-semibold text-gray-900">
                  Admin Dashboard
                </span>
              </div>
            </div>
            
            <div className="flex items-center">
              <Link to="/" className="ml-3 text-sm text-gray-600 hover:text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Exit
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }
  
  return null;
};

export default Header;