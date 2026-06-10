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
]
