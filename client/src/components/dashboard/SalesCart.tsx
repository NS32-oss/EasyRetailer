"use client";

import { useEffect, useState } from "react";

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

export default function SalesCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState("");
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate totals whenever cart items change
  useEffect(() => {
    const discount = cartItems.reduce(
      (sum, item) => sum + item.discount * item.quantity,
      0
    );
    const amount = cartItems.reduce((sum, item) => sum + item.amountPayable, 0);

    setTotalDiscount(discount);
    setTotalAmount(amount);
  }, [cartItems]);

  // Function to add a product by barcode
  const addProductByBarcode = async () => {
    if (!barcode.trim()) return;

    try {
      // Fetch product details from the API
      const response = await fetch(
        `http://localhost:8000/api/v1/product/barcode/${barcode}`
      );
      const data = await response.json();
      console.log("Product data:", data);

      if (data.status==200) {
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
      } else {
        alert("Product not found");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Failed to fetch product");
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
    setCartItems((prev) => prev.filter((item) => !item.selected));
  };

  // Function to create sale and redirect to dashboard
  const createSale = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      // Send the sale data to your API
      const saleData = {
        items: cartItems.map((item) => ({
          brand: item.brand,
          size: item.size,
          type: item.type,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          amountPayable: item.amountPayable,
        })),
        totalDiscount,
        totalAmount,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch("http://localhost:8000/api/v1/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        console.log("Sale created:", saleData);
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        throw new Error("Failed to create sale");
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      alert("Failed to create sale");
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Sales Cart
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-40 sm:w-60 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addProductByBarcode();
                }
              }}
            />
            <button
              onClick={addProductByBarcode}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Add Product
            </button>
          </div>
          <button
            onClick={deleteSelectedItems}
            disabled={!cartItems.some((item) => item.selected)}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 ${
              !cartItems.some((item) => item.selected)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            Delete Selected
          </button>
        </div>
      </div>
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
                          onClick={() => handleQuantityChange(item.id, false)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="h-6 w-6 flex items-center justify-center border border-gray-300 rounded dark:border-gray-700"
                          onClick={() => handleQuantityChange(item.id, true)}
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

      {/* Summary Section */}
      {cartItems.length > 0 && (
        <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex justify-between sm:w-64">
              <span className="text-gray-600 dark:text-gray-400">
                Total Discount:
              </span>
              <span className="font-medium text-gray-800 dark:text-white">
                ₹{totalDiscount.toFixed(2)}
              </span>
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
              onClick={createSale}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 font-medium"
            >
              Create Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
