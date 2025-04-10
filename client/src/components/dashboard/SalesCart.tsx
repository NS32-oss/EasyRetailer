"use client";

import type React from "react";
import { useEffect, useState } from "react";
// import BarcodeScanner from "../barcodeScanner/BarcodeScanner";
import { Notification } from "../toastNotification/Notification";
import BarcodeScanner from "../barcodeScanner/BarcodeScanner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarcode } from "@fortawesome/free-solid-svg-icons";

import { TrashIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Define the TypeScript interface for the cart items
interface CartItem {
  id: string;
  brand: string;
  size: string;
  type: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amountPayable: number;
  selected: boolean;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

export default function SalesCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState("");
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDiscountInput, setTotalDiscountInput] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [customerMobile, setCustomerMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Calculate totals whenever cart items or total discount input change
  useEffect(() => {
    // Calculate the sum of amountPayable for each item
    const amount = cartItems.reduce((sum, item) => sum + item.amountPayable, 0);

    // Apply the additional discount from the total discount input
    const finalAmount = Math.max(0, amount - totalDiscountInput);

    setTotalDiscount(totalDiscountInput);
    setTotalAmount(finalAmount);
  }, [cartItems, totalDiscountInput]);

  // Function to add a product by barcode
  const addProductByBarcode = async (barcodeValue: string) => {
    if (!barcodeValue.trim()) return;
    // alert(`Adding product with barcode  1: ${barcodeValue}`);
    try {
      // Fetch product details from the API
      const response = await fetch(
        `${API_BASE_URL}/api/v1/product/barcode/${barcodeValue}`
      );
      const data = await response.json();
      console.log("Product data:", data);
      // alert(`Adding product with barcode  2: ${barcodeValue}`);
      if (data.status == 200) {
        const product = data.data;
        const unitPrice = product.unit_price;

        const newItem: CartItem = {
          id: product._id, // Use the product ID from the API
          brand: product.brand,
          size: product.size,
          type: product.type,
          quantity: 1,
          unitPrice: unitPrice,
          discount: 0,
          amountPayable: unitPrice,
          selected: false,
        };

        setCartItems((prev) => [...prev, newItem]);
        setBarcode("");
        setNotification({
          message: "Product added successfully",
          type: "success",
        });
      } else {
        alert("Product not found");
        setNotification({ message: "Product not found", type: "error" });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setNotification({ message: "Failed to fetch product", type: "error" });
    }
  };

  // Function to handle quantity change
  const handleQuantityChange = (id: string, increment: boolean) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = increment
            ? item.quantity + 1
            : Math.max(1, item.quantity - 1);
          const newAmountPayable = item.unitPrice * newQuantity - item.discount;

          return {
            ...item,
            quantity: newQuantity,
            amountPayable: newAmountPayable,
          };
        }
        return item;
      })
    );
  };

  // Function to handle discount change
  const handleDiscountChange = (id: string, value: string) => {
    const discountValue = Number.parseFloat(value) || 0;

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const totalPrice = item.unitPrice * item.quantity;
          const newAmountPayable = Math.max(0, totalPrice - discountValue);

          return {
            ...item,
            discount: discountValue,
            amountPayable: newAmountPayable,
          };
        }
        return item;
      })
    );
  };

  // Function to handle amount payable change
  const handleAmountPayableChange = (id: string, value: string) => {
    const amountValue = Number.parseFloat(value) || 0;

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const totalPrice = item.unitPrice * item.quantity;
          const newDiscount = Math.max(0, totalPrice - amountValue);

          return {
            ...item,
            discount: newDiscount,
            amountPayable: amountValue,
          };
        }
        return item;
      })
    );
  };

  // Function to toggle item selection
  const toggleItemSelection = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Function to delete selected items
  const deleteSelectedItems = () => {
    const selectedItems = cartItems.filter((item) => item.selected);
    setCartItems((prev) => prev.filter((item) => !item.selected));

    // Show notification for deleted items
    if (selectedItems.length > 0) {
      setNotification({
        message: `${selectedItems.length} item(s) removed from cart`,
        type: "info",
      });
    }
  };

  // Function to validate mobile number
  const validateMobileNumber = (mobile: string): boolean => {
    // Check if mobile number is exactly 10 digits
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(mobile);
  };

  // Function to generate bill and create sale
  const handleGenerateBill = async () => {
    if (cartItems.length === 0) {
      setNotification({ message: "Cart is empty", type: "error" });
      return;
    }

    // Validate mobile number
    if (!validateMobileNumber(customerMobile)) {
      setMobileError("Please enter a valid 10-digit mobile number");
      return;
    }

    setMobileError("");

    try {
      // Prepare the sale data with correct calculations
      const saleData = {
        products: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          // Make sure selling_price is the final amount for this item only
          selling_price: item.amountPayable,
          cost_price: item.unitPrice,
          brand: item.brand,
          size: item.size,
          type: item.type,
        })),
        // Use the calculated totalAmount directly
        total_price: totalAmount,
        final_discount: totalDiscount,
        payment_method: "Card",
        customer_mobile: customerMobile,
        bill_generated: true,
      };

      console.log("Sending sale data:", saleData);

      const response = await fetch(`${API_BASE_URL}/api/v1/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (data.status === 201) {
        console.log("Sale created:", saleData);

        // Now generate the bill
        if (data.data && data.data._id) {
          try {
            const billResponse = await fetch(
              `${API_BASE_URL}/api/v1/sales/bill/${data.data._id}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ contact_number: customerMobile }),
              }
            );

            const billData = await billResponse.json();

            if (billData.status === 200) {
              setNotification({
                message: "Sale created and bill generated successfully",
                type: "success",
              });

              // Redirect to sales history
              window.location.href = `/sales-cart-history/${data.data._id}`;
            } else {
              throw new Error(billData.message || "Failed to generate bill");
            }
          } catch (error) {
            console.error("Error generating bill:", error);
            setNotification({
              message: "Sale created but failed to generate bill",
              type: "error",
            });

            // Still redirect to sales history
            window.location.href = `/sales-cart-history/${data.data._id}`;
          }
        } else {
          console.error("Sale ID not found in response");
          setNotification({
            message: "Sale created but sale ID not found",
            type: "error",
          });
        }
      } else {
        throw new Error(data.message || "Failed to create sale");
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      setNotification({ message: "Failed to create sale", type: "error" });
    }
  };

  // Function to create sale without bill
  const handleCreateSaleWithoutBill = async () => {
    if (cartItems.length === 0) {
      setNotification({ message: "Cart is empty", type: "error" });
      return;
    }

    // Validate cart items
    const invalidItems = cartItems.filter(
      (item) => !item.type || !item.size || !item.brand
    );
    if (invalidItems.length > 0) {
      console.log("Invalid items:", invalidItems);
      return;
    }

    try {
      // Prepare the sale data with correct calculations
      const saleData = {
        products: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          selling_price: item.amountPayable,
          cost_price: item.unitPrice,
          type: item.type,
          size: item.size,
          brand: item.brand,
        })),
        // Use the calculated totalAmount directly
        total_price: totalAmount,
        final_discount: totalDiscount,
        payment_method: "Card",
        customer_mobile: "",
        bill_generated: false,
      };

      console.log("Sending sale data:", saleData);

      const response = await fetch(`${API_BASE_URL}/api/v1/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (data.status === 201) {
        console.log("Sale created:", saleData);
        setNotification({
          message: "Sale created successfully",
          type: "success",
        });

        // Redirect to sales history
        if (data.data && data.data._id) {
          window.location.href = `/sales-cart-history/${data.data._id}`;
        } else {
          console.error("Sale ID not found in response");
          window.location.href = "/";
        }
      } else {
        throw new Error(data.message || "Failed to create sale");
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      setNotification({ message: "Failed to create sale", type: "error" });
    }
  };

  // Function to handle barcode input submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProductByBarcode(barcode);
  };

  // Function to handle barcode detection from scanner
  const handleBarcodeDetection = (detectedBarcode: string) => {
    alert(`Detected barcode: ${detectedBarcode}`);
    addProductByBarcode(detectedBarcode);
    setShowScanner(false);
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {showBillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Generate Bill
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Would you like to generate a bill for this sale?
            </p>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Customer Mobile Number:
              </label>
              <input
                type="tel"
                value={customerMobile}
                onChange={(e) => {
                  setCustomerMobile(e.target.value);
                  setMobileError("");
                }}
                placeholder="Enter mobile number"
                className={`w-full px-3 py-2 border ${
                  mobileError ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
              />
              {mobileError && (
                <p className="text-red-500 text-sm mt-1">{mobileError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  handleCreateSaleWithoutBill();
                  setShowBillModal(false);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                No, Skip
              </button>
              <button
                onClick={() => {
                  handleGenerateBill();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Yes, Generate Bill
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-9 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 whitespace-nowrap">
              Sales Cart
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {!showScanner ? (
              <>
                <form
                  onSubmit={handleBarcodeSubmit}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Enter barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full sm:w-60 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 whitespace-nowrap"
                  >
                    <PlusIcon className="h-4 w-4" /> Add Product
                  </button>
                </form>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowScanner(true)}
                    className="w-1/2 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
                  >
                    <FontAwesomeIcon icon={faBarcode} className="h-4 w-4" />
                    Scan Barcode
                  </button>

                  <button
                    onClick={deleteSelectedItems}
                    disabled={!cartItems.some((item) => item.selected)}
                    className={`w-1/2 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 whitespace-nowrap ${
                      !cartItems.some((item) => item.selected)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <TrashIcon className="h-4 w-4" /> Delete Selected
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowScanner(false)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 whitespace-nowrap"
                >
                  <XMarkIcon className="h-4 w-4" /> Cancel Scan
                </button>
              </div>
            )}
          </div>
        </div>

        {showScanner ? (
          <div className="mb-6">
            <BarcodeScanner onBarcodeDetected={handleBarcodeDetection} />
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="table-auto w-full">
                {/* Table Header */}
                <thead className="border-gray-100 dark:border-gray-800 border-y">
                  <tr>
                    <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                      Select
                    </th>
                    <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                      Brand
                    </th>
                    <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                      Size
                    </th>
                    <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                      Type
                    </th>
                    <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                      Quantity
                    </th>
                    <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                      Unit Price
                    </th>
                    <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                      Discount
                    </th>
                    <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                      Amount Payable
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {cartItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-6 text-center text-gray-500 dark:text-gray-400"
                      >
                        No items in cart. Add products using the barcode.
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleItemSelection(item.id)}
                            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700"
                          />
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                          {item.brand}
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                          {item.size}
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                          {item.type}
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <button
                              className="h-6 w-6 flex items-center justify-center border border-gray-300 rounded dark:border-gray-700"
                              onClick={() =>
                                handleQuantityChange(item.id, false)
                              }
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              className="h-6 w-6 flex items-center justify-center border border-gray-300 rounded dark:border-gray-700"
                              onClick={() =>
                                handleQuantityChange(item.id, true)
                              }
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) =>
                              handleDiscountChange(item.id, e.target.value)
                            }
                            className="w-20 h-8 px-2 border border-gray-300 rounded dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            min="0"
                          />
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                          <input
                            type="number"
                            value={item.amountPayable}
                            onChange={(e) =>
                              handleAmountPayableChange(item.id, e.target.value)
                            }
                            className="w-24 h-8 px-2 border border-gray-300 rounded dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            min="0"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Section */}
        {cartItems.length > 0 && (
          <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex flex-col gap-2 sm:items-end">
              <div className="flex justify-between sm:w-64">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Discount:
                </span>
                <input
                  type="number"
                  value={totalDiscountInput}
                  onChange={(e) =>
                    setTotalDiscountInput(Number(e.target.value))
                  }
                  className="w-24 h-8 px-2 border border-gray-300 rounded dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  min="0"
                />
              </div>
              <div className="flex justify-between sm:w-64">
                <span className="text-gray-600 dark:text-gray-400">
                  Final Amount Payable:
                </span>
                <span className="font-semibold text-lg text-gray-900 dark:text-white">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowBillModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 font-medium"
              >
                Create Sale
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
