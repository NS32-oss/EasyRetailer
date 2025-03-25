import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface Props {
  onBarcodeDetected: (barcode: string) => void;
}

const BarcodeScanner: React.FC<Props> = ({ onBarcodeDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamControlsRef = useRef<{ stop: () => void } | null>(null);
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (isScanning) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning]);

  const startScanner = async () => {
    try {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const selectedDeviceId = devices[0]?.deviceId;

      if (selectedDeviceId && videoRef.current) {
        const controls = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result) => {
            if (result) {
              const barcode = result.getText();
              setScannedBarcodes((prev) => [...prev, barcode]);
              onBarcodeDetected(barcode);
            }
          }
        );
        // Save the controls to stop the scanner later
        streamControlsRef.current = controls;
      }
    } catch (error) {
      console.error("Error starting barcode scanner:", error);
    }
  };

  const stopScanner = () => {
    streamControlsRef.current?.stop();
    setIsScanning(false);
  };

  return (
    <div className="p-4 border rounded-xl shadow-md">
      <video ref={videoRef} className="w-full max-w-md rounded-lg" />

      <button
        onClick={stopScanner}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Stop Scanning
      </button>

      <h3 className="mt-6 text-lg font-semibold">Scanned Barcodes:</h3>
      <table className="mt-2 w-full border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Barcode</th>
          </tr>
        </thead>
        <tbody>
          {scannedBarcodes.map((code, index) => (
            <tr key={index}>
              <td className="border px-2 py-1 text-center">{index + 1}</td>
              <td className="border px-2 py-1">{code}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BarcodeScanner;
