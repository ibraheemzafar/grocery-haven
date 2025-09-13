import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useCartStore } from "../lib/cart-store";
import type { CartItem } from "../../../shared/schema";

interface CartItemProps {
  item: CartItem;
}

export default function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleDecrease = () => {
    updateQuantity(item.product.id, item.quantity - 1);
  };

  const handleIncrease = () => {
    updateQuantity(item.product.id, item.quantity + 1);
  };

  const handleRemove = () => {
    removeItem(item.product.id);
  };

  const itemTotal = (parseFloat(item.product.price) * item.quantity).toFixed(2);

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
      <img 
        src={item.product.image || "/api/placeholder/80/80"} 
        alt={item.product.name}
        className="w-16 h-16 object-cover rounded-lg"
        onError={(e) => {
          e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80";
        }}
      />
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
        <p className="text-sm text-gray-500">{item.product.unit}</p>
        <p className="text-lg font-bold text-primary">Rs {itemTotal}</p>
      </div>
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrease}
          className="w-8 h-8 rounded-full"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrease}
          className="w-8 h-8 rounded-full"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
