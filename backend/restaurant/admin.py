from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Category, Meal, DailyMenu, Order, Review, RestaurantSettings


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'is_active')
    list_filter = ('role', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone_number')
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Restaurant Info', {'fields': ('role', 'phone_number')}),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)


@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'rating', 'available', 'created_at')
    list_filter = ('category', 'available', 'created_at')
    search_fields = ('name', 'description')
    list_editable = ('price', 'available')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(DailyMenu)
class DailyMenuAdmin(admin.ModelAdmin):
    list_display = ('date', 'is_active', 'created_at')
    list_filter = ('is_active', 'date')
    filter_horizontal = ('meals',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'meal', 'status', 'payment_status', 'total_amount', 'created_at')
    list_filter = ('status', 'payment_status', 'created_at')
    search_fields = ('customer__username', 'meal__name', 'payment_reference', 'mpesa_receipt')
    readonly_fields = ('id', 'created_at', 'updated_at', 'total_amount')
    
    fieldsets = (
        ('Order Info', {
            'fields': ('id', 'customer', 'meal', 'quantity', 'total_amount', 'notes')
        }),
        ('Status', {
            'fields': ('status', 'payment_status')
        }),
        ('Payment Info', {
            'fields': ('payment_reference', 'mpesa_receipt')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('customer', 'meal', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('customer__username', 'meal__name', 'comment')
    readonly_fields = ('created_at',)


@admin.register(RestaurantSettings)
class RestaurantSettingsAdmin(admin.ModelAdmin):
    list_display = ('name', 'business_phone', 'is_active', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')
    
    def has_add_permission(self, request):
        # Only allow one settings instance
        return not RestaurantSettings.objects.exists()
