import React from 'react';

export function Tabs({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function TabsList({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ children, className, onClick }) {
  return <button className={className} onClick={onClick}>{children}</button>;
}

export function TabsContent({ children, className }) {
  return <div className={className}>{children}</div>;
}
