import React, { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLSelectElement> { value?: string; }

const Select: React.FC<Props> = (props) => (
  <select
    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:border-primary-500"
    {...props}
  />
);

export default Select;
