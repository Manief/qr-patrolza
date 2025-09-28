import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', ...props }) => {
  const base = 'rounded px-4 py-2 font-semibold focus:outline-none transition-colors';
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'bg-white text-primary-500 border border-primary-500 hover:bg-primary-50',
  };
  const sizes = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm',
    lg: 'text-lg py-3 px-6',
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]}`}
      {...props}
    />
  );
};

export default Button;
