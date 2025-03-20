import React from 'react';

export function Pagination({ children, className, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export function PaginationContent({ children, className, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export function PaginationItem({ children, className, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export function PaginationLink({ children, className, ...props }) {
  return <a className={className} {...props}>{children}</a>;
}

export function PaginationNext({ children, className, ...props }) {
  return (
    <button className={className} {...props}>
      {children || 'Next'}
    </button>
  );
}

export function PaginationPrevious({ children, className, ...props }) {
  return (
    <button className={className} {...props}>
      {children || 'Previous'}
    </button>
  );
}
