// Today's menu API route
export default function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Demo menu data
  const todaysMenu = [
    {
      id: 1,
      name: "Beef with Jasmine Rice",
      description:
        "Tender beef strips marinated in herbs, served with fragrant jasmine rice and seasonal vegetables",
      price: 15.99,
      rating: 4.8,
      prepTime: "25-30 min",
      category: "Main Course",
      available: true,
      image:
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=300&fit=crop&auto=format",
    },
    {
      id: 2,
      name: "Chicken Teriyaki Stir Fry",
      description:
        "Succulent chicken breast with fresh vegetables in our signature teriyaki glaze",
      price: 13.99,
      rating: 4.6,
      prepTime: "20-25 min",
      category: "Main Course",
      available: true,
      image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=300&fit=crop&auto=format",
    },
    {
      id: 3,
      name: "Mediterranean Pasta",
      description:
        "Fresh pasta with sun-dried tomatoes, olives, feta cheese, and herbs in olive oil",
      price: 12.99,
      rating: 4.5,
      prepTime: "15-20 min",
      category: "Main Course",
      available: true,
      image:
        "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500&h=300&fit=crop&auto=format",
    },
    {
      id: 4,
      name: "Grilled Salmon",
      description:
        "Atlantic salmon fillet with lemon butter sauce, roasted vegetables, and quinoa",
      price: 18.99,
      rating: 4.9,
      prepTime: "25-30 min",
      category: "Main Course",
      available: true,
      image:
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&h=300&fit=crop&auto=format",
    },
    {
      id: 5,
      name: "BBQ Pork Ribs",
      description:
        "Slow-cooked pork ribs with smoky BBQ sauce, coleslaw, and sweet potato fries",
      price: 19.99,
      rating: 4.8,
      prepTime: "35-40 min",
      category: "Main Course",
      available: true,
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=300&fit=crop&auto=format",
    },
    {
      id: 6,
      name: "Vegetarian Buddha Bowl",
      description:
        "Quinoa, roasted vegetables, avocado, chickpeas with tahini dressing",
      price: 11.99,
      rating: 4.4,
      prepTime: "20-25 min",
      category: "Vegetarian",
      available: true,
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop&auto=format",
    },
    {
      id: 7,
      name: "Chocolate Lava Cake",
      description:
        "Warm chocolate cake with molten center, served with vanilla ice cream",
      price: 7.99,
      rating: 4.9,
      prepTime: "15-20 min",
      category: "Dessert",
      available: true,
      image:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=300&fit=crop&auto=format",
    },
  ];

  res.json({
    success: true,
    data: todaysMenu,
  });
}
