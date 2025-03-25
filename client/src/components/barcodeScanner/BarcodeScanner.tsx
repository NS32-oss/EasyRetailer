"use client";

import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerProps {
  onBarcodeDetected?: (barcode: string) => void;
}

interface ScannedBarcode {
  id: string;
  value: string;
  timestamp: Date;
}

export default function BarcodeScanner({
  onBarcodeDetected,
}: BarcodeScannerProps) {
  // State
  const [scanMode, setScanMode] = useState<"machine" | "mobile">("mobile");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scannedBarcodes, setScannedBarcodes] = useState<ScannedBarcode[]>([]);
  const [buffer, setBuffer] = useState<string>("");
  const [lastKeypressTime, setLastKeypressTime] = useState<number>(0);
  const [scanLinePosition, setScanLinePosition] = useState<number>(0);
  const [scanDirection, setScanDirection] = useState<"down" | "up">("down");

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recentlyScannedRef = useRef<Set<string>>(new Set());
  const scanAnimationRef = useRef<number | null>(null);

  // Constants
  const TIMEOUT_MS = 100; // Time window to consider keypresses part of the same barcode
  const MIN_BARCODE_LENGTH = 5; // Minimum length to consider a valid barcode
  const SCAN_LINE_SPEED = 2; // Speed of the scanning line animation

  // Handle barcode detection
  const handleBarcodeDetected = (barcode: string) => {
    // Check if this barcode was recently scanned (within last 3 seconds)
    if (!recentlyScannedRef.current.has(barcode)) {
      console.log("Detected:", barcode);

      // Add to recently scanned set with a timeout to remove after 3 seconds
      recentlyScannedRef.current.add(barcode);
      setTimeout(() => {
        recentlyScannedRef.current.delete(barcode);
      }, 3000);

      // Add to our list of scanned barcodes
      setScannedBarcodes((prev) => [
        {
          id: Date.now().toString(),
          value: barcode,
          timestamp: new Date(),
        },
        ...prev,
      ]);

      // Also call the callback if provided
      if (onBarcodeDetected) {
        onBarcodeDetected(barcode);
      }

      // Play beep sound
      playBeep();
    }
  };

  // Process keyboard input buffer
  const processBuffer = () => {
    if (buffer.length >= MIN_BARCODE_LENGTH) {
      handleBarcodeDetected(buffer);
    }
    setBuffer("");
  };

  // Play beep sound
  const playBeep = () => {
    try {
      const audio = new Audio("/beep.mp3");
      audio.volume = 0.5;
      audio.play().catch((err) => console.error("Beep error:", err));
    } catch (err) {
      console.error("Could not play beep sound:", err);
    }
  };

  // Animate the scanning line
  const animateScanLine = () => {
    if (!isCameraActive) return;

    setScanLinePosition((prev) => {
      let newPosition = prev;

      if (scanDirection === "down") {
        newPosition += SCAN_LINE_SPEED;
        if (newPosition >= 100) {
          setScanDirection("up");
          newPosition = 100;
        }
      } else {
        newPosition -= SCAN_LINE_SPEED;
        if (newPosition <= 0) {
          setScanDirection("down");
          newPosition = 0;
        }
      }

      return newPosition;
    });

    scanAnimationRef.current = requestAnimationFrame(animateScanLine);
  };

  // Start camera for mobile scanning
  const startCamera = async () => {
    if (isCameraActive) return; // avoid re-initializing

    setErrorMessage("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage("Camera access is not supported by this browser");
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        try {
          await videoRef.current.play();
          setIsCameraActive(true);

          // Start scan line animation
          if (scanAnimationRef.current) {
            cancelAnimationFrame(scanAnimationRef.current);
          }
          scanAnimationRef.current = requestAnimationFrame(animateScanLine);

          // Initialize barcode reader
          codeReaderRef.current = new BrowserMultiFormatReader();

          const controls = await codeReaderRef.current.decodeFromVideoDevice(
            undefined,
            videoRef.current,
            (result) => {
              if (result) {
                const barcode = result.getText();
                handleBarcodeDetected(barcode);
              }
            }
          );

          controlsRef.current = controls;
        } catch (err) {
          console.error("Video play error:", err);
          setErrorMessage(
            "Could not start video stream. Please check camera permissions."
          );
        }
      }
    } catch (err) {
      console.error("Camera init error:", err);
      setErrorMessage("Could not access camera. Please check permissions.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    // Stop scan line animation
    if (scanAnimationRef.current) {
      cancelAnimationFrame(scanAnimationRef.current);
      scanAnimationRef.current = null;
    }

    setIsCameraActive(false);
  };

  // Clear scanned barcodes
  const clearScannedBarcodes = () => {
    setScannedBarcodes([]);
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Handle scan mode change
  const handleScanModeChange = (mode: "machine" | "mobile") => {
    if (isCameraActive) {
      stopCamera();
    }
    setScanMode(mode);
  };

  // Effect for keyboard barcode scanner
  useEffect(() => {
    if (scanMode !== "machine") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if we're in machine mode and the target isn't an input element
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const currentTime = Date.now();

      // If it's been too long since the last keypress, reset the buffer
      if (currentTime - lastKeypressTime > TIMEOUT_MS && buffer.length > 0) {
        processBuffer();
      }

      // Update the last keypress time
      setLastKeypressTime(currentTime);

      // Add the key to the buffer if it's a printable character
      if (e.key.length === 1 || e.key === "Enter") {
        if (e.key === "Enter") {
          processBuffer();
        } else {
          setBuffer((prev) => prev + e.key);

          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Set a new timeout to process the buffer after a delay
          timeoutRef.current = setTimeout(() => {
            processBuffer();
          }, TIMEOUT_MS);
        }
      }
    };

    // Add the event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scanMode, buffer, lastKeypressTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (scanAnimationRef.current) {
        cancelAnimationFrame(scanAnimationRef.current);
      }
    };
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Barcode Scanner
      </h2>

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
        <div className="text-red-500 mb-4 p-2 bg-red-100 dark:bg-red-900/30 rounded">
          {errorMessage}
        </div>
      )}

      {scanMode === "mobile" && (
        <div className="mb-4">
          <div className="flex gap-4 mb-4">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
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
            <div
              className="relative mb-4 border-4 border-blue-600 rounded-lg overflow-hidden"
              style={{ height: "300px" }}
            >
              <video
                ref={videoRef}
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ backgroundColor: "black" }}
              />

              {/* Scanning area overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4/5 h-1/2 border-2 border-white rounded-lg relative">
                  {/* Animated scanning line */}
                  <div
                    className="absolute left-0 right-0 h-1 bg-red-500 z-10"
                    style={{
                      top: `${scanLinePosition}%`,
                      boxShadow: "0 0 8px rgba(255, 0, 0, 0.8)",
                    }}
                  ></div>
                </div>
              </div>

              {/* Corner markers for scanning area */}
              <div className="absolute top-1/4 left-[10%] w-8 h-8 border-t-4 border-l-4 border-white"></div>
              <div className="absolute top-1/4 right-[10%] w-8 h-8 border-t-4 border-r-4 border-white"></div>
              <div className="absolute bottom-1/4 left-[10%] w-8 h-8 border-b-4 border-l-4 border-white"></div>
              <div className="absolute bottom-1/4 right-[10%] w-8 h-8 border-b-4 border-r-4 border-white"></div>

              {/* Scanning status indicator */}
              <div className="absolute bottom-2 left-0 right-0 text-center text-white text-sm font-medium bg-black bg-opacity-50 py-1">
                Scanning for barcodes...
              </div>
            </div>
          )}
        </div>
      )}

      {scanMode === "machine" && (
        <div className="p-6 border border-gray-300 dark:border-gray-600 rounded-lg text-center mb-4">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Connect your barcode scanner to your computer.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            When ready, scan barcodes with your device and they will appear
            below.
          </p>
        </div>
      )}

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Scanned Barcodes
          </h3>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {scannedBarcodes.length}{" "}
              {scannedBarcodes.length === 1 ? "item" : "items"}
            </span>
            {scannedBarcodes.length > 0 && (
              <button
                onClick={clearScannedBarcodes}
                className="py-1 px-3 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Clear
              </button>
            )}
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
                    className={
                      index % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 dark:bg-gray-800"
                    }
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
  );
}
