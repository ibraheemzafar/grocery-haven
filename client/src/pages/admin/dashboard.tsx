import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  Plus, 
  Upload,
  Eye,
  Trash2,
  LogOut,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema, type Product, type Order } from "@shared/schema";

interface OrderWithCustomer extends Order {
  customer: {
    fullName: string;
    phone: string;
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");
  const [notifications, setNotifications] = useState<any[]>([]);
  const { logout, adminEmail } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // WebSocket connection for real-time notifications
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'NEW_ORDER') {
      const newOrder = message.order;
      
      // Add notification
      setNotifications(prev => [{
        id: Date.now(),
        type: 'order',
        message: `New order #${newOrder.id} from ${newOrder.customer.fullName}`,
        timestamp: new Date(),
        order: newOrder
      }, ...prev]);

      // Show toast notification
      toast({
        title: "New Order Received!",
        description: `Order #${newOrder.id} from ${newOrder.customer.fullName} - $${newOrder.total}`,
      });

      // Refresh orders data
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    }
  }, [toast, queryClient]);

  const { isConnected } = useWebSocket('/ws', handleWebSocketMessage);

  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      price: "",
      category: "",
      unit: "",
      image: "",
    },
  });

  // Queries
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders = [] } = useQuery<OrderWithCustomer[]>({
    queryKey: ["/api/orders"],
  });

  // Mutations
  const addProductMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/products", {
        method: "POST",
        body: data,
      });
      if (!response.ok) throw new Error("Failed to add product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      form.reset();
      toast({
        title: "Product added",
        description: "The product has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product.",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order updated",
        description: "Order status has been updated.",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await apiRequest("DELETE", `/api/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order deleted",
        description: "The order has been deleted.",
      });
    },
  });

  const onSubmit = (data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key]) formData.append(key, data[key]);
    });
    addProductMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="text-primary h-8 w-8 mr-3" />
              <span className="text-xl font-bold text-gray-900">GroceryMart Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Real-time connection status */}
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-500">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>

              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </div>
              )}

              <span className="text-gray-600">Welcome, {adminEmail}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm h-screen">
          <nav className="mt-5 px-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 ${
                activeTab === "overview" 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 ${
                activeTab === "products" 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Package className="h-5 w-5 mr-3" />
              Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 ${
                activeTab === "orders" 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <ShoppingBag className="h-5 w-5 mr-3" />
              Orders
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "overview" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BarChart3 className="text-green-600 h-8 w-8" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          ${stats?.revenue?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ShoppingBag className="text-blue-600 h-8 w-8" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Orders</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats?.orders || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Package className="text-purple-600 h-8 w-8" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Products</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats?.products || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="text-orange-600 h-8 w-8" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Customers</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats?.customers || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">#{order.id}</p>
                          <p className="text-sm text-gray-500">{order.customer?.fullName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt!).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${order.total}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "products" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Product Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="text-gray-400 h-8 w-8 mx-auto mb-2" />
                        <p className="text-gray-500">Image upload not implemented in demo</p>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="fruits">Fruits & Vegetables</SelectItem>
                                <SelectItem value="dairy">Dairy & Eggs</SelectItem>
                                <SelectItem value="meat">Meat & Seafood</SelectItem>
                                <SelectItem value="pantry">Pantry Staples</SelectItem>
                                <SelectItem value="bakery">Bakery</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit</FormLabel>
                              <FormControl>
                                <Input placeholder="kg, L, pcs" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={addProductMutation.isPending}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {addProductMutation.isPending ? "Adding..." : "Add Product"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Products List */}
              <Card>
                <CardHeader>
                  <CardTitle>Products ({products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={product.image || "/api/placeholder/50/50"} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50";
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">${product.price}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "orders" && (
            <Card>
              <CardHeader>
                <CardTitle>All Orders ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customer?.fullName}</TableCell>
                        <TableCell>{new Date(order.createdAt!).toLocaleDateString()}</TableCell>
                        <TableCell>${order.total}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(status) => 
                              updateOrderStatusMutation.mutate({ orderId: order.id, status })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteOrderMutation.mutate(order.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
