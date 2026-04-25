from django.shortcuts import render
#from django.http import HttpResponse #usado para respostas http

# Create your views here.


# HTTP Request <-> Http Response

# django trabalha com MVT ( equivalente a MVC)
#  Model -->Base de Dados,
#  View --> Controla as chamadas das paginas(Controller)Receberequests, 
# Template -->Paginas

def login(request):
    #Retorna http response
    print ('login')
    #return HttpResponse('Hello,Word!') Resposta http
    return render(request,'login.html')

def Home(request):
    return render (request,'home.html')


def Pcp(request):
     return render (request,'pcp.html')

def Almox(request):
     return render (request,'almoxarifado.html')

def Aponte(request):
     return render (request,'apontamento.html')

def Producao(request):
     return render (request,'producao.html')

def Engenharia(request):
     return render (request,'engenharia.html')

def Quality(request):
     return render (request,'qualidade.html')

def Management(request):
     return render (request,'gestao.html')