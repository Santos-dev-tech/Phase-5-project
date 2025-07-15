import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Calendar,
} from "lucide-react";

// Mock data
const mealOptions = [
  {
    id: 1,
    name: "Beef with Rice",
    description: "Tender beef strips served with jasmine rice and vegetables",
    price: 12.99,
    prepTime: "25-30 min",
    category: "Main Course",
  },
  {
    id: 2,
    name: "Chicken Stir Fry",
    description: "Fresh chicken with mixed vegetables in savory sauce",
    price: 10.99,
    prepTime: "20-25 min",
    category: "Main Course",
  },
  {
    id: 3,
    name: "Fish and Chips",
    description: "Crispy battered fish with golden fries and tartar sauce",
    price: 13.99,
    prepTime: "30-35 min",
    category: "Main Course",
  },
];

const todaysOrders = [
  {
    id: 1,
    customerName: "John Doe",
    meal: "Beef with Rice",
    price: 12.99,
    time: "12:30 PM",
    status: "preparing",
  },
  {
    id: 2,
    customerName: "Jane Smith",
    meal: "Chicken Stir Fry",
    price: 10.99,
    time: "12:45 PM",
    status: "ready",
  },
  {
    id: 3,
    customerName: "Mike Johnson",
    meal: "Fish and Chips",
    price: 13.99,
    time: "1:00 PM",
    status: "delivered",
  },
];

export default function AdminDashboard() {
  const [meals, setMeals] = useState(mealOptions);
  const [orders, setOrders] = useState(todaysOrders);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: "",
    description: "",
    price: "",
    prepTime: "",
    category: "",
  });

  const handleAddMeal = () => {
    const meal = {
      id: meals.length + 1,
      name: newMeal.name,
      description: newMeal.description,
      price: parseFloat(newMeal.price),
      prepTime: newMeal.prepTime,
      category: newMeal.category,
    };
    setMeals([...meals, meal]);
    setNewMeal({
      name: "",
      description: "",
      price: "",
      prepTime: "",
      category: "",
    });
    setIsAddMealOpen(false);
  };

  const handleDeleteMeal = (id: number) => {
    setMeals(meals.filter((meal) => meal.id !== id));
  };

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);
  const totalOrders = orders.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage your meals and track orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Today's Revenue
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalOrders}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Average Order
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    $
                    {totalOrders > 0
                      ? (totalRevenue / totalOrders).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Today's Orders</TabsTrigger>
            <TabsTrigger value="meals">Meal Management</TabsTrigger>
            <TabsTrigger value="menu">Menu Setup</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Today's Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {order.customerName}
                        </h3>
                        <p className="text-gray-600">{order.meal}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {order.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="font-semibold text-gray-900">
                          ${order.price}
                        </p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        {order.status === "preparing" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "ready")}
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === "ready" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order.id, "delivered")
                            }
                          >
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Meal Options</CardTitle>
                  <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Meal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Meal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Meal Name</Label>
                          <Input
                            id="name"
                            value={newMeal.name}
                            onChange={(e) =>
                              setNewMeal({ ...newMeal, name: e.target.value })
                            }
                            placeholder="Enter meal name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newMeal.description}
                            onChange={(e) =>
                              setNewMeal({
                                ...newMeal,
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter meal description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={newMeal.price}
                              onChange={(e) =>
                                setNewMeal({
                                  ...newMeal,
                                  price: e.target.value,
                                })
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label htmlFor="prepTime">Prep Time</Label>
                            <Input
                              id="prepTime"
                              value={newMeal.prepTime}
                              onChange={(e) =>
                                setNewMeal({
                                  ...newMeal,
                                  prepTime: e.target.value,
                                })
                              }
                              placeholder="20-25 min"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={newMeal.category}
                            onChange={(e) =>
                              setNewMeal({
                                ...newMeal,
                                category: e.target.value,
                              })
                            }
                            placeholder="Main Course"
                          />
                        </div>
                        <Button
                          onClick={handleAddMeal}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                        >
                          Add Meal
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meals.map((meal) => (
                    <Card key={meal.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {meal.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {meal.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-orange-600">
                              ${meal.price}
                            </span>
                            <span className="text-sm text-gray-500">
                              {meal.prepTime}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{meal.category}</Badge>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteMeal(meal.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Setup Tab */}
          <TabsContent value="menu" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Menu Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Select meals to include in today's menu
                </p>
                <div className="space-y-3">
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {meal.name}
                        </h3>
                        <p className="text-sm text-gray-600">${meal.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          Add to Menu
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
