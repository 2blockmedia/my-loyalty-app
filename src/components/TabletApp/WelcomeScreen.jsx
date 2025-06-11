import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../shared/Button';

const WelcomeScreen = () => {
  const { business, resetCurrentCustomer } = useAppContext();
  const [greeting, setGreeting] = useState('Welcome');

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
    
    // Reset current customer when returning to welcome screen
    resetCurrentCustomer();
  }, [resetCurrentCustomer]);

  return (
    <div className="text-center space-y-8 py-6">
      <div 
        className="w-24 h-24 mx-auto rounded-xl shadow-lg flex items-center justify-center"
        style={{ backgroundColor: business?.primaryColor || '#4F46E5', color: 'white' }}
      >
        <span className="text-4xl font-bold">{business?.name?.charAt(0) || 'C'}</span>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold" style={{ color: business?.primaryColor || '#4F46E5' }}>
          {greeting}!
        </h1>
        <p className="text-xl text-gray-600">
          Welcome to {business?.name || 'Coffee & Co.'} Rewards
        </p>
        <p className="text-gray-500">
          Earn points with every purchase and unlock exciting rewards
        </p>
      </div>

      <div className="pt-4">
        <div className="flex flex-col space-y-4 max-w-xs mx-auto">
          <Link to="/tablet/phone-entry">
            <Button primary fullWidth className="py-3 text-lg">
              Check In
            </Button>
          </Link>
          <p className="text-sm text-gray-500">
            Enter your phone number to check in and earn points
          </p>
        </div>
      </div>

      <div className="pt-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Today's Special</h2>
          <p className="text-gray-600">
            Purchase any coffee and get 2x points! Valid today only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;