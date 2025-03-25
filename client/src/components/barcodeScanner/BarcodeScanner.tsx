import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  onBarcodeDetected: (barcode: string) => void;
}

const BarcodeScanner: React.FC<Props> = ({ onBarcodeDetected }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  const scannerId = "barcode-scanner";

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
      const config = { fps: 10, qrbox: 250 };
      scannerRef.current = new Html5Qrcode(scannerId);

      await scannerRef.current.start(
        { facingMode: "environment" }, // back camera on phones
        config,
        (decodedText) => {
          // alert(decodedText);
          console.log("Barcode detected:", decodedText);
          setScannedBarcodes((prev) => [...prev, decodedText]);
          // onBarcodeDetected(decodedText);
        },
        (err) => {
          
        }
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
    }
    setIsScanning(false);
  };

  return (
    <div className="p-4 border rounded-xl shadow-md">
      <div id={scannerId} className="w-full max-w-md rounded-lg" />

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
