import React from 'react';

const Badge = ({ children, status = 'default' }) => {
  const statuses = {
    active: 'bg-green-100 text-green-800',
    present: 'bg-green-100 text-green-800',
    approved: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    terminated: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
    absent: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    half_day: 'bg-yellow-100 text-yellow-800',
    default: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statuses[status] || statuses.default}`}>
      {children || status.replace('_', ' ')}
    </span>
  );
};

export default Badge;
