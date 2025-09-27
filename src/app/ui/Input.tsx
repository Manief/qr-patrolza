import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = (props) => (
  <input
    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:border-primary-500"
    {...props}
  />
);

export default Input;
