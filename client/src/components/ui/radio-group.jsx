import React from 'react';

export function RadioGroup({ children, className, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export function RadioGroupItem({ className, ...props }) {
  return <input type="radio" className={className} {...props} />;
}
