from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'Mealy Restaurant API v3.0 - Django Backend with Real M-Pesa',
        'version': '3.0.0',
        'backend': 'Django',
        'mpesa': 'Live Integration Ready',
        'business_account': '0746013145',
        'endpoints': {
            'admin': '/admin/',
            'auth': '/api/auth/',
            'restaurant': '/api/restaurant/',
            'payments': '/api/payments/',
            'health': '/api/health/',
        }
    })

def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'timestamp': '2024-01-01T00:00:00Z',
        'service': 'Mealy Restaurant Django API',
        'mpesa': 'configured',
        'business_account': '0746013145',
        'version': '3.0.0'
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/health/', health_check, name='health-check'),
    path('api/auth/', include('restaurant.urls.auth')),
    path('api/restaurant/', include('restaurant.urls')),
    path('api/payments/', include('payments.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
