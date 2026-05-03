from django.urls import path
from . import views

app_name = 'ForFabMetals'

urlpatterns = [
    path('', views.index, name='index'), 
    path('login/', views.login_view, name='login'),  
    path('home/', views.Home, name='home'),
    path('pcp/', views.Pcp, name='pcp'),
    path('almoxarifado/', views.Almox, name='almoxarifado'),
    path('apontamento/', views.Aponte, name='apontamento'),
    path('producao/', views.Producao, name='producao'),
    path('engenharia/', views.Engenharia, name='engenharia'),
    path('qualidade/', views.Quality, name='qualidade'),
    path('gestao/', views.Management, name='gestao'),
]