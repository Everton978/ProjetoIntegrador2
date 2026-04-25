
from django.urls import path
from ForFabMetals import views as Fab_View

app_name = 'ForFabMetals'

'''
urlpatterns = [
    path('ForFab/', Fab_View.login),
    path('ForFab/', Fab_View.Home),
    path('ForFab/', Fab_View.Pcp),
    path('ForFab/', Fab_View.Almox),
    path('ForFab/', Fab_View.Aponte),
    path('ForFab/', Fab_View.Producao),
    path('ForFab/', Fab_View.Engenharia),
    path('ForFab/', Fab_View.Quality),
    path('ForFab/', Fab_View.Management),
    
]

'''


urlpatterns = [
    # Cada path agora tem uma URL diferente
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