import React from 'react';

export function Dialog({ children, className, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export function DialogContent({ children, className, ...props }) {
  return <div className={`dialog-content ${className}`} {...props}>{children}</div>;
}

export function DialogDescription({ children, className, ...props }) {
  return <p className={`dialog-description ${className}`} {...props}>{children}</p>;
}

export function DialogFooter({ children, className, ...props }) {
  return <div className={`dialog-footer ${className}`} {...props}>{children}</div>;
}

export function DialogHeader({ children, className, ...props }) {
  return <div className={`dialog-header ${className}`} {...props}>{children}</div>;
}

export function DialogTitle({ children, className, ...props }) {
  return <h2 className={`dialog-title ${className}`} {...props}>{children}</h2>;
}

export function DialogTrigger({ children, className, ...props }) {
  return <button className={`dialog-trigger ${className}`} {...props}>{children}</button>;
}

export default Dialog;