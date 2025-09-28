import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select: React.FC<SelectProps> = (props) => (
  <select
    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:border-primary-500"
    {...props}
  />
);

export default Select;
