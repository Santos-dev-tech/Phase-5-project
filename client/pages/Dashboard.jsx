import { useEffect, useState } from "react";
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
  Heart,
  TrendingUp,
  Award,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import MpesaPayment from "@/components/MpesaPayment";

export default function Dashboard() {
  const { state, actions } = useApp();
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [likedMeals, setLikedMeals] = useState(new Set());
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedMealForPayment, setSelectedMealForPayment] = useState(null);

  useEffect(() => {
    actions.loadTodaysMenu();
    if (state.user) {
      // Load user's current order
      const userOrder = state.orders.find(
        (order) =>
          order.customerId === state.user?.id && order.status !== "delivered",
      );
      setCurrentOrder(userOrder);
      if (userOrder) {
        setSelectedMeal(userOrder.mealId);
      }
    }
  }, [state.user]);

  const handleOrderMeal = (meal) => {
    setSelectedMealForPayment(meal);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (meal) => {
    await actions.placeOrder(meal.id);
    setCurrentOrder(meal);
    setSelectedMeal(meal.id);
    setPaymentModalOpen(false);
    setSelectedMealForPayment(null);
  };

  const handleChangeOrder = () => {
    setCurrentOrder(null);
    setSelectedMeal(null);
  };

  const toggleLike = (mealId) => {
    const newLiked = new Set(likedMeals);
    if (newLiked.has(mealId)) {
      newLiked.delete(mealId);
    } else {
      newLiked.add(mealId);
    }
    setLikedMeals(newLiked);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Please Sign In
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to view today's menu and place orders
            </p>
            <Button asChild className="w-full">
              <a href="/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="bg-gradient-to-br from-white via-orange-50 to-green-50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-100/50">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-4"
            >
              Welcome, {state.user.name}!
            </motion.h1>
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="flex items-center space-x-2 text-orange-600">
                <Calendar className="w-6 h-6" />
                <span className="text-xl font-semibold">
                  {getCurrentDate()}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <Smartphone className="w-6 h-6" />
                <span className="text-lg font-medium">M-Pesa Ready</span>
              </div>
            </div>
            <p className="text-gray-700 text-lg">
              Discover today's carefully crafted culinary delights - Pay
              instantly with M-Pesa!
            </p>
          </div>
        </motion.div>

        {/* Current Order Status */}
        <AnimatePresence>
          {currentOrder && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl shadow-lg">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          Order Confirmed!
                        </h3>
                        <p className="text-gray-700 text-lg">
                          <strong>
                            {currentOrder.meal || currentOrder.name}
                          </strong>
                        </p>
                        <p className="text-green-600 font-semibold">
                          Status:{" "}
                          {currentOrder.status?.charAt(0).toUpperCase() +
                            currentOrder.status?.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600 mb-2">
                        ${currentOrder.price}
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleChangeOrder}
                        className="border-green-500 text-green-600 hover:bg-green-50"
                      >
                        Change Order
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-orange-500/20 backdrop-blur-md rounded-full text-orange-200 text-lg font-medium border border-orange-400/30 mb-6">
              <Calendar className="w-5 h-5 mr-3" />
              {getCurrentDate()}
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-4">
              Today's Menu
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
              Chef's special selections crafted with passion and delivered with
              love
            </p>
          </div>
        </motion.div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <AnimatePresence>
            {state.todaysMenu.map((meal, index) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card
                  className={`hover:shadow-2xl transition-all duration-500 group-hover:scale-105 ${
                    selectedMeal === meal.id
                      ? "ring-4 ring-orange-500 border-orange-500 shadow-2xl"
                      : "shadow-xl"
                  } ${!meal.available ? "opacity-60" : ""} bg-white/95 backdrop-blur-xl border-orange-100/50`}
                >
                  <CardHeader className="p-0 relative overflow-hidden">
                    <div className="relative">
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {!meal.available && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Badge
                            variant="destructive"
                            className="text-lg px-4 py-2"
                          >
                            Sold Out
                          </Badge>
                        </div>
                      )}

                      <div className="absolute top-4 right-4 flex space-x-2">
                        <div className="bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-bold text-gray-900">
                              {meal.rating}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(meal.id)}
                          className="bg-white/90 backdrop-blur-md rounded-xl p-2 shadow-lg hover:bg-white"
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              likedMeals.has(meal.id)
                                ? "text-red-500 fill-current"
                                : "text-gray-600"
                            }`}
                          />
                        </Button>
                      </div>

                      <div className="absolute top-4 left-4 flex flex-col space-y-2">
                        {meal.category === "Main Course" && (
                          <Badge className="bg-orange-500 text-white">
                            <Award className="w-3 h-3 mr-1" />
                            Chef's Choice
                          </Badge>
                        )}
                        <Badge className="bg-green-500 text-white">
                          <Smartphone className="w-3 h-3 mr-1" />
                          M-Pesa Pay
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {meal.name}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {meal.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {meal.prepTime}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-orange-200 text-orange-700"
                        >
                          {meal.category}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          <div className="text-3xl font-bold text-orange-600">
                            KSH {(meal.price * 130).toFixed(0)}
                          </div>
                          <div className="text-sm text-gray-500">
                            (${meal.price})
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-green-600">
                          <CreditCard className="w-4 h-4" />
                          <span className="text-sm font-medium">M-Pesa</span>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                        onClick={() => handleOrderMeal(meal)}
                        disabled={
                          !meal.available ||
                          selectedMeal === meal.id ||
                          !!currentOrder ||
                          state.loading
                        }
                      >
                        {selectedMeal === meal.id ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Ordered
                          </>
                        ) : !meal.available ? (
                          "Sold Out"
                        ) : currentOrder ? (
                          "Order Already Placed"
                        ) : state.loading ? (
                          "Processing..."
                        ) : (
                          <>
                            <Smartphone className="w-5 h-5 mr-2" />
                            Pay with M-Pesa
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100/50 p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Your Order History
            </h2>
            <div className="flex items-center space-x-2 text-orange-600">
              <TrendingUp className="w-6 h-6" />
              <span className="font-semibold">Recent Orders</span>
            </div>
          </div>

          <div className="space-y-4">
            {state.orders
              .filter((order) => order.customerId === state.user?.id)
              .slice(0, 5)
              .map((order) => (
                <Card
                  key={order.id}
                  className="border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-orange-100 to-green-100 p-3 rounded-xl">
                          <ShoppingCart className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {order.meal}
                          </h3>
                          <p className="text-gray-600">
                            {new Date(order.orderTime).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Smartphone className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">
                              Paid via M-Pesa
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                          ${order.price}
                        </p>
                        <Badge
                          className={
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : order.status === "ready"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {state.orders.filter((order) => order.customerId === state.user?.id)
              .length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-500">
                  Start by ordering from today's menu above!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* M-Pesa Payment Modal */}
        <MpesaPayment
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedMealForPayment(null);
          }}
          meal={selectedMealForPayment}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
}
