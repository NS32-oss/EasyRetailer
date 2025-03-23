"use client"

import { useEffect, useState } from "react"

export type ToastType = "success" | "error" | "info"

interface ToastProps {
  message: string
  type: ToastType
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"

  return isVisible ? (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-transform duration-300 ease-in-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center`}>
        <span className="mr-2">
          {type === "success" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {type === "error" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {type === "info" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </span>
        <p>{message}</p>
        <button
          onClick={() => {
            setIsVisible(false)
            if (onClose) onClose()
          }}
          className="ml-4 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  ) : null
}

// Toast container to manage multiple toasts
export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([])

  // Function to add a toast
  const addToast = (message: string, type: ToastType = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }

  // Function to remove a toast
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Expose functions to window for global access
  useEffect(() => {
    window.showToast = {
      success: (message: string) => addToast(message, "success"),
      error: (message: string) => addToast(message, "error"),
      info: (message: string) => addToast(message, "info"),
    }

    return () => {
      delete window.showToast
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

// Add type definition for the global window object
declare global {
  interface Window {
    showToast?: {
      success: (message: string) => void
      error: (message: string) => void
      info: (message: string) => void
    }
  }
}

