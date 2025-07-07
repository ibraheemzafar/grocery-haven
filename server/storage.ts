import { 
  Product, 
  InsertProduct, 
  Customer, 
  InsertCustomer, 
  Order, 
  InsertOrder, 
  Admin, 
  InsertAdmin,
  User,
  InsertUser,
  products,
  customers,
  orders,
  admins,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Customers
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;

  // Admin
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Users
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    const result = await db.select().from(products);
    return result;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [result] = await db.insert(products).values(product).returning();
    return result;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [result] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [result] = await db.insert(customers).values(customer).returning();
    return result;
  }

  async getOrders(): Promise<Order[]> {
    const result = await db.select().from(orders);
    return result;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    const result = await db.select().from(orders).where(eq(orders.userId, userId));
    return result;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [result] = await db.insert(orders).values(order).returning();
    return result;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [result] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return result;
  }

  async deleteOrder(id: number): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [result] = await db.insert(admins).values(admin).returning();
    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();

// Seed data function
export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingProducts = await storage.getProducts();
    const existingAdmin = await storage.getAdminByEmail("admin@grocerymart.com");
    
    if (existingProducts.length === 0) {
      // Seed products
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
        { name: "Fresh Spinach", price: "2.49", category: "Vegetables", unit: "per bunch" },
      ];

      for (const product of productsData) {
        await storage.createProduct(product);
      }
      console.log("Products seeded successfully");
    }

    if (!existingAdmin) {
      // Seed admin
      await storage.createAdmin({
        email: "admin@grocerymart.com",
        password: "admin123",
      });
      console.log("Admin seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}