import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  primary = false, 
  disabled = false, 
  type = 'button',
  small = false,
  fullWidth = false,
  className = ''
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  
  const sizeStyles = small 
    ? "px-3 py-1.5 text-sm" 
    : "px-4 py-2 text-base";
  
  const colorStyles = primary 
    ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500" 
    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500";
  
  const widthStyles = fullWidth ? "w-full" : "";
  
  const disabledStyles = disabled 
    ? "opacity-60 cursor-not-allowed" 
    : "cursor-pointer";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${colorStyles} ${widthStyles} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;