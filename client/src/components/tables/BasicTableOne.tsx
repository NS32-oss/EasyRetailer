"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useDropzone } from "react-dropzone";

interface Brand {
  _id: string;
  name: string;
}

interface ProductType {
  _id: string;
  name: string;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

export default function InventoryForm() {
  // Form state
  const [formData, setFormData] = useState({
    brand: "",
    size: "M",
    type: "",
    subtype: "",
    quantity: 1,
    cost_price: 0,
    unit_price: 0,
  });

  // Dropdown data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [newBrand, setNewBrand] = useState(false);

  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<ProductType[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [newType, setNewType] = useState(false);

  // Size options
  const sizeOptions = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "3XL",
    "4XL",
    "5XL",
    "6XL",
    "7XL",
  ];

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Refs for dropdowns
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch brands and product types on component mount
  useEffect(() => {
    fetchBrands();
    fetchProductTypes();
  }, []);

  // Filter brands based on input
  useEffect(() => {
    if (formData.brand) {
      const filtered = brands.filter((brand) =>
        brand.name.toLowerCase().includes(formData.brand.toLowerCase())
      );
      setFilteredBrands(filtered);
      setNewBrand(filtered.length === 0 && formData.brand.trim() !== "");
    } else {
      setFilteredBrands(brands);
      setNewBrand(false);
    }
  }, [formData.brand, brands]);

  // Filter product types based on input
  useEffect(() => {
    if (formData.type) {
      const filtered = productTypes.filter((type) =>
        type.name.toLowerCase().includes(formData.type.toLowerCase())
      );
      setFilteredTypes(filtered);
      setNewType(filtered.length === 0 && formData.type.trim() !== "");
    } else {
      setFilteredTypes(productTypes);
      setNewType(false);
    }
  }, [formData.type, productTypes]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBrandDropdown(false);
      }
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch brands from API
  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/brand`);
      const data = await response.json();
      if (data.status === 200) {
        setBrands(data.data.brands);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      // If API fails, use some default brands
      setBrands([
        { _id: "1", name: "Gucci" },
        { _id: "2", name: "H&M" },
        { _id: "3", name: "Zara" },
        { _id: "4", name: "Nike" },
        { _id: "5", name: "Adidas" },
      ]);
    }
  };

  // Fetch product types from API
  const fetchProductTypes = async () => {
    setProductTypes([
      { _id: "1", name: "Shirt" },
      { _id: "2", name: "Pant" },
      { _id: "3", name: "Trouser" },
      { _id: "4", name: "Handkerchief" },
      { _id: "5", name: "Blazer" },
      { _id: "6", name: "Sweater" },
    ]);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "cost_price" || name === "unit_price"
          ? Number(value)
          : value,
    }));
  };

  // Handle brand selection
  const handleBrandSelect = (brandName: string) => {
    setFormData((prev) => ({ ...prev, brand: brandName }));
    setShowBrandDropdown(false);
  };

  // Handle type selection
  const handleTypeSelect = (typeName: string) => {
    setFormData((prev) => ({ ...prev, type: typeName }));
    setShowTypeDropdown(false);
  };

  // Create new brand
  const handleCreateBrand = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/brand`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: formData.brand }),
      });

      const data = await response.json();

      if (data.status === 201) {
        // Add the new brand to the list
        setBrands((prev) => [...prev, data.data.brand]);
        setNewBrand(false);
      } else {
        setError("Failed to create new brand");
      }
    } catch (error) {
      console.error("Error creating brand:", error);
      setError("Failed to create new brand");

      // For demo purposes, add the brand locally if API fails
      const newBrandObj = { _id: Date.now().toString(), name: formData.brand };
      setBrands((prev) => [...prev, newBrandObj]);
      setNewBrand(false);
    }
  };

  // Create new product type
  // const handleCreateType = async () => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/api/v1/product-types`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ name: formData.type }),
  //     });

  //     const data = await response.json();

  //     if (data.status === 201) {
  //       // Add the new type to the list
  //       setProductTypes((prev) => [...prev, data.data.type]);
  //       setNewType(false);
  //     } else {
  //       setError("Failed to create new product type");
  //     }
  //   } catch (error) {
  //     console.error("Error creating product type:", error);
  //     setError("Failed to create new product type");

  //     // For demo purposes, add the type locally if API fails
  //     const newTypeObj = { _id: Date.now().toString(), name: formData.type };
  //     setProductTypes((prev) => [...prev, newTypeObj]);
  //     setNewType(false);
  //   }
  // };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status === 201) {
        setSuccess("Product added successfully!");
        // Reset form
        setFormData({
          brand: "",
          size: "M",
          type: "",
          subtype: "",
          quantity: 1,
          cost_price: 0,
          unit_price: 0,
        });
      } else {
        setError(data.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Dropzone for image upload (optional feature)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      console.log("Files dropped:", acceptedFiles);
      // Handle file uploads here
    },
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Add New Product
          </h3>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md dark:bg-green-900/30 dark:text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand Field with Autocomplete */}
        <div className="relative" ref={brandDropdownRef}>
          <Label>Brand</Label>
          <Input
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            onFocus={() => setShowBrandDropdown(true)}
            placeholder="Enter brand name"
            className="w-full"
          />

          {showBrandDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-700">
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <div
                    key={brand._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700"
                    onClick={() => handleBrandSelect(brand.name)}
                  >
                    {brand.name}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                  No brands found
                </div>
              )}

              {newBrand && (
                <div
                  className="px-4 py-2 text-blue-600 border-t border-gray-200 hover:bg-blue-50 cursor-pointer dark:border-gray-700 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  onClick={handleCreateBrand}
                >
                  + Save "{formData.brand}" as new brand
                </div>
              )}
            </div>
          )}
        </div>

        {/* Size Field */}
        <div>
          <Label>Size</Label>
          <select
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Type Field with Autocomplete */}
        <div className="relative" ref={typeDropdownRef}>
          <Label>Type</Label>
          <Input
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            onFocus={() => setShowTypeDropdown(true)}
            placeholder="Enter product type"
            className="w-full"
          />

          {showTypeDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-700">
              {filteredTypes.length > 0 ? (
                filteredTypes.map((type) => (
                  <div
                    key={type._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700"
                    onClick={() => handleTypeSelect(type.name)}
                  >
                    {type.name}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                  No product types found
                </div>
              )}

              {newType && (
                <div
                  className="px-4 py-2 text-blue-600 border-t border-gray-200 hover:bg-blue-50 cursor-pointer dark:border-gray-700 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  + Save "{formData.type}" as new product type
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subtype Field */}
        <div>
          <Label>Subtype</Label>
          <Input
            name="subtype"
            value={formData.subtype}
            onChange={handleInputChange}
            placeholder="Enter product subtype"
            className="w-full"
          />
        </div>

        {/* Quantity Field */}
        <div>
          <Label>Quantity</Label>
          <Input
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            min="1"
            className="w-full"
          />
        </div>

        {/* Cost Price Field */}
        <div>
          <Label>Cost Price</Label>
          <Input
            name="cost_price"
            type="number"
            value={formData.cost_price}
            onChange={handleInputChange}
            min="0"
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Unit Price Field */}
        <div>
          <Label>Sales Price</Label>
          <Input
            name="unit_price"
            type="number"
            value={formData.unit_price}
            onChange={handleInputChange}
            min="0"
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Optional: Image Upload */}
        <div>
          <Label>Product Image (Optional)</Label>
          <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
            <div
              {...getRootProps()}
              className={`dropzone rounded-xl border-dashed border-gray-300 p-7
                ${
                  isDragActive
                    ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                    : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                }
              `}
            >
              {/* Hidden Input */}
              <input {...getInputProps()} />

              <div className="flex flex-col items-center m-0">
                {/* Icon Container */}
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    <svg
                      className="fill-current"
                      width="24"
                      height="24"
                      viewBox="0 0 29 28"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Text Content */}
                <h4 className="mb-2 font-semibold text-gray-800 dark:text-white/90">
                  {isDragActive ? "Drop Files Here" : "Drag & Drop Files Here"}
                </h4>

                <span className="text-center mb-3 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                  Drag and drop your product image or browse
                </span>

                <span className="font-medium underline text-sm text-blue-500">
                  Browse File
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
