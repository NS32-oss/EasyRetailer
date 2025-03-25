"use client"

import React, { useState } from "react"
import BarcodeScanner from "./BarcodeScanner"
import KeyboardBarcodeInput from "./KeyboardBarcodeInput"

interface ScannedBarcode {
  id: string
  value: string
  timestamp: Date
}

interface EnhancedBarcodeScannerProps {
  onBarcodeDetected?: (barcode: string) => void
}

export default function EnhancedBarcodeScanner({ onBarcodeDetected }: EnhancedBarcodeScannerProps) {
  const [scanMode, setScanMode] = useState<"machine" | "mobile">("mobile")
  const [scannedBarcodes, setScannedBarcodes] = useState<ScannedBarcode[]>([])

  // Track already scanned barcodes to avoid duplicates in quick succession
  const recentlyScannedRef = React.useRef<Set<string>>(new Set())

  const handleBarcodeDetected = (barcode: string) => {
    // Check if this barcode was recently scanned (within last 3 seconds)
    if (!recentlyScannedRef.current.has(barcode)) {
      console.log("Detected:", barcode)

      // Add to recently scanned set with a timeout to remove after 3 seconds
      recentlyScannedRef.current.add(barcode)
      setTimeout(() => {
        recentlyScannedRef.current.delete(barcode)
      }, 3000)

      // Add to our list of scanned barcodes
      setScannedBarcodes((prev) => [
        {
          id: Date.now().toString(),
          value: barcode,
          timestamp: new Date(),
        },
        ...prev,
      ])

      // Also call the callback if provided
      if (onBarcodeDetected) {
        onBarcodeDetected(barcode)
      }
    }
  }

  const clearScannedBarcodes = () => {
    setScannedBarcodes([])
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <div className="p-4 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Barcode Scanner</h2>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setScanMode("machine")}
            className={`flex-1 py-2 px-4 rounded-md ${
              scanMode === "machine"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
            }`}
          >
            Scan with Machine
          </button>
          <button
            onClick={() => setScanMode("mobile")}
            className={`flex-1 py-2 px-4 rounded-md ${
              scanMode === "mobile"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
            }`}
          >
            Scan with Mobile
          </button>
        </div>

        {scanMode === "mobile" ? (
          <BarcodeScanner onBarcodeDetected={handleBarcodeDetected} />
        ) : (
          <>
            <KeyboardBarcodeInput onBarcodeDetected={handleBarcodeDetected} isActive={scanMode === "machine"} />
            <div className="p-6 border border-gray-300 dark:border-gray-600 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-2">Connect your barcode scanner to your computer.</p>
              <p className="text-gray-600 dark:text-gray-300">
                When ready, scan barcodes with your device and they will appear below.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Scanned Barcodes</h3>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {scannedBarcodes.length} {scannedBarcodes.length === 1 ? "item" : "items"}
            </span>
            <button
              onClick={clearScannedBarcodes}
              className="py-1 px-3 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>

        {scannedBarcodes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Barcode
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {scannedBarcodes.map((barcode, index) => (
                  <tr
                    key={barcode.id}
                    className={index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {scannedBarcodes.length - index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {barcode.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatTime(barcode.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
            No barcodes scanned yet
          </div>
        )}
      </div>
    </div>
  )
}

