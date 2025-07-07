import { Link, useLocation } from "wouter";
import { ShoppingCart, Search, User, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";
import { useAuthStore } from "@/lib/auth-store";
import { useUserAuthStore } from "@/lib/user-auth-store";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const cartItemCount = useCartStore(state => state.getCartItemCount());
  const { isAuthenticated: adminAuthenticated, logout: adminLogout } = useAuthStore();
  const { user, isAuthenticated: userAuthenticated, logout: userLogout } = useUserAuthStore();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <ShoppingCart className="text-primary text-2xl mr-3" />
              <span className="text-xl font-bold text-gray-900">GroceryMart</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <span className={`font-medium transition-colors cursor-pointer ${
                location === "/" ? "text-primary" : "text-gray-700 hover:text-primary"
              }`}>
                Home
              </span>
            </Link>
            <span className="text-gray-700 hover:text-primary font-medium transition-colors cursor-pointer">
              Categories
            </span>
            <span className="text-gray-700 hover:text-primary font-medium transition-colors cursor-pointer">
              About
            </span>
            <span className="text-gray-700 hover:text-primary font-medium transition-colors cursor-pointer">
              Contact
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Input 
                type="text" 
                placeholder="Search products..." 
                className="w-64 pl-4 pr-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const searchValue = (e.target as HTMLInputElement).value;
                    setLocation(`/?search=${encodeURIComponent(searchValue)}`);
                  }
                }}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {userAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLocation("/orders")}>
                    <Package className="h-4 w-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={userLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            {adminAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/admin/dashboard">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={adminLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/admin/login">
                <Button className="bg-primary hover:bg-primary/90">
                  <User className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
