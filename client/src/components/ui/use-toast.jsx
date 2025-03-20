import { useState } from 'react';

export function useToast() {
  // A simple placeholder hook for toast notifications.
  // In a real-world app, you might use a context or a third-party library.
  const [toasts, setToasts] = useState([]);

  const toast = (options) => {
    console.log('Toast:', options);
    // For now, simply log the toast options.
    // Optionally, update state if you want to display them in your UI.
    setToasts((prev) => [...prev, options]);
  };

  return { toast, toasts };
}
