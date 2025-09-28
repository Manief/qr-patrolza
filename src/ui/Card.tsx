import React from 'react';

interface CardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
    {icon && <div className="mb-2">{icon}</div>}
    <div className="text-lg font-bold text-gray-700">{title}</div>
    <div className="text-2xl text-primary-600 font-extrabold">{value}</div>
  </div>
);

export default Card;
