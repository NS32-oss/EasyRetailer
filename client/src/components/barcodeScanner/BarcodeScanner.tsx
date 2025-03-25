import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';

interface Props {
  onBarcodeDetected: (barcode: string) => void;
}

const BarcodeScanner: React.FC<Props> = ({ onBarcodeDetected }) => {
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isScanning) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning]);

  const startScanner = () => {
    if (!scannerRef.current) return;

    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: scannerRef.current,
        constraints: {
          facingMode: 'environment', // ✅ back camera on mobile
        },
      },
      decoder: {
        readers: ['code_128_reader'], // Adjust formats here
      },
      locate: true,
    }, (err: any) => {
      if (err) {
        console.error('Quagga init error:', err);
        return;
      }
      Quagga.start();
    });
    
    Quagga.onDetected(handleDetected);
  };

  const handleDetected = (result: any) => {
    const code = result.codeResult.code;
    alert(`Result: ${result.codeResult}`);
    alert(`Barcode detected: ${code}`);
    setScannedBarcodes((prev) => [...prev, code]);
    onBarcodeDetected(code);
  };

  const stopScanner = () => {
    Quagga.offDetected(handleDetected);
    Quagga.stop();
    setIsScanning(false);
  };

  return (
    <div className="p-4 border rounded-xl shadow-md">
      <div
        ref={scannerRef}
        className="w-full max-w-md h-64 rounded-lg overflow-hidden"
        id="quagga-scanner"
      />

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
