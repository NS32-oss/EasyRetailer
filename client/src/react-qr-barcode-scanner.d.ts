declare module "react-qr-barcode-scanner" {
    import React from "react";
  
    interface BarcodeScannerComponentProps {
      onUpdate: (error: unknown, result?: { text: string }) => void;
      onError?: (error: string | DOMException) => void;
      width?: number;
      height?: number;
      facingMode?: "user" | "environment";
      torch?: boolean;
      delay?: number;
      videoConstraints?: MediaTrackConstraints;
      stopStream?: boolean;
    }
  
    const BarcodeScannerComponent: React.FC<BarcodeScannerComponentProps>;
  
    export default BarcodeScannerComponent;
  }