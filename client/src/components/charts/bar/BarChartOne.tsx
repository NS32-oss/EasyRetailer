import React from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function Barcode() {
  const [data, setData] = React.useState("Not Found");

  return (
    <div className="w-full max-w-md mx-auto">
      <BarcodeScannerComponent
        width={500}
        height={500}
        onUpdate={(_, result) => {
          if (result) {
            setData(result.text);
          }
        }}
      />
      <p className="mt-4 text-lg text-center">{data}</p>
    </div>
  );
}

export default Barcode;
