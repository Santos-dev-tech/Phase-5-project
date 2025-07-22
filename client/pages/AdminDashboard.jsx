import { useEffect, useState } from "react";
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
  Bell,
  Star,
  ChefHat,
  Activity,
  Award,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const { state, actions } = useApp();
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: "",
    description: "",
    price: "",
    prepTime: "",
    category: "Main Course",
    image: "",
  });

  useEffect(() => {
    actions.loadMeals();
    actions.loadOrders();
    actions.loadTodaysMenu();
  }, []);

  const handleAddMeal = async () => {
    await actions.addMeal({
      ...newMeal,
      image:
        newMeal.image ||
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=300&fit=crop&auto=format",
    });
    setNewMeal({
      name: "",
      description: "",
      price: "",
      prepTime: "",
      category: "Main Course",
      image: "",
    });
    setIsAddMealOpen(false);
  };

  const handleDeleteMeal = async (mealId) => {
    if (window.confirm("Are you sure you want to delete this meal?")) {
      await actions.deleteMeal(mealId);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    await actions.updateOrderStatus(orderId, newStatus);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "delivered":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const totalOrders = state.orders.length;
  const pendingOrders = state.orders.filter(
    (order) => order.status !== "delivered",
  ).length;
  const avgOrderValue = totalOrders > 0 ? state.totalRevenue / totalOrders : 0;

  if (!state.user || state.user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <ChefHat className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Access Required
            </h2>
            <p className="text-gray-600">
              You need admin privileges to access this panel
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-100/50">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              Restaurant Management
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back, {state.user.name}
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 font-semibold">
                      Today's Revenue
                    </p>
                    <p className="text-3xl font-bold">
                      {state.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 font-semibold">Total Orders</p>
                    <p className="text-3xl font-bold">{totalOrders}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <Users className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 font-semibold">
                      Average Order
                    </p>
                    <p className="text-3xl font-bold">
                      {avgOrderValue.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 font-semibold">
                      Pending Orders
                    </p>
                    <p className="text-3xl font-bold">{pendingOrders}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl relative">
                    <Bell className="w-8 h-8" />
                    {pendingOrders > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                        <span className="text-xs font-bold">
                          {pendingOrders}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100/50 p-8">
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-orange-50 p-1 rounded-2xl">
              <TabsTrigger
                value="orders"
                className="rounded-xl font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                Live Orders
              </TabsTrigger>
              <TabsTrigger
                value="meals"
                className="rounded-xl font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                Meal Management
              </TabsTrigger>
              <TabsTrigger
                value="menu"
                className="rounded-xl font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                Menu Setup
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Activity className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Live Order Dashboard
                  </h2>
                </div>
                <Badge className="bg-green-100 text-green-800 px-3 py-1">
                  Real-time Updates
                </Badge>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {state.orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="group"
                    >
                      <Card className="border border-gray-200 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-3 rounded-2xl">
                                <ChefHat className="w-6 h-6 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900">
                                  {order.customerName}
                                </h3>
                                <p className="text-gray-600 font-medium">
                                  {order.meal}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">
                                    {new Date(
                                      order.orderTime,
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                  {order.price}
                                </p>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex flex-col space-y-2">
                                {order.status === "preparing" && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      updateOrderStatus(order.id, "ready")
                                    }
                                    className="bg-green-500 hover:bg-green-600 text-white"
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
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                  >
                                    Mark Delivered
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {state.orders.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No orders yet today
                    </h3>
                    <p className="text-gray-500">
                      Orders will appear here in real-time
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Meals Tab */}
            <TabsContent value="meals" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Meal Collection
                </h2>
                <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300">
                      <PlusCircle className="w-5 h-5 mr-2" />
                      Add New Meal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-gray-900">
                        Create New Meal
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="font-semibold">
                          Meal Name
                        </Label>
                        <Input
                          id="name"
                          value={newMeal.name}
                          onChange={(e) =>
                            setNewMeal({ ...newMeal, name: e.target.value })
                          }
                          placeholder="Enter delicious meal name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description" className="font-semibold">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={newMeal.description}
                          onChange={(e) =>
                            setNewMeal({
                              ...newMeal,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe this amazing dish..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price" className="font-semibold">
                            Price
                          </Label>
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
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="prepTime" className="font-semibold">
                            Prep Time
                          </Label>
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
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="image" className="font-semibold">
                          Image URL (optional)
                        </Label>
                        <Input
                          id="image"
                          value={newMeal.image}
                          onChange={(e) =>
                            setNewMeal({
                              ...newMeal,
                              image: e.target.value,
                            })
                          }
                          placeholder="https://example.com/image.jpg"
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={handleAddMeal}
                        disabled={
                          !newMeal.name ||
                          !newMeal.description ||
                          !newMeal.price ||
                          state.loading
                        }
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-3 font-semibold"
                      >
                        {state.loading ? "Adding..." : "Add Meal"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {state.meals.map((meal, index) => (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                        <CardHeader className="p-0">
                          <div className="relative overflow-hidden rounded-t-lg">
                            <img
                              src={meal.image}
                              alt={meal.name}
                              className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-white/90 text-gray-800">
                                <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                                {meal.rating}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">
                                {meal.name}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {meal.description}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-orange-600">
                                {meal.price}
                              </span>
                              <span className="text-sm text-gray-500 font-medium">
                                {meal.prepTime}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className="border-orange-200 text-orange-700"
                              >
                                <Award className="w-3 h-3 mr-1" />
                                {meal.category}
                              </Badge>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="p-2 hover:bg-orange-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteMeal(meal.id)}
                                  className="p-2 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            {/* Menu Setup Tab */}
            <TabsContent value="menu" className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Today's Menu Setup
                </h2>
              </div>

              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6 font-medium">
                    Select which meals to feature in today's menu for customers
                  </p>
                  <div className="space-y-4">
                    {state.meals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={meal.image}
                            alt={meal.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {meal.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {meal.price}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge
                            className={
                              meal.available
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {meal.available ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            size="sm"
                            variant={meal.available ? "outline" : "default"}
                            className={
                              meal.available
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }
                          >
                            {meal.available ? "Remove" : "Add to Menu"}
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
    </div>
  );
}
