"use client";
import { useEffect, useState } from "react";
import { Notification } from "../toastNotification/Notification";

// Define the TypeScript interface for the cart items
interface CartItem {
  id: string; // Changed from _id to id to match API response _id
  brand: string;
  size: string;
  type: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amountPayable: number;
  selected: boolean;
  cost_price: number; // Added for display in summary
  selling_price: number; // Added for display in summary
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

export default function SalesCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState("");
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showBillModal, setShowBillModal] = useState(false);
  const [customerMobile, setCustomerMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedSaleId, setGeneratedSaleId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // For the new UI elements
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // Assuming this is needed for payment processing

  // Calculate totals whenever cart items change
  useEffect(() => {
    const totalDisc = cartItems.reduce((sum, item) => sum + item.discount, 0);
    const totalAmt = cartItems.reduce(
      (sum, item) => sum + item.amountPayable,
      0
    );
    setTotalDiscount(Math.round(totalDisc * 100) / 100);
    setTotalAmount(Math.round(totalAmt * 100) / 100);
  }, [cartItems]);

  // Function to add a product by barcode
  const addProductByBarcode = async (barcodeValue: string) => {
    if (!barcodeValue.trim()) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/product/barcode/${barcodeValue}`
      );
      const data = await response.json();

      if (data.status == 200) {
        const product = data.data;
        const unitPrice = product.unit_price;

        // Get the type name - handle both string and object formats
        const typeName = typeof product.type === 'object' ? product.type.name : product.type;
        
        // Get the subtype name if available
        const subtypeName = typeof product.subtype === 'object' ? product.subtype.name : (product.subtype || '');

        const brandName = typeof product.brand === 'object' ? product.brand.name : product.brand;

        const newItem: CartItem = {
          id: product._id,
          brand: brandName,
          size: product.size,
          type: subtypeName ? `${typeName} • ${subtypeName}` : typeName,
          quantity: 1,
          unitPrice: unitPrice,
          discount: 0,
          amountPayable: unitPrice,
          selected: false,
          cost_price: product.cost_price || unitPrice,
          selling_price: unitPrice,
        };

        // Check if item already exists and update quantity
        setCartItems((prev) => {
          const existingItemIndex = prev.findIndex(
            (item) => item.id === newItem.id
          );
          if (existingItemIndex > -1) {
            const updatedItems = [...prev];
            updatedItems[existingItemIndex].quantity += 1;
            updatedItems[existingItemIndex].amountPayable =
              updatedItems[existingItemIndex].unitPrice *
              updatedItems[existingItemIndex].quantity;
            return updatedItems;
          }
          return [...prev, newItem];
        });

        setBarcode("");
        setNotification({
          message: "Product added successfully",
          type: "success",
        });
      } else {
        setNotification({
          message: `Product with barcode "${barcodeValue}" not found in inventory`,
          type: "error",
        });
        // Keep the barcode in the input so user can correct it if needed
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setNotification({
        message: "Failed to fetch product. Please check your connection.",
        type: "error",
      });
    }
  };

  // Function to handle quantity change
  const updateQuantity = (itemId: string, change: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change);
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

  // // Function to handle discount change
  // const handleDiscountChange = (id: string, value: string) => {
  //   const discountValue = Number.parseFloat(value) || 0;

  //   setCartItems((prev) =>
  //     prev.map((item) => {
  //       if (item.id === id) {
  //         const totalPrice = item.unitPrice * item.quantity;
  //         const newAmountPayable = Math.max(0, totalPrice - discountValue);

  //         return {
  //           ...item,
  //           discount: discountValue,
  //           amountPayable: newAmountPayable,
  //         };
  //       }
  //       return item;
  //     })
  //   );
  // };

  // Function to handle amount payable change
  // const handleAmountPayableChange = (id: string, value: string) => { // REMOVED
  //   const amountValue = Number.parseFloat(value) || 0

  //   setCartItems((prev) =>
  //     prev.map((item) => {
  //       if (item.id === id) {
  //         const totalPrice = item.unitPrice * item.quantity
  //         const newDiscount = Math.max(0, totalPrice - amountValue)

  //         return {
  //           ...item,
  //           discount: newDiscount,
  //           amountPayable: amountValue,
  //         }
  //       }
  //       return item
  //     }),
  //   )
  // }

  // Function to handle final amount change for the entire cart
  const handleFinalAmountChange = (value: string) => {
    const newFinal = Number(value);
    const totalBefore = cartItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    if (totalBefore === 0) return;

    const totalDiscountNeeded = Math.max(0, totalBefore - newFinal);

    // Distribute proportionally
    setCartItems((prev) =>
      prev.map((item) => {
        const itemOriginalValue = item.unitPrice * item.quantity;
        const additionalDiscount =
          (itemOriginalValue / totalBefore) * totalDiscountNeeded;
        const newDiscount = Math.round(additionalDiscount * 100) / 100; // Round to 2 decimal places
        const newAmountPayable =
          Math.round((itemOriginalValue - newDiscount) * 100) / 100; // Round to 2 decimal places
        return {
          ...item,
          discount: newDiscount,
          amountPayable: newAmountPayable,
        };
      })
    );
  };

  // Function to toggle item selection // REMOVED
  // const toggleItemSelection = (id: string) => { // REMOVED
  //   setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))) // REMOVED
  // }

  // Function to delete selected items // REMOVED
  // const deleteSelectedItems = () => { // REMOVED
  //   const selectedItems = cartItems.filter((item) => item.selected) // REMOVED
  //   setCartItems((prev) => prev.filter((item) => !item.selected)) // REMOVED

  //   // Show notification for deleted items // REMOVED
  //   if (selectedItems.length > 0) { // REMOVED
  //     setNotification({ // REMOVED
  //       message: `${selectedItems.length} item(s) removed from cart`, // REMOVED
  //       type: "info", // REMOVED
  //     }) // REMOVED
  //   } // REMOVED
  // } // REMOVED

  // Function to validate mobile number
  const validateMobileNumber = (mobile: string): boolean => {
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(mobile);
  };

  // Function to generate WhatsApp message and URL
  const generateWhatsAppUrl = (saleId: string) => {
    let message = `🧾 *INVOICE*\n`;
    message += `───────────────\n`;
    message += `*Sale ID:* ${saleId}\n\n`;

    cartItems.forEach((item, index) => {
      message += `*${index + 1}. ${item.brand} - ${item.type}*\n`;
      message += `• Size: ${item.size}\n`;
      message += `• Qty: ${item.quantity}\n`;
      message += `• Unit: ₹${item.unitPrice.toFixed(2)}\n`;
      if (item.discount > 0) {
        message += `• Discount: -₹${item.discount.toFixed(2)}\n`;
      }
      message += `• Subtotal: ₹${item.amountPayable.toFixed(2)}\n`;

      if (index < cartItems.length - 1) {
        message += `───────────────\n`;
      }
    });

    message += `\n🧮 *Summary*\n`;
    message += `───────────────\n`;
    message += `*Total Discount:* ₹${totalDiscount.toFixed(2)}\n`;
    message += `*Final Amount:* ₹${totalAmount.toFixed(2)}\n`;
    message += `*Paid Via:* ${paymentMethod}\n`;

    message += `\n🛍️ *Thank you for shopping!*`;

    const encoded = encodeURIComponent(message);
    const phone = `91${customerMobile}`;
    const url = `https://wa.me/${phone}?text=${encoded}`;

    return url;
  };

  // Function to generate bill and create sale
  const handleGenerateBill = async () => {
    if (cartItems.length === 0) {
      setNotification({ message: "Cart is empty", type: "error" });
      return;
    }

    if (!validateMobileNumber(customerMobile)) {
      setMobileError("Please enter a valid 10-digit mobile number");
      return;
    }

    setMobileError("");

    try {
      const saleData = {
        products: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          selling_price: item.amountPayable,
          cost_price: item.unitPrice, // Assuming cost_price is the same as unitPrice
          brand: item.brand,
          size: item.size,
          type: item.type,
        })),
        total_price: totalAmount,
        final_discount: totalDiscount,
        payment_method: paymentMethod,
        customer_mobile: customerMobile,
        bill_generated: true,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      const data = await response.json();

      if (data.status === 201) {
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

              setGeneratedSaleId(data.data._id);
              setShowSuccessModal(true);
              setShowBillModal(false);

              setTimeout(() => {
                const whatsappUrl = generateWhatsAppUrl(data.data._id);
                window.open(whatsappUrl, "_blank");
              }, 500);
            } else {
              throw new Error(billData.message || "Failed to generate bill");
            }
          } catch (error) {
            console.error("Error generating bill:", error);
            setNotification({
              message:
                "Sale created but failed to generate bill: " +
                (error as Error).message,
              type: "error",
            });
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

    // Validate cart items (if needed, based on your backend requirements)
    const invalidItems = cartItems.filter(
      (item) => !item.type || !item.size || !item.brand
    );
    if (invalidItems.length > 0) {
      console.log("Invalid items:", invalidItems);
      return;
    }

    try {
      const saleData = {
        products: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          selling_price: item.amountPayable,
          cost_price: item.unitPrice, // Assuming cost_price is the same as unitPrice
          type: item.type,
          size: item.size,
          brand: item.brand,
        })),
        total_price: totalAmount,
        final_discount: totalDiscount,
        payment_method: paymentMethod,
        customer_mobile: "", // Not provided for sales without bill
        bill_generated: false,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      const data = await response.json();

      if (data.status === 201) {
        setNotification({
          message: "Sale created successfully",
          type: "success",
        });

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

  // Function to handle barcode input submission for adding products
  // const handleBarcodeSubmit = (e?: React.FormEvent) => { // REMOVED
  //   e?.preventDefault() // Prevent default form submission if it's a form event // REMOVED
  //   if (scannedBarcode.trim()) { // REMOVED
  //     addProductByBarcode(scannedBarcode) // REMOVED
  //   } // REMOVED
  // } // REMOVED

  // Function to handle barcode key down event for adding products
  // const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { // REMOVED
  //   if (e.key === "Enter") { // REMOVED
  //     e.preventDefault() // REMOVED
  //     addProductByBarcode(scannedBarcode) // REMOVED
  //   } // REMOVED
  // } // REMOVED

  // Function to calculate cart summary (used in the checkout section)
  const cartSummary = cartItems.reduce(
    (acc, item) => {
      const itemCostPrice = item.unitPrice * item.quantity;
      const itemSellingPrice = item.amountPayable;
      const itemDiscount = item.discount;

      acc.totalCostPrice += itemCostPrice;
      acc.totalDiscount += itemDiscount;
      acc.totalSellingPrice += itemSellingPrice;
      return acc;
    },
    { totalCostPrice: 0, totalDiscount: 0, totalSellingPrice: 0 }
  );

  // Function to open the payment modal
  // const handleOpenPaymentModal = () => {
  //   if (cartItems.length === 0) {
  //     setNotification({ message: "Cart is empty", type: "error" });
  //     return;
  //   }
  //   // Apply extra discount if any // REMOVED
  //   // if (extraDiscount > 0) { // REMOVED
  //   //   applyExtraDiscount(extraDiscount) // REMOVED
  //   // } // REMOVED
  //   setShowPaymentModal(true);
  // };

  // Function to apply extra discount to the cart items // REMOVED
  // const applyExtraDiscount = (discountPercentage: number) => { // REMOVED
  //   const totalAmountBeforeDiscount = cartSummary.totalSellingPrice // REMOVED
  //   if (totalAmountBeforeDiscount === 0) return // REMOVED

  //   const discountAmount = (totalAmountBeforeDiscount * discountPercentage) / 100 // REMOVED
  //   const newTotalAmount = totalAmountBeforeDiscount - discountAmount // REMOVED

  //   // Distribute discount proportionally to items // REMOVED
  //   setCartItems((prev) => // REMOVED
  //     prev.map((item) => { // REMOVED
  //       const itemValue = item.amountPayable // Use current amount payable // REMOVED
  //       const additionalDiscount = (itemValue / totalAmountBeforeDiscount) * discountAmount // REMOVED
  //       const newItemAmountPayable = Math.round((item.amountPayable - additionalDiscount) * 100) / 100 // REMOVED
  //       const newItemDiscount = Math.round((item.discount + additionalDiscount) * 100) / 100 // REMOVED

  //       return { // REMOVED
  //         ...item, // REMOVED
  //         discount: newItemDiscount, // REMOVED
  //         amountPayable: newItemAmountPayable, // REMOVED
  //       } // REMOVED
  //     }), // REMOVED
  //   ) // REMOVED
  //   setExtraDiscount(0) // Reset extra discount input // REMOVED
  // } // REMOVED

  // Function to clear the entire cart
  const clearCart = () => {
    setCartItems([]);
    setNotification({ message: "Cart cleared", type: "info" });
  };

  // Function to remove an item from the cart
  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    setNotification({ message: "Item removed from cart", type: "info" });
  };

  return (
    <>
      <style>
        {`
          input[type="number"] {
            -moz-appearance: textfield;
          }
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        `}
      </style>
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

      {showSuccessModal && generatedSaleId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              🎉 Sale Created Successfully!
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Your sale has been created and the bill has been sent on WhatsApp.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  window.location.href = `/sales-cart-history/${generatedSaleId}`;
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                👁️ View Bill Details
              </button>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setGeneratedSaleId(null);
                  // Clear cart and reset form
                  setCartItems([]);
                  setCustomerMobile("");
                  setPaymentMethod("Card");
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
              >
                ➕ Create New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal (Assuming this is a new addition for payment processing) */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Payment
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Please select your payment method.
            </p>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Payment Method:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsProcessing(true);
                  // Here you would integrate with a payment gateway
                  // For now, we'll simulate a successful payment and proceed to bill generation
                  setTimeout(() => {
                    setShowPaymentModal(false);
                    setShowBillModal(true); // Proceed to bill generation modal
                    setIsProcessing(false);
                  }, 1000);
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium active:scale-95 transition-transform"
              >
                {isProcessing ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 lg:px-6 lg:py-4">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 lg:text-lg">
                Cart Items ({cartItems.length})
              </h3>
            </div>

            <div className="p-4 lg:p-0">
              {/* Mobile Card View */}
              <div className="flex flex-col gap-3 lg:hidden">
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="mb-3 text-4xl">🛒</div>
                    <p className="text-sm">Your cart is empty</p>
                    <p className="mt-1 text-xs">Add products to get started</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {item.brand}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {item.type} • {item.size}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors active:scale-95"
                          aria-label="Remove item"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M18 6L6 18M6 6L18 18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 active:scale-95 transition-transform"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 12H19"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                          <span className="w-10 text-center font-semibold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white active:scale-95 transition-transform"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 5V19M5 12H19"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            ₹{item.amountPayable.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ₹{item.unitPrice.toFixed(2)} each
                          </div>
                        </div>
                      </div>

                      {item.discount > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-green-600 dark:text-green-400">
                              Discount
                            </span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              -₹{item.discount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block max-w-full overflow-x-auto">
                <div className="min-w-[800px]">
                  <table className="table-auto w-full">
                    <thead className="border-gray-100 dark:border-gray-800 border-y">
                      <tr>
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
                          Cost Price
                        </th>
                        <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                          Discount
                        </th>
                        <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                          Amount
                        </th>
                        <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 px-4">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {cartItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-12 text-center text-gray-500 dark:text-gray-400"
                          >
                            <div className="mb-3 text-4xl">🛒</div>
                            <p>Your cart is empty</p>
                            <p className="mt-1 text-sm">
                              Add products to get started
                            </p>
                          </td>
                        </tr>
                      ) : (
                        cartItems.map((item) => (
                          <tr key={item.id}>
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
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M5 12H19"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12 5V19M5 12H19"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                              ₹{item.unitPrice.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300">
                              ₹{item.discount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-gray-700 text-sm dark:text-gray-300 font-medium">
                              ₹{item.amountPayable.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                aria-label="Remove item"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M18 6L6 18M6 6L18 18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="p-4 lg:p-6">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4 lg:text-lg">
                Order Summary
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{cartSummary.totalCostPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Discount
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    -₹{cartSummary.totalDiscount.toFixed(2)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ₹{cartSummary.totalSellingPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Barcode
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addProductByBarcode(barcode);
                        }
                      }}
                      placeholder="Enter barcode number"
                      className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    <button
                      onClick={() => addProductByBarcode(barcode)}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium active:scale-95 transition-transform"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Final Amount (Direct Edit)
                  </label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => handleFinalAmountChange(e.target.value)}
                    placeholder="Final amount"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Edit to apply discount automatically
                  </p>
                </div>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={cartItems.length === 0}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium active:scale-95 transition-transform"
                >
                  Proceed to Payment
                </button>

                <button
                  onClick={clearCart}
                  disabled={cartItems.length === 0}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium active:scale-95 transition-transform"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
