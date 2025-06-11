import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../shared/Header';
import { useAppContext } from '../../contexts/AppContext';

const TabletAppLayout = () => {
  const { business } = useAppContext();
  const location = useLocation();

  // Add a background color based on the route
  const getBackgroundColor = () => {
    if (location.pathname === '/tablet') {
      // Main welcome screen - use primary color with opacity
      return `${business?.primaryColor || '#4F46E5'}10`;
    } else {
      // Other screens - use light gray
      return 'bg-gray-50';
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header mode="tablet" />
      
      <main className={`flex-1 overflow-y-auto ${getBackgroundColor()}`}>
        <div className="max-w-lg mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 px-4 shadow-inner border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} {business?.name || 'Coffee & Co.'}
          </div>
          <div className="text-sm text-gray-400">
            Tablet App v1.0
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TabletAppLayout;