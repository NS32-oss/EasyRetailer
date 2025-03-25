"use client"

import { useState, useEffect, useRef } from "react"

interface KeyboardBarcodeInputProps {
  onBarcodeDetected: (barcode: string) => void
  isActive: boolean
}

export default function KeyboardBarcodeInput({ onBarcodeDetected, isActive }: KeyboardBarcodeInputProps) {
  const [buffer, setBuffer] = useState<string>("")
  const [lastKeypressTime, setLastKeypressTime] = useState<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Configuration
  const TIMEOUT_MS = 100 // Time window to consider keypresses part of the same barcode
  const MIN_BARCODE_LENGTH = 5 // Minimum length to consider a valid barcode

  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if we're in machine mode and the target isn't an input element
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const currentTime = Date.now()

      // If it's been too long since the last keypress, reset the buffer
      if (currentTime - lastKeypressTime > TIMEOUT_MS && buffer.length > 0) {
        processBuffer()
      }

      // Update the last keypress time
      setLastKeypressTime(currentTime)

      // Add the key to the buffer if it's a printable character
      if (e.key.length === 1 || e.key === "Enter") {
        setBuffer((prev) => {
          // If Enter key is pressed, consider it the end of the barcode
          if (e.key === "Enter") {
            const newBuffer = prev
            processBuffer()
            return ""
          }
          return prev + e.key
        })

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Set a new timeout to process the buffer after a delay
        timeoutRef.current = setTimeout(() => {
          processBuffer()
        }, TIMEOUT_MS)
      }
    }

    const processBuffer = () => {
      if (buffer.length >= MIN_BARCODE_LENGTH) {
        onBarcodeDetected(buffer)
      }
      setBuffer("")
    }

    // Add the event listener
    window.addEventListener("keydown", handleKeyDown)

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [buffer, lastKeypressTime, onBarcodeDetected, isActive])

  return null // This component doesn't render anything
}

