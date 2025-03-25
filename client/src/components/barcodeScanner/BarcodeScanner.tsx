"use client"

import { useState, useRef, useEffect } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"

interface BarcodeScannerProps {
  onBarcodeDetected?: (barcode: string) => void
}

interface ScannedBarcode {
  id: string
  value: string
  timestamp: Date
}

export default function BarcodeScanner({ onBarcodeDetected }: BarcodeScannerProps) {
  const [scanMode, setScanMode] = useState<"machine" | "mobile">("mobile")
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [scannedBarcodes, setScannedBarcodes] = useState<ScannedBarcode[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const beepRef = useRef<HTMLAudioElement | null>(null)

  // Track already scanned barcodes to avoid duplicates in quick succession
  const recentlyScannedRef = useRef<Set<string>>(new Set())

  const startScanner = async () => {
    if (isCameraActive) return // avoid re-initializing

    setErrorMessage("")

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage("Camera access is not supported by this browser")
      return
    }

    try {
      const constraints = {
        video: {
          facingMode: scanMode === "mobile" ? "environment" : "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        videoRef.current
          .play()
          .then(() => {
            setIsCameraActive(true)

            codeReaderRef.current = new BrowserMultiFormatReader()

            codeReaderRef.current
              .decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
                if (result) {
                  const barcode = result.getText()

                  // Check if this barcode was recently scanned (within last 3 seconds)
                  if (!recentlyScannedRef.current.has(barcode)) {
                    console.log("Detected:", barcode)
                    playBeep()

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
              })
              .then((controls) => {
                controlsRef.current = controls
              })
              .catch((err) => {
                console.error("Error starting scanner:", err)
                setErrorMessage("Failed to start barcode scanner")
              })
          })
          .catch((err) => {
            if (err.name === "AbortError") {
              console.log("Play was interrupted — ignoring.")
            } else {
              console.error("Video play error:", err)
              setErrorMessage("Could not play camera feed")
            }
          })
      }
    } catch (err) {
      console.error("Camera init error:", err)
      setErrorMessage("Could not access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    controlsRef.current?.stop()
    controlsRef.current = null

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    setIsCameraActive(false)
  }

  const playBeep = () => {
    if (beepRef.current) {
      beepRef.current.volume = 0.5
      beepRef.current.currentTime = 0
      beepRef.current.play().catch((err) => console.error("Beep error:", err))
    }
  }

  const clearScannedBarcodes = () => {
    setScannedBarcodes([])
  }

  const handleScanModeChange = (mode: "machine" | "mobile") => {
    if (isCameraActive) {
      stopCamera()
    }
    setScanMode(mode)
  }

  useEffect(() => {
    return () => stopCamera() // cleanup on unmount
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <div className="p-4 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <audio ref={beepRef} src="/beep.mp3" preload="auto" />

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Barcode Scanner</h2>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => handleScanModeChange("machine")}
            className={`flex-1 py-2 px-4 rounded-md ${
              scanMode === "machine"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
            }`}
          >
            Scan with Machine
          </button>
          <button
            onClick={() => handleScanModeChange("mobile")}
            className={`flex-1 py-2 px-4 rounded-md ${
              scanMode === "mobile"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
            }`}
          >
            Scan with Mobile
          </button>
        </div>

        {errorMessage && (
          <div className="text-red-500 mb-2 p-2 bg-red-100 dark:bg-red-900/30 rounded">{errorMessage}</div>
        )}

        {scanMode === "mobile" && (
          <>
            <div className="flex gap-4 mb-4">
              {!isCameraActive ? (
                <button
                  onClick={startScanner}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Stop Camera
                </button>
              )}

              <button
                onClick={clearScannedBarcodes}
                className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Clear Results
              </button>
            </div>

            {isCameraActive && (
              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600"
                  style={{ aspectRatio: "16/9", backgroundColor: "black" }}
                />
                <div className="absolute inset-0 pointer-events-none border-2 border-red-500 opacity-50 rounded-lg">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500"></div>
                </div>
              </div>
            )}
          </>
        )}

        {scanMode === "machine" && (
          <div className="p-6 border border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-2">Connect your barcode scanner to your computer.</p>
            <p className="text-gray-600 dark:text-gray-300">
              When ready, scan barcodes with your device and they will appear below.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Scanned Barcodes</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {scannedBarcodes.length} {scannedBarcodes.length === 1 ? "item" : "items"}
          </span>
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

