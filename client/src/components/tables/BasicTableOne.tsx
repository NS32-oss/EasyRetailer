"use client";
interface InventoryFormProps {
  onSuccess?: () => void;
}

import type React from "react";
import { useState, useEffect, useRef } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { PlusIcon } from "@heroicons/react/24/outline";

interface Brand {
  _id: string;
  name: string;
}

interface ProductType {
  _id: string;
  name: string;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

export default function InventoryForm({ onSuccess }: InventoryFormProps) {
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
  const [brands, setBrands] = useState<Brand[]>([]); // Initialize as an empty array

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
      const filtered = (brands || []).filter((brand) =>
        brand.name.toLowerCase().includes(formData.brand.toLowerCase())
      );
      setFilteredBrands(filtered);
      setNewBrand(filtered.length === 0 && formData.brand.trim() !== "");
    } else {
      setFilteredBrands(brands || []);
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
      // console.log("Brands data:", data);
      if (data.status === 200) {
        setBrands(data.data);
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
        setBrands((prev) =>
          Array.isArray(prev) ? [...prev, data.data] : [data.data]
        );
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
        if (onSuccess) onSuccess();

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

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Add New Product
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Fill in the details to add a product to inventory
        </p>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-700">
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((brand) => (
                    <div
                      key={brand._id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-700 dark:text-white text-sm"
                      onClick={() => handleBrandSelect(brand.name)}
                    >
                      {brand.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                    No brands found
                  </div>
                )}

                {newBrand && (
                  <div
                    className="px-4 py-3 text-blue-600 border-t border-gray-200 hover:bg-blue-50 cursor-pointer dark:border-gray-700 dark:text-blue-400 dark:hover:bg-blue-900/30 text-sm font-medium"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
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
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-700">
                {filteredTypes.length > 0 ? (
                  filteredTypes.map((type) => (
                    <div
                      key={type._id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-700 dark:text-white text-sm"
                      onClick={() => handleTypeSelect(type.name)}
                    >
                      {type.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                    No product types found
                  </div>
                )}

                {newType && (
                  <div
                    className="px-4 py-3 text-blue-600 border-t border-gray-200 hover:bg-blue-50 cursor-pointer dark:border-gray-700 dark:text-blue-400 dark:hover:bg-blue-900/30 text-sm font-medium"
                    onClick={handleCreateBrand}
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <PlusIcon className="h-5 w-5" />{" "}
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
