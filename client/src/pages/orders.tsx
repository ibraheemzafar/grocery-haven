import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserAuthStore } from "@/lib/user-auth-store";
import { useEffect } from "react";

export default function Orders() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useUserAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/orders');
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  const { data: orders, isLoading } = useQuery({
    queryKey: [`/api/user/${user?.id}/orders`],
    enabled: !!user,
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
        <p className="text-gray-600 mt-2">Track and manage your recent orders</p>
      </div>

      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders. Start shopping to see your orders here.</p>
            <Button onClick={() => setLocation("/")}>Start Shopping</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => {
            const items = JSON.parse(order.items);
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-2">Items ({items.length})</h4>
                      <div className="space-y-2">
                        {items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div>
                              <span className="font-medium">{item.product.name}</span>
                              <span className="text-gray-600 ml-2">x{item.quantity}</span>
                            </div>
                            <span className="font-semibold">
                              ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>Subtotal:</span>
                        <span>${order.subtotal}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Delivery Fee:</span>
                        <span>${order.deliveryFee}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>${order.total}</span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'JazzCash'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}