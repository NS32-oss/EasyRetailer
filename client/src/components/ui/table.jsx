import React from 'react';

export function Table({ children, className }) {
  return <table className={className}>{children}</table>;
}

export function TableHeader({ children, className }) {
  return <thead className={className}>{children}</thead>;
}

export function TableRow({ children, className }) {
  return <tr className={className}>{children}</tr>;
}

export function TableBody({ children, className }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableCell({ children, className }) {
  return <td className={className}>{children}</td>;
}

export function TableHead({ children, className }) {
  return <th className={className}>{children}</th>;
}