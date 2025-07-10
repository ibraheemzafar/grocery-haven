import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { useCartStore } from "../lib/cart-store";
import { useUserAuthStore } from "../lib/user-auth-store";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { processJazzCashPayment } from "../lib/payment";
import { checkoutSchema, type CheckoutData } from "../../../shared/schema";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useUserAuthStore();
  const { toast } = useToast();

  const form = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer: {
        fullName: "",
        phone: "",
        address: "",
        city: "",
      },
      paymentMethod: "cod",
    },
  });

  const subtotal = getCartTotal();
  const deliveryFee = 2.99;
  const total = subtotal + deliveryFee;

  const orderMutation = useMutation({
    mutationFn: async (data: CheckoutData & { cart: typeof items; userId?: number }) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: (data) => {
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation email shortly.",
      });
      setLocation(`/order-confirmation?orderId=${data.order.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Order failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CheckoutData) => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated before payment
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      toast({
        title: "Login required",
        description: "Please login to continue with your order.",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }

    setIsProcessing(true);

    try {
      if (data.paymentMethod === "jazzcash") {
        const paymentResult = await processJazzCashPayment(total);
        
        if (!paymentResult.success) {
          toast({
            title: "Payment failed",
            description: paymentResult.error,
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        toast({
          title: "Payment successful",
          description: `Transaction ID: ${paymentResult.transactionId}`,
        });
      }

      await orderMutation.mutateAsync({ ...data, cart: items, userId: user?.id });
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products before checkout.</p>
            <Button onClick={() => setLocation("/")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout Details</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="customer.fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+92 300 1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your complete address" 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="karachi">Karachi</SelectItem>
                          <SelectItem value="lahore">Lahore</SelectItem>
                          <SelectItem value="islamabad">Islamabad</SelectItem>
                          <SelectItem value="faisalabad">Faisalabad</SelectItem>
                          <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg">
                            <RadioGroupItem value="cod" id="cod" />
                            <Label htmlFor="cod" className="flex-1 cursor-pointer">
                              <div className="font-medium text-gray-900">Cash on Delivery</div>
                              <div className="text-sm text-gray-500">Pay when you receive your order</div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg">
                            <RadioGroupItem value="jazzcash" id="jazzcash" />
                            <Label htmlFor="jazzcash" className="flex-1 cursor-pointer">
                              <div className="font-medium text-gray-900">JazzCash</div>
                              <div className="text-sm text-gray-500">Pay online with JazzCash</div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-5 w-5 text-amber-600" />
                        <div>
                          <h3 className="font-medium text-amber-800">Login Required</h3>
                          <p className="text-sm text-amber-700">Please sign in to complete your order</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      type="button"
                      className="w-full"
                      onClick={() => {
                        localStorage.setItem('redirectAfterLogin', '/checkout');
                        setLocation('/login');
                      }}
                    >
                      Sign In to Continue
                    </Button>
                  </div>
                ) : (
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isProcessing || orderMutation.isPending}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-900">{item.product.name}</span>
                    <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">
                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
