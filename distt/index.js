var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminLoginSchema: () => adminLoginSchema,
  admins: () => admins,
  checkoutSchema: () => checkoutSchema,
  customers: () => customers,
  insertAdminSchema: () => insertAdminSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertProductSchema: () => insertProductSchema,
  insertUserSchema: () => insertUserSchema,
  orders: () => orders,
  products: () => products,
  userLoginSchema: () => userLoginSchema,
  userSignupSchema: () => userSignupSchema,
  users: () => users
});
import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow()
});
var customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  items: text("items").notNull(),
  // JSON string of cart items
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull()
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true
});
var insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true
});
var insertAdminSchema = createInsertSchema(admins).omit({
  id: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var checkoutSchema = z.object({
  customer: insertCustomerSchema,
  paymentMethod: z.enum(["cod", "jazzcash"])
});
var adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
var userSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional()
});
var userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import "dotenv/config";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getProducts() {
    const result = await db.select().from(products);
    return result;
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  async createProduct(product) {
    const [result] = await db.insert(products).values(product).returning();
    return result;
  }
  async updateProduct(id, product) {
    const [result] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result;
  }
  async deleteProduct(id) {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }
  async getCustomer(id) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }
  async createCustomer(customer) {
    const [result] = await db.insert(customers).values(customer).returning();
    return result;
  }
  async getOrders() {
    const result = await db.select().from(orders);
    return result;
  }
  async getOrder(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  async getOrdersByUserId(userId) {
    const result = await db.select().from(orders).where(eq(orders.userId, userId));
    return result;
  }
  async createOrder(order) {
    const [result] = await db.insert(orders).values(order).returning();
    return result;
  }
  async updateOrderStatus(id, status) {
    const [result] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return result;
  }
  async deleteOrder(id) {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return (result.rowCount || 0) > 0;
  }
  async getAdminByEmail(email) {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin;
  }
  async createAdmin(admin) {
    const [result] = await db.insert(admins).values(admin).returning();
    return result;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async getUserById(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async createUser(user) {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }
};
var storage = new DatabaseStorage();
async function seedDatabase() {
  try {
    const existingProducts = await storage.getProducts();
    const existingAdmin = await storage.getAdminByEmail("admin@grocerymart.com");
    if (existingProducts.length === 0) {
      const productsData = [
        { name: "Organic Bananas", price: "2.99", category: "Fruits", unit: "per kg" },
        { name: "Fresh Milk", price: "3.49", category: "Dairy", unit: "per liter" },
        { name: "Whole Wheat Bread", price: "2.79", category: "Bakery", unit: "per loaf" },
        { name: "Free Range Eggs", price: "4.99", category: "Dairy", unit: "per dozen" },
        { name: "Organic Chicken Breast", price: "12.99", category: "Meat", unit: "per kg" },
        { name: "Fresh Tomatoes", price: "1.99", category: "Vegetables", unit: "per kg" },
        { name: "Basmati Rice", price: "5.99", category: "Pantry", unit: "per kg" },
        { name: "Greek Yogurt", price: "3.99", category: "Dairy", unit: "per container" },
        { name: "Salmon Fillet", price: "15.99", category: "Meat", unit: "per kg" },
        { name: "Organic Apples", price: "4.49", category: "Fruits", unit: "per kg" },
        { name: "Olive Oil", price: "8.99", category: "Pantry", unit: "per bottle" },
        { name: "Fresh Spinach", price: "2.49", category: "Vegetables", unit: "per bunch" }
      ];
      for (const product of productsData) {
        await storage.createProduct(product);
      }
      console.log("Products seeded successfully");
    }
    if (!existingAdmin) {
      await storage.createAdmin({
        email: "admin@grocerymart.com",
        password: "admin123"
      });
      console.log("Admin seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// server/routes.ts
var upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});
var adminConnections = /* @__PURE__ */ new Set();
function broadcastToAdmins(message) {
  const messageStr = JSON.stringify(message);
  adminConnections.forEach((ws2) => {
    if (ws2.readyState === WebSocket.OPEN) {
      ws2.send(messageStr);
    }
  });
}
async function registerRoutes(app2) {
  await seedDatabase();
  app2.get("/api/products", async (req, res) => {
    const products2 = await storage.getProducts();
    res.json(products2);
  });
  app2.get("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });
  app2.post("/api/products", upload.single("image"), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      if (req.file) {
        productData.image = `/uploads/${req.file.filename}`;
      }
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });
  app2.put("/api/products/:id", upload.single("image"), async (req, res) => {
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
  app2.delete("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(204).send();
  });
  app2.get("/api/orders", async (req, res) => {
    const orders2 = await storage.getOrders();
    const ordersWithCustomers = await Promise.all(
      orders2.map(async (order) => {
        const customer = await storage.getCustomer(order.customerId);
        return {
          ...order,
          customer
        };
      })
    );
    res.json(ordersWithCustomers);
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const { customer: customerData, paymentMethod, cart, userId } = req.body;
      const customer = await storage.createCustomer(customerData);
      const subtotal = cart.reduce((sum, item) => {
        return sum + parseFloat(item.product.price) * item.quantity;
      }, 0);
      const deliveryFee = 2.99;
      const total = subtotal + deliveryFee;
      if (paymentMethod === "jazzcash") {
        const paymentSuccess = Math.random() > 0.1;
        if (!paymentSuccess) {
          return res.status(400).json({
            message: "Payment failed",
            error: "JazzCash payment could not be processed"
          });
        }
      }
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
      broadcastToAdmins({
        type: "NEW_ORDER",
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
  app2.put("/api/orders/:id/status", async (req, res) => {
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
  app2.delete("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteOrder(id);
    if (!deleted) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(204).send();
  });
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = userSignupSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
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
  app2.post("/api/auth/login", async (req, res) => {
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
  app2.get("/api/user/:userId/orders", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders2 = await storage.getOrdersByUserId(userId);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders", error });
    }
  });
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = adminLoginSchema.parse(req.body);
      const admin = await storage.getAdminByEmail(email);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json({
        message: "Login successful",
        admin: { id: admin.id, email: admin.email }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data", error });
    }
  });
  app2.use("/uploads", express.static("uploads"));
  app2.get("/api/admin/stats", async (req, res) => {
    const products2 = await storage.getProducts();
    const orders2 = await storage.getOrders();
    const stats = {
      products: products2.length,
      orders: orders2.length,
      revenue: orders2.reduce((sum, order) => sum + parseFloat(order.total), 0),
      customers: new Set(orders2.map((order) => order.customerId)).size
    };
    res.json(stats);
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws2) => {
    console.log("Admin connected to WebSocket");
    adminConnections.add(ws2);
    ws2.on("close", () => {
      console.log("Admin disconnected from WebSocket");
      adminConnections.delete(ws2);
    });
    ws2.on("error", (error) => {
      console.error("WebSocket error:", error);
      adminConnections.delete(ws2);
    });
  });
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path3 from "node:path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import "dotenv/config";
import path2 from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = async () => defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      (await import("@replit/vite-plugin-cartographer")).cartographer()
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { fileURLToPath } from "node:url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
var viteLogger = createLogger();
var isProduction = process.env.NODE_ENV === "production";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
