-- Mealy Database Schema

-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'caterer')),
    caterer_id INTEGER REFERENCES caterers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Caterers table for multi-caterer support
CREATE TABLE caterers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal options that caterers can create
CREATE TABLE meal_options (
    id SERIAL PRIMARY KEY,
    caterer_id INTEGER REFERENCES caterers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category VARCHAR(100),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily menus created by caterers
CREATE TABLE daily_menus (
    id SERIAL PRIMARY KEY,
    caterer_id INTEGER REFERENCES caterers(id) ON DELETE CASCADE,
    menu_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(caterer_id, menu_date)
);

-- Meal options included in daily menus
CREATE TABLE menu_meal_options (
    id SERIAL PRIMARY KEY,
    menu_id INTEGER REFERENCES daily_menus(id) ON DELETE CASCADE,
    meal_option_id INTEGER REFERENCES meal_options(id) ON DELETE CASCADE,
    quantity_available INTEGER DEFAULT -1, -- -1 means unlimited
    UNIQUE(menu_id, meal_option_id)
);

-- Customer orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    caterer_id INTEGER REFERENCES caterers(id) ON DELETE CASCADE,
    menu_id INTEGER REFERENCES daily_menus(id),
    meal_option_id INTEGER REFERENCES meal_options(id),
    quantity INTEGER DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications for customers
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    caterer_id INTEGER REFERENCES caterers(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general', 'menu_update', 'order_update', 'payment')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_daily_menus_date ON daily_menus(menu_date);
CREATE INDEX idx_daily_menus_caterer ON daily_menus(caterer_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_caterer ON orders(caterer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Insert default caterer
INSERT INTO caterers (name, description, contact_email, contact_phone, address) 
VALUES ('Mealy Kitchen', 'Premium meal delivery service', 'admin@mealy.com', '+254700000000', 'Nairobi, Kenya');

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role, caterer_id) 
VALUES ('admin@mealy.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin', 1);
