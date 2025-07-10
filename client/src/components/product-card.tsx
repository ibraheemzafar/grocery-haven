import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { useCartStore } from "../lib/cart-store";
import { useToast } from "../hooks/use-toast";
import type { Product } from "../../../shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      fruits: "text-green-600",
      dairy: "text-blue-600", 
      meat: "text-orange-600",
      bakery: "text-amber-600",
      pantry: "text-purple-600"
    };
    return colors[category as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img 
        src={product.image || "/api/placeholder/400/300"} 
        alt={product.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
        }}
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium capitalize ${getCategoryColor(product.category)}`}>
            {product.category.replace('_', ' ')}
          </span>
          <span className="text-sm text-gray-500">{product.unit}</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-lg font-bold text-gray-900">
              ${parseFloat(product.price).toFixed(2)}
            </span>
          </div>
          <Button 
            onClick={handleAddToCart}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
