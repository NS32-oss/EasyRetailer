import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Search, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock sales data - would be fetched from API in real app
const mockSales = [
  {
    id: "S001",
    date: "2023-03-15",
    customer: null,
    items: [
      {
        id: "P001",
        brand: "Levi's",
        type: "Jeans",
        size: "32",
        color: "Blue",
        quantity: 1,
        unitPrice: 89.99,
        finalPrice: 89.99,
      },
      {
        id: "P002",
        brand: "Nike",
        type: "T-Shirt",
        size: "M",
        color: "Black",
        quantity: 2,
        unitPrice: 29.99,
        finalPrice: 59.98,
      },
    ],
    total: 149.97,
    paymentMethod: "card",
  },
  {
    id: "S002",
    date: "2023-03-16",
    customer: "+1234567890",
    items: [
      {
        id: "P003",
        brand: "Adidas",
        type: "Jacket",
        size: "L",
        color: "Red",
        quantity: 1,
        unitPrice: 119.99,
        finalPrice: 119.99,
      },
    ],
    total: 119.99,
    paymentMethod: "cash",
  },
];

export default function ReturnsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnType, setReturnType] = useState("refund");
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  const handleSearch = () => {
    // In a real app, you would search the API
    const sale = mockSales.find(
      (s) => s.id === searchTerm || s.customer === searchTerm
    );

    if (sale) {
      setSelectedSale(sale);
      setReturnItems([]);
    } else {
      toast({
        title: "Sale not found",
        description: "No sale found with that ID or customer phone",
        variant: "destructive",
      });
    }
  };

  const handleToggleReturnItem = (item) => {
    const existingItemIndex = returnItems.findIndex(
      (ri) => ri.saleId === selectedSale.id && ri.itemId === item.id
    );

    if (existingItemIndex >= 0) {
      // Remove item from returns
      const updatedReturnItems = [...returnItems];
      updatedReturnItems.splice(existingItemIndex, 1);
      setReturnItems(updatedReturnItems);
    } else {
      // Add item to returns
      setReturnItems([
        ...returnItems,
        {
          saleId: selectedSale.id,
          itemId: item.id,
          brand: item.brand,
          type: item.type,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          originalPrice: item.finalPrice,
        },
      ]);
    }
  };

  const isItemSelected = (itemId) => {
    return returnItems.some((ri) => ri.itemId === itemId);
  };

  const calculateTotalReturnAmount = () => {
    return returnItems.reduce((sum, item) => sum + item.originalPrice, 0);
  };

  const handleProcessReturn = () => {
    // In a real app, you would send this to your API
    const returnData = {
      saleId: selectedSale.id,
      items: returnItems,
      returnType,
      totalAmount: calculateTotalReturnAmount(),
      timestamp: new Date().toISOString(),
    };

    console.log("Processing return:", returnData);

    toast({
      title: "Return processed successfully",
      description: `${
        returnType === "refund"
          ? "Refund"
          : returnType === "exchange"
          ? "Exchange"
          : "Store credit"
      } processed for $${calculateTotalReturnAmount().toFixed(2)}`,
    });

    // Reset form
    setSelectedSale(null);
    setReturnItems([]);
    setReturnType("refund");
    setSearchTerm("");
    setIsReturnDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Returns Management</h1>
        <p className="text-muted-foreground">Process returns and exchanges</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Sale</CardTitle>
          <CardDescription>
            Enter sale ID or customer phone number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 mb-6">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Sale ID or Customer Phone</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Enter sale ID or customer phone"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {selectedSale && (
            <div className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Sale ID:
                    </span>
                    <div className="font-medium">{selectedSale.id}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <div className="font-medium">{selectedSale.date}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Payment Method:
                    </span>
                    <div className="font-medium capitalize">
                      {selectedSale.paymentMethod}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Total Amount:
                    </span>
                    <div className="font-medium">
                      ${selectedSale.total.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Size/Color</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSale.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.brand}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.type}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.size} / {item.color}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            ${item.finalPrice.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={
                                isItemSelected(item.id) ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handleToggleReturnItem(item)}
                            >
                              {isItemSelected(item.id) ? "Selected" : "Select"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {returnItems.length > 0 && (
                <Dialog
                  open={isReturnDialogOpen}
                  onOpenChange={setIsReturnDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Process Return
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Process Return</DialogTitle>
                      <DialogDescription>
                        Select return type and confirm details
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label>Return Type</Label>
                        <RadioGroup
                          value={returnType}
                          onValueChange={setReturnType}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="refund" id="refund" />
                            <Label htmlFor="refund">Refund</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="exchange" id="exchange" />
                            <Label htmlFor="exchange">
                              Exchange for Same Item
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="store-credit"
                              id="store-credit"
                            />
                            <Label htmlFor="store-credit">Store Credit</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="rounded-lg bg-muted p-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            Return Items:
                          </div>
                          {returnItems.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.brand} {item.type} ({item.size})
                              </span>
                              <span>${item.originalPrice.toFixed(2)}</span>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between font-bold">
                            <span>Total Return Amount:</span>
                            <span>
                              ${calculateTotalReturnAmount().toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsReturnDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleProcessReturn}>
                        Confirm Return
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
