import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function OrderConfirmation() {
  const [location] = useLocation();
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const id = params.get('orderId');
    if (id) setOrderId(id);
  }, [location]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-600 h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Order Number:</span>
                <span className="font-semibold ml-2">#{orderId || 'ORD-12345'}</span>
              </div>
              <div>
                <span className="text-gray-500">Estimated Delivery:</span>
                <span className="font-semibold ml-2">Tomorrow</span>
              </div>
              <div>
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-semibold ml-2">Cash on Delivery</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="font-semibold ml-2 text-green-600">Confirmed</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = "/"}
              className="bg-primary hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
            <Button variant="outline">
              Track Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
