from django.urls import path
from . import views

urlpatterns = [
    path('', views.catalogo, name='catalogo'),
    path('camiseta/<int:pk>/', views.detalle_camiseta, name='detalle_camiseta'),
    path('cesta/', views.ver_cesta, name='cesta'),
    path('cesta/agregar/', views.agregar_cesta, name='agregar_cesta'),
    path('cesta/eliminar/', views.eliminar_de_cesta, name='eliminar_de_cesta'),
    path('cesta/actualizar/', views.actualizar_cesta, name='actualizar_cesta'),
    path('checkout/', views.checkout, name='checkout'),
    path('confirmacion/<int:pk>/', views.confirmacion, name='confirmacion'),
    path('retro/', views.catalogo_retro, name='catalogo_retro'),
]
