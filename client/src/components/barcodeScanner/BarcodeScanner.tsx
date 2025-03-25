"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
}

export default function BarcodeScanner({
  onBarcodeDetected,
}: BarcodeScannerProps) {
  const [scanMethod, setScanMethod] = useState<"mobile" | "machine" | null>(
    null
  );
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanControlsRef = useRef<{ stop: () => void } | null>(null);
  const beepRef = useRef<HTMLAudioElement | null>(null);

  const startMobileScanner = async () => {
    setErrorMessage("");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("Camera access is not supported by this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }

      codeReaderRef.current = new BrowserMultiFormatReader();

      // Continuously decode from the video stream
      const controls = await codeReaderRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const barcode = result.getText();
            console.log("Detected barcode:", barcode);
            playBeep();
            // Call the parent callback each time a barcode is detected
            onBarcodeDetected(barcode);
          }
          // If 'err' is non-fatal, it just means "no barcode found" at the moment
        }
      );

      scanControlsRef.current = controls;
    } catch (err) {
      console.error("Camera error:", err);
      setErrorMessage(
        "Could not access camera. Please check permissions or try another method."
      );
    }
  };

  // Manually stop scanning
  const stopCamera = () => {
    scanControlsRef.current?.stop();
    scanControlsRef.current = null;

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  };

  const playBeep = () => {
    if (beepRef.current) {
      beepRef.current.volume = 1.0;
      beepRef.current.play().catch((err) => console.error("Beep error:", err));
    }
  };

  // Auto-start scanner when "mobile" method is chosen
  useEffect(() => {
    if (scanMethod === "mobile") {
      startMobileScanner();
    }
  }, [scanMethod]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Manual barcode submission (machine method)
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onBarcodeDetected(manualBarcode);
      setManualBarcode("");
    }
  };

  // Debug button for simulating a scan
  const simulateBarcodeDetection = () => {
    const mockBarcode = Math.floor(Math.random() * 1000000000000)
      .toString()
      .padStart(12, "0");
    onBarcodeDetected(mockBarcode);
    // No stop here, just simulating an extra detection
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md dark:bg-gray-800 dark:border-gray-700">
      {/* Beep sound file in public/beep.mp3 */}
      <audio ref={beepRef} src="/beep.mp3" preload="auto" />
      <div className="p-4 border rounded-lg bg-white shadow-md dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Barcode Scanner
        </h2>

        {!scanMethod ? (
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 dark:text-gray-300">
              Choose a scanning method:
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setScanMethod("mobile")}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Scan with Mobile Camera
              </button>
              <button
                onClick={() => setScanMethod("machine")}
                className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Use Barcode Scanner
              </button>
            </div>
          </div>
        ) : scanMethod === "mobile" ? (
          <div className="flex flex-col gap-4">
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {errorMessage}
              </div>
            )}

            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              ></video>
              <canvas ref={canvasRef} className="hidden"></canvas>

              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={startMobileScanner}
                    className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Start Camera
                  </button>
                </div>
              )}
            </div>

            {isCameraActive && (
              <div className="flex gap-4">
                <button
                  onClick={simulateBarcodeDetection}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Simulate Scan
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    setScanMethod(null);
                  }}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              <p>Instructions:</p>
              <ol className="list-decimal pl-5 mt-1">
                <li>Click "Start Camera" to activate your device's camera</li>
                <li>Point the camera at the barcode</li>
                <li>Hold steady until the barcode is detected</li>
                <li>
                  Each time a barcode is recognized, you'll hear a beep and see
                  it logged in the console
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 dark:text-gray-300">
              Use your barcode scanner device or enter the barcode manually:
            </p>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter barcode number"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
              <button
                type="submit"
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </form>

            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              <p>Instructions:</p>
              <ol className="list-decimal pl-5 mt-1">
                <li>Connect your barcode scanner to your computer</li>
                <li>Click in the input field above</li>
                <li>Scan the barcode with your scanner device</li>
                <li>
                  The barcode should automatically be entered and submitted
                </li>
              </ol>
            </div>

            <button
              onClick={() => setScanMethod(null)}
              className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 mt-2"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
