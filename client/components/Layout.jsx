import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, User, LogOut, Home, Settings, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { state, actions } = useApp();

  const handleLogout = () => {
    actions.logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Restaurant Background with Overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop&auto=format')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/80 via-orange-800/70 to-green-900/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen">
        {/* Navigation Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-orange-100/50 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-2xl shadow-lg">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    Mealy
                  </span>
                  <p className="text-xs text-gray-600 -mt-1">Fine Dining</p>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-orange-600 font-semibold transition-all duration-300 hover:scale-105"
                >
                  Home
                </Link>
                {state.user && (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-gray-700 hover:text-orange-600 font-semibold transition-all duration-300 hover:scale-105"
                    >
                      {state.user.role === "admin" ? "Orders" : "Dashboard"}
                    </Link>
                    {state.user.role === "admin" && (
                      <Link
                        to="/admin"
                        className="text-gray-700 hover:text-orange-600 font-semibold transition-all duration-300 hover:scale-105 relative"
                      >
                        Admin Panel
                        {state.notifications.length > 0 && (
                          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 min-w-[18px] h-5 rounded-full">
                            {state.notifications.length}
                          </Badge>
                        )}
                      </Link>
                    )}
                  </>
                )}
              </nav>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                {state.user ? (
                  <div className="flex items-center space-x-3">
                    {/* Notifications for Admin */}
                    {state.user.role === "admin" && (
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="relative p-2"
                        >
                          <Bell className="h-5 w-5 text-gray-600" />
                          {state.notifications.length > 0 && (
                            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0 min-w-[16px] h-4 rounded-full">
                              {state.notifications.length}
                            </Badge>
                          )}
                        </Button>
                      </div>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="relative h-12 w-12 rounded-full bg-gradient-to-r from-orange-100 to-green-100 hover:from-orange-200 hover:to-green-200 transition-all duration-300"
                        >
                          <User className="h-6 w-6 text-orange-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-64 p-2"
                        align="end"
                        sideOffset={8}
                      >
                        <div className="flex items-center justify-start gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-green-50">
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-full">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-semibold text-gray-900">
                              {state.user.name}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                              {state.user.role === "admin"
                                ? "Restaurant Manager"
                                : "Valued Customer"}
                            </p>
                          </div>
                        </div>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem asChild>
                          <Link
                            to="/dashboard"
                            className="cursor-pointer p-3 rounded-lg hover:bg-orange-50 transition-colors"
                          >
                            <Home className="mr-3 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        {state.user.role === "admin" && (
                          <DropdownMenuItem asChild>
                            <Link
                              to="/admin"
                              className="cursor-pointer p-3 rounded-lg hover:bg-orange-50 transition-colors"
                            >
                              <Settings className="mr-3 h-4 w-4" />
                              Admin Panel
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="cursor-pointer p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      asChild
                      className="font-semibold hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Link to="/register">Join Us</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10">{children}</main>

        {/* Footer */}
        <footer className="relative z-10 bg-gray-900/95 backdrop-blur-xl text-white py-16 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-2xl">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <span className="text-3xl font-bold">Mealy</span>
                    <p className="text-sm text-gray-400 -mt-1">Fine Dining</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 max-w-md">
                  Experience culinary excellence at Mealy. Our passionate chefs
                  craft each dish with the finest ingredients, bringing you
                  flavors that tell a story.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-600 px-3 py-1 rounded-full text-sm font-medium">
                    ★ 4.9 Rating
                  </div>
                  <div className="bg-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                    10K+ Orders
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-6 text-orange-400">
                  Quick Links
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <Link
                      to="/"
                      className="hover:text-orange-400 transition-colors"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard"
                      className="hover:text-orange-400 transition-colors"
                    >
                      Menu
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-orange-400 transition-colors"
                    >
                      About Chef
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-orange-400 transition-colors"
                    >
                      Reservations
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-6 text-orange-400">
                  Contact
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <span className="block">123 Culinary Street</span>
                    <span className="block">Food District, FD 12345</span>
                  </li>
                  <li className="text-orange-400 font-semibold">
                    (555) 123-MEAL
                  </li>
                  <li>hello@mealy.restaurant</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>
                &copy; 2024 Mealy Fine Dining. Crafted with passion for food
                lovers.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
