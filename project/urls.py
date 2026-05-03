"""
URL configuration for project project.
"""
from django.contrib import admin
from django.urls import path
from ForFabMetals import views as Fab_View

urlpatterns = [
    path('admin/', admin.site.urls), 
    
    # 1. A raiz do site inicia no index
    path('', Fab_View.index, name='index'),

    # 2. Caminho específico interno para as funções de login
    path('login/', Fab_View.login, name='login'),

    # 3. Rota para a Home (acessada após validação)
    path('home/', Fab_View.Home, name='home'),

    # Demais rotas do seu sistema
    path('pcp/', Fab_View.Pcp, name='pcp'),
    path('almoxarifado/', Fab_View.Almox, name='almoxarifado'),
    path('apontamento/', Fab_View.Aponte, name='apontamento'),
    path('producao/', Fab_View.Producao, name='producao'),
    path('engenharia/', Fab_View.Engenharia, name='engenharia'),
    path('qualidade/', Fab_View.Quality, name='qualidade'),
    path('gestao/', Fab_View.Management, name='gestao'),
]