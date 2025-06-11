import React, { useState, useEffect } from 'react';

const PhoneInput = ({ value, onChange, disabled = false, placeholder = "Enter phone number", className = "" }) => {
  const [formattedValue, setFormattedValue] = useState('');
  
  // Format phone number as user types
  useEffect(() => {
    setFormattedValue(formatPhoneNumber(value || ''));
  }, [value]);
  
  // Format phone number to (XXX) XXX-XXXX
  const formatPhoneNumber = (input) => {
    const numbers = input.replace(/\D/g, '');
    
    if (numbers.length === 0) {
      return '';
    } else if (numbers.length <= 3) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const input = e.target.value;
    const numbers = input.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (numbers.length <= 10) {
      onChange(numbers);
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <input
        type="tel"
        value={formattedValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`block w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'bg-gray-100' : ''}`}
        maxLength={14} // (XXX) XXX-XXXX = 14 characters
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </div>
    </div>
  );
};

export default PhoneInput;