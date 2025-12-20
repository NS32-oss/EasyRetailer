"use client";
interface InventoryFormProps {
  onSuccess?: (result?: any) => void;
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
  sizes: string[];
}

interface ProductSubtype {
  _id: string;
  name: string;
  type: string;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

export default function InventoryForm({ onSuccess }: InventoryFormProps) {
  // Form state
  const [formData, setFormData] = useState({
    brand: "",
    typeId: "",
    subtypeId: "",
    size: "",
    quantity: 1,
    cost_price: 0,
    unit_price: 0,
  });

  // Dropdown data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [newBrand, setNewBrand] = useState(false);
  const [brandInputValue, setBrandInputValue] = useState("");

  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<ProductType[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [typeInputValue, setTypeInputValue] = useState("");

  const [subtypes, setSubtypes] = useState<ProductSubtype[]>([]);
  const [filteredSubtypes, setFilteredSubtypes] = useState<ProductSubtype[]>([]);
  const [showSubtypeDropdown, setShowSubtypeDropdown] = useState(false);
  const [subtypeInputValue, setSubtypeInputValue] = useState("");
  const [newSubtype, setNewSubtype] = useState(false);

  const [typeLoadingSubtypes, setTypeLoadingSubtypes] = useState(false);

  // Size options from selected type
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Refs for dropdowns
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const subtypeDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch brands and product types on component mount
  useEffect(() => {
    fetchBrands();
    fetchTypes();
  }, []);

  // Filter brands based on input
  useEffect(() => {
    if (brandInputValue) {
      const filtered = brands.filter((brand) =>
        brand.name.toLowerCase().includes(brandInputValue.toLowerCase())
      );
      setFilteredBrands(filtered);
      setNewBrand(filtered.length === 0 && brandInputValue.trim() !== "");
    } else {
      setFilteredBrands(brands);
      setNewBrand(false);
    }
  }, [brandInputValue, brands]);

  // Filter product types based on input
  useEffect(() => {
    if (typeInputValue) {
      const filtered = productTypes.filter((type) =>
        type.name.toLowerCase().includes(typeInputValue.toLowerCase())
      );
      setFilteredTypes(filtered);
    } else {
      setFilteredTypes(productTypes);
    }
  }, [typeInputValue, productTypes]);

  // Filter subtypes based on input
  useEffect(() => {
    if (subtypeInputValue) {
      const filtered = subtypes.filter((s) =>
        s.name.toLowerCase().includes(subtypeInputValue.toLowerCase())
      );
      setFilteredSubtypes(filtered);
      setNewSubtype(filtered.length === 0 && subtypeInputValue.trim() !== "");
    } else {
      setFilteredSubtypes(subtypes);
      setNewSubtype(false);
    }
  }, [subtypeInputValue, subtypes]);

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
      if (
        subtypeDropdownRef.current &&
        !subtypeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSubtypeDropdown(false);
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
        setBrands(data.data);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/types`);
      const data = await response.json();
      if (data.status === 200 || Array.isArray(data.data)) {
        const types = Array.isArray(data.data) ? data.data : data.data || [];
        setProductTypes(types);
      }
    } catch (err) {
      console.error("Error fetching types:", err);
    }
  };

  const fetchSubtypesByType = async (typeId: string) => {
    if (!typeId) {
      setSubtypes([]);
      setFilteredSubtypes([]);
      return;
    }
    setTypeLoadingSubtypes(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/subtypes/type/${typeId}`
      );
      const data = await response.json();
      if (data.status === 200 || Array.isArray(data.data)) {
        const fetchedSubtypes = Array.isArray(data.data) ? data.data : data.data || [];
        setSubtypes(fetchedSubtypes);
      }
    } catch (err) {
      console.error("Error fetching subtypes:", err);
    } finally {
      setTypeLoadingSubtypes(false);
    }
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
  const handleBrandSelect = (brandId: string, brandName: string) => {
    setBrandInputValue(brandName);
    setFormData((prev) => ({ ...prev, brand: brandId }));
    setShowBrandDropdown(false);
  };

  // Handle type selection
  const handleTypeSelect = (typeId: string, typeName: string, sizes: string[]) => {
    setTypeInputValue(typeName);
    setFormData((prev) => ({ ...prev, typeId, subtypeId: "", size: "" }));
    setSubtypeInputValue("");
    setAvailableSizes(sizes);
    setShowTypeDropdown(false);
    fetchSubtypesByType(typeId);
  };

  // Handle subtype selection
  const handleSubtypeSelect = (subtypeId: string, subtypeName: string) => {
    setSubtypeInputValue(subtypeName);
    setFormData((prev) => ({ ...prev, subtypeId }));
    setShowSubtypeDropdown(false);
  };

  // Create new brand
  const handleCreateBrand = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/brand`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: brandInputValue }),
      });

      const data = await response.json();
      if (data.status === 201) {
        setBrands((prev) =>
          Array.isArray(prev) ? [...prev, data.data] : [data.data]
        );
        handleBrandSelect(data.data._id, data.data.name);
        setNewBrand(false);
      } else {
        setError("Failed to create new brand");
      }
    } catch (error) {
      console.error("Error creating brand:", error);
      setError("Failed to create new brand");
    }
  };

  // Create new subtype
  const handleCreateSubtype = async () => {
    if (!formData.typeId) {
      setError("Please select a type first");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/subtypes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subtypeInputValue,
          typeId: formData.typeId,
        }),
      });
      const data = await response.json();
      if (data.status === 201) {
        setSubtypes((prev) =>
          Array.isArray(prev) ? [...prev, data.data] : [data.data]
        );
        handleSubtypeSelect(data.data._id, data.data.name);
        setNewSubtype(false);
      } else {
        setError(data.message || "Failed to create new subtype");
      }
    } catch (err: any) {
      console.error("Error creating subtype:", err);
      setError(err.message || "Failed to create new subtype");
    }
  };

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
        body: JSON.stringify({
          brand: formData.brand,
          type: formData.typeId,
          subtype: formData.subtypeId,
          size: formData.size,
          quantity: formData.quantity,
          cost_price: formData.cost_price,
          unit_price: formData.unit_price,
        }),
      });

      const data = await response.json();

      if (data.status === 201 || data.status === 200) {
        setSuccess(data.status === 201 ? "Product added successfully!" : "Product updated successfully!");
        if (onSuccess) {
          const summary = {
            brand: brandInputValue,
            type: typeInputValue,
            subtype: subtypeInputValue,
            sizes: [{ size: formData.size, quantity: formData.quantity }],
            cost_price: Number(formData.cost_price) || 0,
            unit_price: Number(formData.unit_price) || 0,
            barcode: data.data?.barcode || "",
          };
          onSuccess(summary);
        }

        // Reset form
        setFormData({
          brand: "",
          typeId: "",
          subtypeId: "",
          size: "",
          quantity: 1,
          cost_price: 0,
          unit_price: 0,
        });
        setBrandInputValue("");
        setTypeInputValue("");
        setSubtypeInputValue("");
        setAvailableSizes([]);
        setSubtypes([]);
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
              value={brandInputValue}
              onChange={(e: any) => setBrandInputValue(e.target.value)}
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
                      onClick={() => handleBrandSelect(brand._id, brand.name)}
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
                    + Save "{brandInputValue}" as new brand
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Type Field with Autocomplete */}
          <div className="relative" ref={typeDropdownRef}>
            <Label>Type</Label>
            <Input
              name="type"
              value={typeInputValue}
              onChange={(e: any) => setTypeInputValue(e.target.value)}
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
                      onClick={() => handleTypeSelect(type._id, type.name, type.sizes)}
                    >
                      {type.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                    No product types found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subtype Field with Dependent Dropdown */}
          {formData.typeId && (
            <div className="relative" ref={subtypeDropdownRef}>
              <Label>Subtype</Label>
              {typeLoadingSubtypes && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Loading subtypes...
                </div>
              )}
              <Input
                name="subtype"
                value={subtypeInputValue}
                onChange={(e: any) => setSubtypeInputValue(e.target.value)}
                onFocus={() => setShowSubtypeDropdown(true)}
                placeholder="Enter or select product subtype"
                className="w-full"
                disabled={typeLoadingSubtypes || subtypes.length === 0}
              />

              {showSubtypeDropdown && !typeLoadingSubtypes && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-700">
                  {filteredSubtypes.length > 0 ? (
                    filteredSubtypes.map((s) => (
                      <div
                        key={s._id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-700 dark:text-white text-sm"
                        onClick={() => handleSubtypeSelect(s._id, s.name)}
                      >
                        {s.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                      No subtypes found
                    </div>
                  )}

                  {newSubtype && (
                    <div
                      className="px-4 py-3 text-blue-600 border-t border-gray-200 hover:bg-blue-50 cursor-pointer dark:border-gray-700 dark:text-blue-400 dark:hover:bg-blue-900/30 text-sm font-medium"
                      onClick={handleCreateSubtype}
                    >
                      + Save "{subtypeInputValue}" as new subtype
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Size Field - Dynamic based on Type */}
          {availableSizes.length > 0 && (
            <div>
              <Label>Size</Label>
              <select
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
              >
                <option value="">Select size</option>
                {availableSizes.map((size) => (
                  <option key={size} value={size}>
                    {size.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

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
