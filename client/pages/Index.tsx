import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChefHat,
  Clock,
  Star,
  Users,
  ShoppingCart,
  Truck,
  Shield,
  Smartphone,
} from "lucide-react";

export default function Index() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-6">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-800 text-sm font-medium mb-6">
                  <ChefHat className="w-4 h-4 mr-2" />
                  Fresh & Delicious
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Order Your
                  <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    {" "}
                    Perfect Meal{" "}
                  </span>
                  Today
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                  Discover delicious meals crafted by our talented chefs. Order
                  easily, track your food, and enjoy restaurant-quality dishes
                  delivered fresh to your doorstep.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    asChild
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8 py-6"
                  >
                    <Link to="/register">Order Now</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6"
                  >
                    View Menu
                  </Button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 mt-12 lg:mt-0">
              <div className="relative">
                <div className="bg-gradient-to-r from-orange-400 to-green-400 rounded-3xl p-8 transform rotate-6">
                  <div className="bg-white rounded-2xl p-6 transform -rotate-6 shadow-2xl">
                    <img
                      src="/placeholder.svg"
                      alt="Delicious meal"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <div className="mt-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Beef with Rice
                      </h3>
                      <p className="text-gray-600">
                        Tender beef with jasmine rice
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-2xl font-bold text-orange-600">
                          $12.99
                        </span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">
                            4.8
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Mealy?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make food ordering simple, fast, and delicious with features
              designed for your convenience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-orange-100 to-orange-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Fast Delivery
                </h3>
                <p className="text-gray-600">
                  Quick and reliable delivery service to get your food fresh and
                  hot.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-green-100 to-green-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Expert Chefs
                </h3>
                <p className="text-gray-600">
                  Meals prepared by professional chefs using the finest
                  ingredients.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Easy Ordering
                </h3>
                <p className="text-gray-600">
                  Simple and intuitive interface for quick meal selection and
                  ordering.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Safe & Secure
                </h3>
                <p className="text-gray-600">
                  Secure payment processing and contact-free delivery options.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-6xl font-bold text-white mb-2">
                10K+
              </div>
              <div className="text-orange-100 text-lg">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl lg:text-6xl font-bold text-white mb-2">
                50+
              </div>
              <div className="text-orange-100 text-lg">Delicious Meals</div>
            </div>
            <div>
              <div className="text-4xl lg:text-6xl font-bold text-white mb-2">
                4.9
              </div>
              <div className="text-orange-100 text-lg">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ready to Order?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers and experience the best food
            delivery service in town.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8 py-6"
            >
              <Link to="/register">Get Started</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 py-6"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
