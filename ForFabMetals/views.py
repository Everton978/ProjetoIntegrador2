from django.shortcuts import render
from django.http import HttpResponse
# REMOVA esta linha que está causando conflito:
# from django.contrib.auth import login

def index(request):
     print('index')
     return render(request, 'index.html')

def login_view(request):  # 👈 RENOMEIE para login_view
    print('login')
    return render(request, 'login.html')

def Home(request):
    return render(request, 'home.html')

def Pcp(request):
     return render(request, 'pcp.html')

def Almox(request):
     return render(request, 'almoxarifado.html')

def Aponte(request):
     return render(request, 'apontamento.html')

def Producao(request):
     return render(request, 'producao.html')

def Engenharia(request):
     return render(request, 'engenharia.html')

def Quality(request):
     return render(request, 'qualidade.html')

def Management(request):
     return render(request, 'gestao.html')  # SEM 'templates/'