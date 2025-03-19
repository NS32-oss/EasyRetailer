import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search } from "lucide-react";

// Mock data - would be fetched from API in real app
const mockProducts = [
  {
    id: "P001",
    barcode: "123456789",
    brand: "Levi's",
    type: "Jeans",
    subtype: "Slim Fit",
    size: "32",
    color: "Blue",
    quantity: 25,
    costPrice: 45,
    unitPrice: 89.99,
  },
  {
    id: "P002",
    barcode: "223456789",
    brand: "Nike",
    type: "T-Shirt",
    subtype: "Round Neck",
    size: "M",
    color: "Black",
    quantity: 40,
    costPrice: 15,
    unitPrice: 29.99,
  },
  {
    id: "P003",
    barcode: "323456789",
    brand: "Adidas",
    type: "Jacket",
    subtype: "Windbreaker",
    size: "L",
    color: "Red",
    quantity: 15,
    costPrice: 60,
    unitPrice: 119.99,
  },
  {
    id: "P004",
    barcode: "423456789",
    brand: "H&M",
    type: "Shirt",
    subtype: "Formal",
    size: "M",
    color: "White",
    quantity: 30,
    costPrice: 25,
    unitPrice: 49.99,
  },
  {
    id: "P005",
    barcode: "523456789",
    brand: "Zara",
    type: "Trousers",
    subtype: "Chinos",
    size: "34",
    color: "Beige",
    quantity: 20,
    costPrice: 35,
    unitPrice: 69.99,
  },
];

export default function InventoryPage() {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterType, setFilterType] = useState("");

  // New product form state
  const [newProduct, setNewProduct] = useState({
    brand: "",
    type: "",
    subtype: "",
    size: "",
    color: "",
    quantity: "",
    costPrice: "",
    unitPrice: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();

    // In a real app, you would send this to your API
    const newProductWithId = {
      ...newProduct,
      id: `P${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      barcode: Math.floor(Math.random() * 1000000000).toString(),
      quantity: Number.parseInt(newProduct.quantity),
      costPrice: Number.parseFloat(newProduct.costPrice),
      unitPrice: Number.parseFloat(newProduct.unitPrice),
    };

    setProducts([...products, newProductWithId]);

    // Reset form
    setNewProduct({
      brand: "",
      type: "",
      subtype: "",
      size: "",
      color: "",
      quantity: "",
      costPrice: "",
      unitPrice: "",
    });
  };

  // Filter products based on search term and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm);

    const matchesBrand = filterBrand ? product.brand === filterBrand : true;
    const matchesType = filterType ? product.type === filterType : true;

    return matchesSearch && matchesBrand && matchesType;
  });

  // Get unique brands and types for filters
  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand)));
  const uniqueTypes = Array.from(new Set(products.map((p) => p.type)));

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">Manage your product inventory</p>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="add">Add Product</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <CardTitle>Product List</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="w-full pl-8 md:w-[200px] lg:w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    value={filterBrand}
                    onValueChange={(value) => setFilterBrand(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {uniqueBrands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterType}
                    onValueChange={(value) => setFilterType(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Cost Price</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.id}</TableCell>
                          <TableCell>{product.barcode}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>{product.type}</TableCell>
                          <TableCell>{product.size}</TableCell>
                          <TableCell>{product.color}</TableCell>
                          <TableCell className="text-right">
                            {product.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            ${product.costPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${product.unitPrice.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>
                Enter the details of the new product to add to inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={newProduct.brand}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Input
                      id="type"
                      name="type"
                      value={newProduct.type}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtype">Subtype</Label>
                    <Input
                      id="subtype"
                      name="subtype"
                      value={newProduct.subtype}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      name="size"
                      value={newProduct.size}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={newProduct.color}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      value={newProduct.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price ($)</Label>
                    <Input
                      id="costPrice"
                      name="costPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.costPrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price ($)</Label>
                    <Input
                      id="unitPrice"
                      name="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.unitPrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
