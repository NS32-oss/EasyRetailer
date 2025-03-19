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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Barcode,
  Plus,
  Trash2,
  Percent,
  DollarSign,
  Send,
  CreditCard,
  Smartphone,
  Banknote,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock product data - would be fetched from API in real app
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
];

export default function SalesPage() {
  const { toast } = useToast();
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [finalDiscount, setFinalDiscount] = useState(0);
  const [finalDiscountType, setFinalDiscountType] = useState("percentage");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerPhone, setCustomerPhone] = useState("");
  const [sendEBill, setSendEBill] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handleAddToCart = () => {
    // Find product by barcode
    const product = mockProducts.find((p) => p.barcode === barcode);

    if (!product) {
      toast({
        title: "Product not found",
        description: "No product found with that barcode",
        variant: "destructive",
      });
      return;
    }

    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex >= 0) {
      // Update quantity if already in cart
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex].finalPrice = calculateItemFinalPrice(
        updatedCart[existingItemIndex].quantity,
        product.unitPrice,
        updatedCart[existingItemIndex].discount,
        updatedCart[existingItemIndex].discountType
      );
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          discount: 0,
          discountType: "percentage",
          finalPrice: product.unitPrice,
        },
      ]);
    }

    setBarcode("");
  };

  const handleRemoveFromCart = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const handleQuantityChange = (index, quantity) => {
    if (quantity < 1) return;

    const updatedCart = [...cart];
    updatedCart[index].quantity = quantity;
    updatedCart[index].finalPrice = calculateItemFinalPrice(
      quantity,
      updatedCart[index].product.unitPrice,
      updatedCart[index].discount,
      updatedCart[index].discountType
    );
    setCart(updatedCart);
  };

  const handleDiscountChange = (index, discount) => {
    const updatedCart = [...cart];
    updatedCart[index].discount = discount;
    updatedCart[index].finalPrice = calculateItemFinalPrice(
      updatedCart[index].quantity,
      updatedCart[index].product.unitPrice,
      discount,
      updatedCart[index].discountType
    );
    setCart(updatedCart);
  };

  const handleDiscountTypeChange = (index, type) => {
    const updatedCart = [...cart];
    updatedCart[index].discountType = type;
    updatedCart[index].finalPrice = calculateItemFinalPrice(
      updatedCart[index].quantity,
      updatedCart[index].product.unitPrice,
      updatedCart[index].discount,
      type
    );
    setCart(updatedCart);
  };

  const calculateItemFinalPrice = (
    quantity,
    unitPrice,
    discount,
    discountType
  ) => {
    const totalPrice = quantity * unitPrice;

    if (discountType === "percentage") {
      return totalPrice - totalPrice * (discount / 100);
    } else {
      return totalPrice - discount;
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.finalPrice, 0);
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateSubtotal();

    if (finalDiscountType === "percentage") {
      return subtotal - subtotal * (finalDiscount / 100);
    } else {
      return subtotal - finalDiscount;
    }
  };

  const handleProcessSale = () => {
    // In a real app, you would send this to your API
    const sale = {
      items: cart,
      subtotal: calculateSubtotal(),
      finalDiscount,
      finalDiscountType,
      total: calculateFinalTotal(),
      paymentMethod,
      customerPhone: sendEBill ? customerPhone : null,
      timestamp: new Date().toISOString(),
    };

    console.log("Processing sale:", sale);

    toast({
      title: "Sale completed",
      description: `Total: $${calculateFinalTotal().toFixed(2)}`,
    });

    // Reset cart and form
    setCart([]);
    setFinalDiscount(0);
    setFinalDiscountType("percentage");
    setPaymentMethod("cash");
    setCustomerPhone("");
    setSendEBill(false);
    setIsPaymentDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sales Transactions</h1>
        <p className="text-muted-foreground">
          Process sales and generate bills
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
              <CardDescription>
                Scan barcode or enter product details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 mb-6">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="barcode">Product Barcode</Label>
                  <div className="relative">
                    <Barcode className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="barcode"
                      placeholder="Scan or enter barcode"
                      className="pl-8"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleAddToCart}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items in cart. Scan a product to begin.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {item.product.brand}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {item.product.type} - {item.product.size}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            ${item.product.unitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  handleQuantityChange(index, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                              >
                                -
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  handleQuantityChange(index, item.quantity + 1)
                                }
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                className="w-16 h-8"
                                value={item.discount}
                                onChange={(e) =>
                                  handleDiscountChange(
                                    index,
                                    Number.parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleDiscountTypeChange(
                                    index,
                                    item.discountType === "percentage"
                                      ? "fixed"
                                      : "percentage"
                                  )
                                }
                              >
                                {item.discountType === "percentage" ? (
                                  <Percent className="h-4 w-4" />
                                ) : (
                                  <DollarSign className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${item.finalPrice.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFromCart(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="finalDiscount">Final Discount</Label>
                    <Input
                      id="finalDiscount"
                      type="number"
                      min="0"
                      value={finalDiscount}
                      onChange={(e) =>
                        setFinalDiscount(Number.parseFloat(e.target.value) || 0)
                      }
                      disabled={cart.length === 0}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="mb-0.5"
                    onClick={() =>
                      setFinalDiscountType(
                        finalDiscountType === "percentage"
                          ? "fixed"
                          : "percentage"
                      )
                    }
                    disabled={cart.length === 0}
                  >
                    {finalDiscountType === "percentage" ? (
                      <Percent className="h-4 w-4" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${calculateFinalTotal().toFixed(2)}</span>
                </div>
              </div>

              <Dialog
                open={isPaymentDialogOpen}
                onOpenChange={setIsPaymentDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={cart.length === 0}
                  >
                    Proceed to Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Complete Payment</DialogTitle>
                    <DialogDescription>
                      Select payment method and complete the transaction
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash" className="flex items-center">
                            <Banknote className="mr-2 h-4 w-4" />
                            Cash
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Card
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upi" id="upi" />
                          <Label htmlFor="upi" className="flex items-center">
                            <Smartphone className="mr-2 h-4 w-4" />
                            UPI
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="sendEBill"
                          checked={sendEBill}
                          onChange={(e) => setSendEBill(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label
                          htmlFor="sendEBill"
                          className="flex items-center"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send E-Bill to Customer
                        </Label>
                      </div>

                      {sendEBill && (
                        <div className="pt-2">
                          <Label htmlFor="customerPhone">Customer Phone</Label>
                          <Input
                            id="customerPhone"
                            placeholder="Enter customer phone number"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      {finalDiscount > 0 && (
                        <div className="flex justify-between mb-2 text-muted-foreground">
                          <span>
                            Discount (
                            {finalDiscountType === "percentage"
                              ? `${finalDiscount}%`
                              : `$${finalDiscount}`}
                            ):
                          </span>
                          <span>
                            -$
                            {(
                              calculateSubtotal() - calculateFinalTotal()
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${calculateFinalTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsPaymentDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleProcessSale}>Complete Sale</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
