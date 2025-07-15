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
  Award,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Index() {
  return (
    <div className="space-y-0 relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop&auto=format')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-orange-900/60 to-black/70"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center px-6 py-3 bg-orange-500/20 backdrop-blur-md rounded-full text-orange-200 text-lg font-medium border border-orange-400/30">
              <ChefHat className="w-5 h-5 mr-3" />
              Crafted with Passion Since 2024
            </div>
            <h1 className="text-5xl lg:text-8xl font-bold text-white mb-8 tracking-tight">
              Culinary
              <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Excellence
              </span>
              <span className="block text-4xl lg:text-6xl">Awaits You</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              Experience the finest dining with our chef-crafted meals, made
              from the freshest ingredients and delivered with love to your
              doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                <Link to="/register">Start Your Journey</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-xl px-12 py-6 rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105"
              >
                <Link to="/dashboard">Explore Menu</Link>
              </Button>
            </div>

            {/* Floating Food Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="group"
              >
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-500 group-hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <img
                      src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop&auto=format"
                      alt="Gourmet Beef"
                      className="w-full h-32 object-cover rounded-xl mb-4 group-hover:scale-110 transition-transform duration-500"
                    />
                    <h3 className="text-lg font-bold text-white mb-2">
                      Gourmet Beef
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Premium cuts, perfectly seasoned
                    </p>
                    <div className="flex items-center justify-center mt-3">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-white font-semibold">4.9</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="group"
              >
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-500 group-hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <img
                      src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop&auto=format"
                      alt="Fresh Salmon"
                      className="w-full h-32 object-cover rounded-xl mb-4 group-hover:scale-110 transition-transform duration-500"
                    />
                    <h3 className="text-lg font-bold text-white mb-2">
                      Fresh Salmon
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Ocean-fresh, expertly prepared
                    </p>
                    <div className="flex items-center justify-center mt-3">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-white font-semibold">4.8</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="group"
              >
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-500 group-hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <img
                      src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop&auto=format"
                      alt="Fresh Vegetables"
                      className="w-full h-32 object-cover rounded-xl mb-4 group-hover:scale-110 transition-transform duration-500"
                    />
                    <h3 className="text-lg font-bold text-white mb-2">
                      Garden Fresh
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Organic, locally sourced produce
                    </p>
                    <div className="flex items-center justify-center mt-3">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-white font-semibold">4.7</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white/95 backdrop-blur-xl relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Why Choose
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                {" "}
                Mealy?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're not just about food delivery - we're about creating
              unforgettable culinary experiences that bring joy to your table.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Clock,
                title: "Lightning Fast",
                description:
                  "Fresh meals delivered hot in 30 minutes or less, guaranteed.",
                color: "from-blue-500 to-cyan-500",
                delay: 0.1,
              },
              {
                icon: ChefHat,
                title: "Master Chefs",
                description:
                  "Award-winning chefs with decades of culinary excellence.",
                color: "from-orange-500 to-red-500",
                delay: 0.2,
              },
              {
                icon: Shield,
                title: "Quality Promise",
                description:
                  "100% satisfaction guarantee with premium ingredients.",
                color: "from-green-500 to-emerald-500",
                delay: 0.3,
              },
              {
                icon: Heart,
                title: "Made with Love",
                description:
                  "Every dish crafted with passion and attention to detail.",
                color: "from-pink-500 to-rose-500",
                delay: 0.4,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, duration: 0.6 }}
                className="group"
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-105 h-full">
                  <CardContent className="p-8 text-center h-full flex flex-col">
                    <div
                      className={`bg-gradient-to-r ${feature.color} w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed flex-grow">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop&auto=format')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-orange-500/90"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            {[
              { number: "15K+", label: "Happy Customers", icon: Users },
              { number: "100+", label: "Signature Dishes", icon: ChefHat },
              { number: "4.9", label: "Customer Rating", icon: Star },
              { number: "24/7", label: "Service Available", icon: Clock },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group"
              >
                <div className="text-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-12 h-12 text-orange-200 mx-auto mb-4" />
                  <div className="text-5xl lg:text-7xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-orange-100 text-xl font-medium">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1920&h=1080&fit=crop&auto=format')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-800/90 to-gray-900/95"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center px-6 py-3 bg-orange-500/20 backdrop-blur-md rounded-full text-orange-200 text-lg font-medium border border-orange-400/30">
              <Award className="w-5 h-5 mr-3" />
              Join Our Culinary Community
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8">
              Ready to Experience
              <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Extraordinary Flavors?
              </span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Join thousands of food lovers who trust us with their daily
              culinary adventures. Your taste buds will thank you.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                <Link to="/register">Begin Your Journey</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-xl px-12 py-6 rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105"
              >
                <Link to="/login">Welcome Back</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
