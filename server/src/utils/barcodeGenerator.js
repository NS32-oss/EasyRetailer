import { Counter } from "../models/barcodeCounter.model.js";

function pad(num) {
  return num.toString().padStart(4, "0");
}

export async function generateBarcode() {
  // Fetch and increment atomically
  const counter = await Counter.findByIdAndUpdate(
    "barcode",
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  let { seq, letter } = counter;

  // Overflow case: A9999 → B0001
  if (seq > 9999) {
    letter = String.fromCharCode(letter.charCodeAt(0) + 1);
    seq = 1;

    await Counter.findByIdAndUpdate(
      "barcode",
      { letter, seq },
      { new: true }
    );
  }

  return `${letter}${pad(seq)}`;
}
