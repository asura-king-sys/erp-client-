import React from 'react';
import Spinner from './Spinner';

const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  disabled = false, 
  className = '', 
  type = 'button',
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-none shadow-none',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`btn ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2 border-current" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
