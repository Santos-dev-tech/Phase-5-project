from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class User(AbstractUser):
    """Extended User model for restaurant customers and admins"""
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('admin', 'Restaurant Admin'),
        ('chef', 'Chef'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"


class Category(models.Model):
    """Food categories like Main Course, Dessert, etc."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name


class Meal(models.Model):
    """Restaurant meals/dishes"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='meals')
    image = models.URLField(blank=True, null=True)
    prep_time = models.CharField(max_length=50, help_text="e.g., '20-25 min'")
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=1, 
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def price_ksh(self):
        """Return price in KSH (multiply by 100)"""
        return int(self.price * 100)


class DailyMenu(models.Model):
    """Daily menu configuration"""
    date = models.DateField(unique=True)
    meals = models.ManyToManyField(Meal, related_name='daily_menus')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Menu for {self.date}"


class Order(models.Model):
    """Customer orders"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cash_on_delivery', 'Cash on Delivery'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_reference = models.CharField(max_length=200, blank=True, null=True)
    mpesa_receipt = models.CharField(max_length=100, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        # Auto-calculate total amount
        if not self.total_amount:
            self.total_amount = self.meal.price * self.quantity
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Order {self.id} - {self.customer.username} - {self.meal.name}"
    
    @property
    def total_amount_ksh(self):
        """Return total amount in KSH"""
        return int(self.total_amount * 100)


class Review(models.Model):
    """Meal reviews by customers"""
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name='reviews')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['customer', 'meal']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer.username} - {self.meal.name} - {self.rating}★"


class RestaurantSettings(models.Model):
    """Restaurant configuration settings"""
    name = models.CharField(max_length=200, default="Mealy Fine Dining")
    description = models.TextField(default="Experience culinary excellence")
    phone = models.CharField(max_length=20, default="+254 712 345 678")
    email = models.EmailField(default="hello@mealy.restaurant")
    address = models.TextField(default="123 Culinary Street, Nairobi, Kenya")
    business_phone = models.CharField(max_length=15, default="0746013145")
    mpesa_shortcode = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Restaurant Settings"
        verbose_name_plural = "Restaurant Settings"
    
    def __str__(self):
        return self.name
