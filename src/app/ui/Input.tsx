import React, { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLInputElement> { 
  value?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const Input: React.FC<Props> = (props) => (
  <input
    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:border-primary-500"
    {...props}
  />
);

export default Input;
