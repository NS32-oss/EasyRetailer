import React, { useEffect, useRef, useState } from "react";
import Quagga from "quagga";

interface Props {
  onBarcodeDetected: (barcode: string) => void;
}

const BarcodeScanner: React.FC<Props> = ({ onBarcodeDetected }) => {
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [isScanLineActive, setIsScanLineActive] = useState(true);
  const scannerRef = useRef<HTMLDivElement>(null);
  const beepRef = useRef<HTMLAudioElement>(null);

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

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            facingMode: "environment",
          },
        },
        decoder: {
          readers: ["code_128_reader"],
        },
        locate: true,
        frequency: 2,
        numOfWorkers: 0,
      },
      (err: any) => {
        if (err) {
          console.error("Quagga init error:", err);
          return;
        }
        Quagga.start();
        setIsScanLineActive(true); // start animation
      }
    );

    Quagga.onDetected(handleDetected);
  };

  const handleDetected = (result: any) => {
    const code = result.codeResult.code;

    // 🔊 Play beep
    if (beepRef.current) {
      beepRef.current.currentTime = 0;
      beepRef.current.play();
    }

    setScannedBarcodes((prev) => [...prev, code]);
    onBarcodeDetected(code);
  };

  const stopScanner = () => {
    Quagga.offDetected(handleDetected);
    Quagga.stop();

    // 🔴 Kill all video tracks
    const video = document.querySelector("video");
    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }

    setIsScanLineActive(false);
    setIsScanning(false);
  };

  return (
    <div className="p-4 border rounded-xl shadow-md">
      {/* 🔊 Audio element */}
      <audio ref={beepRef} src="/beep.mp3" preload="auto" />

      <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden border border-gray-400">
        <div ref={scannerRef} className="absolute inset-0 z-10" />

        {isScanLineActive && (
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-scan-line z-20 opacity-70" />
        )}
      </div>

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
