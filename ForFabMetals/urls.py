
from django.http import HttpResponse
from django.urls import path
from . import views as Fab_View



urlpatterns = [
    # Cada path agora tem uma URL diferente
    path('',Fab_View.index, name='index'),
    path('login/', Fab_View.login, name='login'),
    path('home/', Fab_View.Home, name='home'),
    path('pcp/', Fab_View.Pcp, name='pcp'),
    path('almoxarifado/', Fab_View.Almox, name='almoxarifado'),
    path('apontamento/', Fab_View.Aponte, name='apontamento'),
    path('producao/', Fab_View.Producao, name='producao'),
    path('engenharia/', Fab_View.Engenharia, name='engenharia'),
    path('qualidade/', Fab_View.Quality, name='qualidade'),
    path('gestao/', Fab_View.Management, name='gestao'),
]