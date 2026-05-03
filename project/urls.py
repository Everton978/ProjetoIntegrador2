from django.contrib import admin
from django.urls import path, include
from ForFabMetals import views as Fab_View # Mantemos isso apenas para a página inicial

urlpatterns = [
    path('admin/', admin.site.urls), 
    
    # 1. Deixando a raiz (127.0.0.1:8000/) apontar para o seu index
    path('', Fab_View.index, name='index'),

    # 2. Delegando TODAS as outras rotas para o urls.py do seu aplicativo
    path('ForFabMetals/', include('ForFabMetals.urls')),
]