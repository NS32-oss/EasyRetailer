import React, { useEffect, useRef, useState } from "react";
import Quagga from "quagga";

interface Props {
  onBarcodeDetected: (barcode: string) => void;
}

const BarcodeScanner: React.FC<Props> = ({ onBarcodeDetected }) => {
  const [isScanLineActive, setIsScanLineActive] = useState(true);
  const scannerRef = useRef<HTMLDivElement>(null);
  const quaggaRunningRef = useRef(false);
  const beepRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) startScanner();
    }, 300);

    return () => {
      mounted = false;
      stopScanner();
    };
  }, []);

  const startScanner = () => {
    if (!scannerRef.current) return;

    const width = scannerRef.current.offsetWidth;
    const height = scannerRef.current.offsetHeight;
    if (width === 0 || height === 0) {
      console.warn("Scanner area not ready");
      return;
    }

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current!,
          constraints: {
            facingMode: "environment",
          },
        },
        decoder: {
          readers: ["code_128_reader"],
        },
        locate: true,
        numOfWorkers: 0,
        frequency: 2,
      },
      (err: any) => {
        if (err) {
          console.error("Quagga init error:", err);
          return;
        }
        Quagga.start();
        quaggaRunningRef.current = true;
        setIsScanLineActive(true);
      }
    );

    Quagga.onDetected(handleDetected);
  };

  const handleDetected = (result: any) => {
    const code = result.codeResult.code;

    if (beepRef.current) {
      beepRef.current.currentTime = 0;
      beepRef.current.play();
    }

    onBarcodeDetected(code);
  };

  const stopScanner = () => {
    if (quaggaRunningRef.current) {
      Quagga.offDetected(handleDetected);
      Quagga.stop();
      quaggaRunningRef.current = false;
    }

    const video = document.querySelector("video");
    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }

    if (scannerRef.current) {
      scannerRef.current.innerHTML = "";
    }

    setIsScanLineActive(false);
  };

  return (
    <div className="p-4 border rounded-xl shadow-md">
      {/* 🔊 Beep on scan */}
      <audio ref={beepRef} src="/beep.mp3" preload="auto" />

      {/* 📷 Scanner area */}
      <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden border border-gray-400">
        <div ref={scannerRef} className="absolute inset-0 z-10" />
        {isScanLineActive && (
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-scan-line z-20 opacity-70" />
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
