"""
URL configuration for project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from ForFabMetals import views as Fab_View

urlpatterns = [
    path('admin/', admin.site.urls), # É recomendável manter a rota do admin
    
    # Inclui as URLs do app ForFabMetals a partir da raiz do site
    path('ForFabMetals/', include('ForFabMetals.urls')), 
    path('login.html', include('ForFabMetals.urls')), 

    # Cada path agora tem uma URL diferente
    #path('',Fab_View.index, name='index'),
    #path('/login/', Fab_View.login, name='login'),
    #path('home/', Fab_View.Home, name='home'),
    #path('pcp/', Fab_View.Pcp, name='pcp'),
    #path('almoxarifado/', Fab_View.Almox, name='almoxarifado'),
    #path('apontamento/', Fab_View.Aponte, name='apontamento'),
    #path('producao/', Fab_View.Producao, name='producao'),
    #path('engenharia/', Fab_View.Engenharia, name='engenharia'),
    #path('qualidade/', Fab_View.Quality, name='qualidade'),
    #path('gestao/', Fab_View.Management, name='gestao'),

]