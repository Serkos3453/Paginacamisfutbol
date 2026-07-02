from django.urls import path
from . import views

urlpatterns = [
    # JSON APIs
    path('api/csrf/', views.get_csrf_token, name='api_csrf'),
    path('api/categorias/', views.api_categorias, name='api_categorias'),
    path('api/camisetas/', views.api_catalogo, name='api_catalogo'),
    path('api/camiseta/<int:pk>/', views.api_detalle_camiseta, name='api_detalle_camiseta'),
    path('api/checkout/', views.api_checkout, name='api_checkout'),
    path('api/confirmacion/<int:pk>/', views.api_confirmacion, name='api_confirmacion'),
    
    # Auth APIs
    path('api/auth/register/', views.api_register, name='api_register'),
    path('api/auth/login/', views.api_login, name='api_login'),
    path('api/auth/logout/', views.api_logout, name='api_logout'),
    path('api/auth/me/', views.api_me, name='api_me'),

    # User Orders APIs
    path('api/mis-pedidos/', views.api_mis_pedidos, name='api_mis_pedidos'),
    path('api/pedido/<int:pk>/cancelar/', views.api_cancelar_pedido, name='api_cancelar_pedido'),
    path('api/pedido/<int:pk>/modificar/', views.api_modificar_pedido, name='api_modificar_pedido'),

    # Cesta APIs
    path('cesta/', views.ver_cesta, name='cesta'),
    path('cesta/agregar/', views.agregar_cesta, name='agregar_cesta'),
    path('cesta/eliminar/', views.eliminar_de_cesta, name='eliminar_de_cesta'),
    path('cesta/actualizar/', views.actualizar_cesta, name='actualizar_cesta'),

    # SPA Routes (Django serves built index.html)
    path('', views.index_spa, name='catalogo'),
    path('camiseta/<int:pk>/', views.index_spa, name='detalle_camiseta'),
    path('checkout/', views.index_spa, name='checkout'),
    path('confirmacion/<int:pk>/', views.index_spa, name='confirmacion'),
    path('retro/', views.index_spa, name='catalogo_retro'),
    path('login/', views.index_spa, name='login_spa'),
    path('registro/', views.index_spa, name='registro_spa'),
    path('mis-pedidos/', views.index_spa, name='mis_pedidos_spa'),
]
