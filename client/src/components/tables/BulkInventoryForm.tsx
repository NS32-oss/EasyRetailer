"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { PlusIcon } from "../../icons";

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

interface SizeEntry {
  size: string;
  quantity: number;
}

interface BulkInventoryFormProps {
  onSuccess?: (result?: any) => void;
  onCancel?: () => void;
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

export default function BulkInventoryForm({
  onSuccess,
}: BulkInventoryFormProps) {
  // form state
  const [formData, setFormData] = useState({
    brand: "",
    typeId: "", // changed to store ObjectId
    subtypeId: "", // changed to store ObjectId
    cost_price: "",
    unit_price: "",
  });

  // sizes state
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, SizeEntry>>(
    {}
  );

  // loading / error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Brand autocomplete states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [newBrand, setNewBrand] = useState(false);
  const [brandInputValue, setBrandInputValue] = useState("");

  // Type autocomplete states
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<ProductType[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [typeInputValue, setTypeInputValue] = useState("");

  // Subtype autocomplete states
  const [subtypes, setSubtypes] = useState<ProductSubtype[]>([]);
  const [filteredSubtypes, setFilteredSubtypes] = useState<ProductSubtype[]>([]);
  const [showSubtypeDropdown, setShowSubtypeDropdown] = useState(false);
  const [subtypeInputValue, setSubtypeInputValue] = useState("");
  const [newSubtype, setNewSubtype] = useState(false);

  const [typeLoadingSubtypes, setTypeLoadingSubtypes] = useState(false);

  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const subtypeDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch brands, types on mount
  useEffect(() => {
    fetchBrands();
    fetchTypes();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/brand`);
      const data = await response.json();
      if (data.status === 200) {
        setBrands(data.data);
      }
    } catch (err) {
      console.error("Error fetching brands:", err);
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

  // Filter brands based on input
  useEffect(() => {
    if (brandInputValue) {
      const filtered = brands.filter((b) =>
        b.name.toLowerCase().includes(brandInputValue.toLowerCase())
      );
      setFilteredBrands(filtered);
      setNewBrand(filtered.length === 0 && brandInputValue.trim() !== "");
    } else {
      setFilteredBrands(brands);
      setNewBrand(false);
    }
  }, [brandInputValue, brands]);

  // Filter types based on input
  useEffect(() => {
    if (typeInputValue) {
      const filtered = productTypes.filter((t) =>
        t.name.toLowerCase().includes(typeInputValue.toLowerCase())
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

  // Outside click handlers
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handleBrandSelect = (brandId: string, brandName: string) => {
    setBrandInputValue(brandName);
    setFormData((prev) => ({ ...prev, brand: brandId }));
    setShowBrandDropdown(false);
  };

  const handleTypeSelect = (typeId: string, typeName: string, sizes: string[]) => {
    setTypeInputValue(typeName);
    setFormData((prev) => ({ ...prev, typeId, subtypeId: "" }));
    setSubtypeInputValue("");
    setAvailableSizes(sizes);
    setSelectedSizes({});
    setShowTypeDropdown(false);

    // Fetch subtypes for this type
    fetchSubtypesByType(typeId);
  };

  const handleSubtypeSelect = (subtypeId: string, subtypeName: string) => {
    setSubtypeInputValue(subtypeName);
    setFormData((prev) => ({ ...prev, subtypeId }));
    setShowSubtypeDropdown(false);
  };

  const handleCreateBrand = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } catch (err) {
      console.error("Error creating brand:", err);
      setError("Failed to create new brand");
    }
  };

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

  // Size selection handlers
  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) => {
      const copy = { ...prev };
      if (copy[sz]) delete copy[sz];
      else copy[sz] = { size: sz, quantity: 1 };
      return copy;
    });
  };

  const setQtyForSize = (sz: string, qty: number) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [sz]: { size: sz, quantity: qty },
    }));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.brand || !formData.typeId) {
      setError("Brand and type are required.");
      return;
    }
    if (!formData.cost_price || !formData.unit_price) {
      setError("Cost price and unit price are required.");
      return;
    }
    if (Number(formData.unit_price) <= Number(formData.cost_price)) {
      setError("Unit price must be greater than cost price.");
      return;
    }
    const sizes = Object.values(selectedSizes);
    if (sizes.length === 0) {
      setError("Select at least one size.");
      return;
    }
    for (const s of sizes) {
      if (!s.quantity || s.quantity < 1) {
        setError("Quantity for each selected size must be at least 1.");
        return;
      }
    }

    setLoading(true);

    const payload = {
      brand: formData.brand,
      type: formData.typeId,
      subtype: formData.subtypeId,
      cost_price: Number(formData.cost_price),
      unit_price: Number(formData.unit_price),
      sizes: sizes.map((s) => ({ size: s.size, quantity: s.quantity })),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/product/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body?.message || `HTTP ${res.status}`);
      }

      if (onSuccess) {
        const productsSummary = Object.entries(selectedSizes).map(([, entry]) => ({
          brand: brandInputValue,
          type: typeInputValue,
          subtype: subtypeInputValue,
          sizes: [{ size: entry.size, quantity: entry.quantity }],
          cost_price: Number(formData.cost_price) || 0,
          unit_price: Number(formData.unit_price) || 0,
        }));
        console.log("DEBUG BulkInventoryForm - onSuccess summary:", JSON.stringify(productsSummary, null, 2));
        console.log("DEBUG - brandInputValue:", brandInputValue, "typeInputValue:", typeInputValue, "formData.cost_price:", formData.cost_price);
        onSuccess(productsSummary);
      }

      // Reset form
      setFormData({
        brand: "",
        typeId: "",
        subtypeId: "",
        cost_price: "",
        unit_price: "",
      });
      setBrandInputValue("");
      setTypeInputValue("");
      setSubtypeInputValue("");
      setAvailableSizes([]);
      setSelectedSizes({});
      setSubtypes([]);
    } catch (err: any) {
      setError(err.message || "Failed to add bulk products.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-lg">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Add Bulk Products
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Add multiple sizes at once for the same product
        </p>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm">
            {error}
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
                  filteredBrands.map((b) => (
                    <div
                      key={b._id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-700 dark:text-white text-sm"
                      onClick={() => handleBrandSelect(b._id, b.name)}
                    >
                      {b.name}
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
                  filteredTypes.map((t) => (
                    <div
                      key={t._id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-700 dark:text-white text-sm"
                      onClick={() => handleTypeSelect(t._id, t.name, t.sizes)}
                    >
                      {t.name}
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

          {/* Cost Price Field */}
          <div>
            <Label>Cost Price</Label>
            <Input
              name="cost_price"
              type="number"
              value={formData.cost_price}
              onChange={(e: any) =>
                setFormData((p) => ({ ...p, cost_price: e.target.value }))
              }
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
              onChange={(e: any) =>
                setFormData((p) => ({ ...p, unit_price: e.target.value }))
              }
              min="0"
              step={0.01}
              className="w-full"
            />
          </div>

          {availableSizes.length > 0 && (
            <div>
              <Label>Select Sizes</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Tap to select sizes for this product
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => {
                  const checked = Boolean(selectedSizes[sz]);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`px-4 py-2 rounded-xl border font-medium text-sm active:scale-95 transition-all ${
                        checked
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {sz.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {Object.keys(selectedSizes).length > 0 && (
            <div>
              <Label>Set Quantities</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Enter quantity for each selected size
              </p>
              <div className="space-y-3">
                {Object.values(selectedSizes).map((s) => (
                  <div
                    key={s.size}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-16 font-bold text-sm text-gray-900 dark:text-white">
                      {s.size.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={s.quantity}
                        onChange={(e: any) =>
                          setQtyForSize(s.size, Number(e.target.value))
                        }
                        min="1"
                        className="w-full"
                        placeholder="Qty"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSize(s.size)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <PlusIcon className="h-5 w-5" />{" "}
              {loading ? "Adding..." : "Add Bulk Products"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
