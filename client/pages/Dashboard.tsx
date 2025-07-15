import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Clock,
  ShoppingCart,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Mock data for today's menu
const todaysMenu = [
  {
    id: 1,
    name: "Beef with Rice",
    description: "Tender beef strips served with jasmine rice and vegetables",
    price: 12.99,
    rating: 4.8,
    prepTime: "25-30 min",
    image: "/placeholder.svg",
    available: true,
  },
  {
    id: 2,
    name: "Chicken Stir Fry",
    description: "Fresh chicken with mixed vegetables in savory sauce",
    price: 10.99,
    rating: 4.6,
    prepTime: "20-25 min",
    image: "/placeholder.svg",
    available: true,
  },
  {
    id: 3,
    name: "Fish and Chips",
    description: "Crispy battered fish with golden fries and tartar sauce",
    price: 13.99,
    rating: 4.7,
    prepTime: "30-35 min",
    image: "/placeholder.svg",
    available: false,
  },
  {
    id: 4,
    name: "Vegetarian Pasta",
    description: "Creamy pasta with seasonal vegetables and herbs",
    price: 9.99,
    rating: 4.5,
    prepTime: "15-20 min",
    image: "/placeholder.svg",
    available: true,
  },
];

export default function Dashboard() {
  const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const handleOrderMeal = (meal: any) => {
    setCurrentOrder(meal);
    setSelectedMeal(meal.id);
  };

  const handleChangeOrder = () => {
    setCurrentOrder(null);
    setSelectedMeal(null);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Today's Menu
          </h1>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span className="text-lg">{getCurrentDate()}</span>
          </div>
        </div>

        {/* Current Order Status */}
        {currentOrder && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order Placed!
                    </h3>
                    <p className="text-gray-600">
                      You've ordered: <strong>{currentOrder.name}</strong>
                    </p>
                    <p className="text-sm text-gray-500">
                      Estimated prep time: {currentOrder.prepTime}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ${currentOrder.price}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangeOrder}
                    className="mt-2"
                  >
                    Change Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todaysMenu.map((meal) => (
            <Card
              key={meal.id}
              className={`hover:shadow-lg transition-shadow ${
                selectedMeal === meal.id
                  ? "ring-2 ring-orange-500 border-orange-500"
                  : ""
              } ${!meal.available ? "opacity-60" : ""}`}
            >
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {!meal.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                      <Badge variant="destructive" className="text-sm">
                        Sold Out
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 shadow-md">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{meal.rating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {meal.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{meal.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{meal.prepTime}</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      ${meal.price}
                    </div>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    onClick={() => handleOrderMeal(meal)}
                    disabled={
                      !meal.available ||
                      selectedMeal === meal.id ||
                      !!currentOrder
                    }
                  >
                    {selectedMeal === meal.id ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Ordered
                      </>
                    ) : !meal.available ? (
                      "Sold Out"
                    ) : currentOrder ? (
                      "Order Already Placed"
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Order Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order History Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Orders
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Chicken Stir Fry
                    </h3>
                    <p className="text-gray-600 text-sm">Yesterday, 12:30 PM</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">$10.99</p>
                    <Badge variant="outline" className="text-green-600">
                      Delivered
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Beef with Rice
                    </h3>
                    <p className="text-gray-600 text-sm">2 days ago, 1:15 PM</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">$12.99</p>
                    <Badge variant="outline" className="text-green-600">
                      Delivered
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
