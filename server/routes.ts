import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage, seedDatabase } from "./storage";
import { 
  insertProductSchema, 
  checkoutSchema, 
  adminLoginSchema,
  userSignupSchema,
  userLoginSchema,
  type CartItem 
} from "../shared/schema";

import { uploadImageToFirebase } from "./uploadImageToFirebase";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      console.log("===> 1")
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      console.log("===> 2")
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// const upload = multer({
//   storage: multer.memoryStorage(), // ✅ Use memory, not disk
//   fileFilter: (req, file, cb) => {
//     console.log("===> 3")
//     cb(null, true);
    
//   }
// });

// WebSocket connections for real-time notifications
const adminConnections = new Set<WebSocket>();

function broadcastToAdmins(message: any) {
  const messageStr = JSON.stringify(message);
  adminConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed database
  await seedDatabase();

  // Products
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.post("/api/products", upload.single('image'), async (req, res) => {
    try {
      console.log("productData", req.body);
       const { image, ...safeBody } = req.body;
      const productData = insertProductSchema.parse(safeBody);

      if (req.file) {
        productData.image = `/uploads/${req.file.filename}`;
      }

      console.log("productData", productData);
       // ✅ Add image path from multer (or Firebase URL)
      // if (req.file) {
      //   const imageUrl = await uploadImageToFirebase(req.file);
      //   console.log("Image uploaded to Firebase:", imageUrl);
      //   productData.image = imageUrl;
      // }

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  app.put("/api/products/:id", upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      if (req.file) {
        productData.image = `/uploads/${req.file.filename}`;
      }
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(204).send();
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    const orders = await storage.getOrders();
    const ordersWithCustomers = await Promise.all(
      orders.map(async (order) => {
        const customer = await storage.getCustomer(order.customerId);
        return {
          ...order,
          customer
        };
      })
    );
    res.json(ordersWithCustomers);
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { customer: customerData, paymentMethod, cart, userId } = req.body;

      // Create customer
      const customer = await storage.createCustomer(customerData);

      // Calculate totals
      const subtotal = cart.reduce((sum: number, item: CartItem) => {
        return sum + (parseFloat(item.product.price) * item.quantity);
      }, 0);
      const deliveryFee = 2.99;
      const total = subtotal + deliveryFee;

      // Mock payment processing for JazzCash
      if (paymentMethod === "jazzcash") {
        const paymentSuccess = Math.random() > 0.1; // 90% success rate
        if (!paymentSuccess) {
          return res.status(400).json({ 
            message: "Payment failed", 
            error: "JazzCash payment could not be processed" 
          });
        }
      }

      // Create order
      const order = await storage.createOrder({
        userId: userId || null,
        customerId: customer.id,
        items: JSON.stringify(cart),
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        total: total.toFixed(2),
        paymentMethod,
        status: "pending"
      });

      // Broadcast new order to admin connections
      broadcastToAdmins({
        type: 'NEW_ORDER',
        order: {
          ...order,
          customer,
          items: cart
        }
      });

      res.status(201).json({ order, customer });
    } catch (error) {
      res.status(400).json({ message: "Invalid order data", error });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "processing", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteOrder(id);
    if (!deleted) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(204).send();
  });

  // User Authentication
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = userSignupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      // Create new user
      const user = await storage.createUser(userData);
      res.status(201).json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid signup data", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = userLoginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data", error });
    }
  });

  // Get user orders
  app.get("/api/user/:userId/orders", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders", error });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = adminLoginSchema.parse(req.body);
      const admin = await storage.getAdminByEmail(email);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd use JWT tokens
      res.json({ 
        message: "Login successful", 
        admin: { id: admin.id, email: admin.email } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data", error });
    }
  });

  // Serve uploaded images
  app.use('/uploads', express.static('uploads'));

  // Stats endpoint for admin dashboard
  app.get("/api/admin/stats", async (req, res) => {
    const products = await storage.getProducts();
    const orders = await storage.getOrders();
    
    const stats = {
      products: products.length,
      orders: orders.length,
      revenue: orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
      customers: new Set(orders.map(order => order.customerId)).size
    };

    res.json(stats);
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Admin connected to WebSocket');
    adminConnections.add(ws);
    
    ws.on('close', () => {
      console.log('Admin disconnected from WebSocket');
      adminConnections.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      adminConnections.delete(ws);
    });
  });
  
  return httpServer;
}
