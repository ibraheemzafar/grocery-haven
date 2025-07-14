import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import ProductCard from "../components/product-card";
import type { Product } from "../../../shared/schema";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Check for search parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const categories = [
    { id: "all", name: "All Products" },
    { id: "grains", name: "Food Grains & Pulses" },
    { id: "flour-oil", name: "Flour, Oil & Ghee" },
    { id: "spices", name: "Salt, Spices & Masala" },
    { id: "bakery", name: "Bakery & Dairy" },
    { id: "snacks", name: "Snacks & Namkeen" },
    { id: "biscuits", name: "Biscuits & Cookies" },
    { id: "chocolates", name: "Chocolates & Sweets" },
    { id: "instant", name: "Instant Food & Pasta" },
    { id: "beverages", name: "Beverages" },
    { id: "sauces", name: "Sauces & Condiments" },
    { id: "frozen", name: "Frozen Food" },
    { id: "cleaning", name: "Cleaning & Household" },
    { id: "hygiene", name: "Beauty & Hygiene" },
    { id: "baby", name: "Baby Care" }
  ]

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 h-48 rounded-t-xl"></div>
              <div className="bg-white p-4 rounded-b-xl border border-gray-200 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Section */}
      <div className="mb-8">
        <div className="max-w-md mx-auto md:mx-0">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-3 text-lg"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grocery-gradient rounded-2xl p-8 mb-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Groceries Delivered to Your Door – Fast, Easy, Convenient!</h1>
          <p className="text-lg opacity-90 mb-6">
            Shop all your grocery essentials online and have them delivered straight to your doorstep. From pantry staples to your everyday needs, we bring the store to you—quick, easy, and hassle-free.
          </p>
          <Button 
            className="bg-white text-primary hover:bg-gray-100"
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Shop Now
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 mb-8" id="products">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className={selectedCategory === category.id ? "bg-primary hover:bg-primary/90" : ""}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredProducts.length} results found for "{searchQuery}"
          </p>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p>Try adjusting your search or category filter</p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery("")}
                  className="mt-4"
                >
                  Clear search
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
