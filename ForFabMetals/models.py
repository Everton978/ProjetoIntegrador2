from django.db import models
from django.utils import timezone

# Create your models here.

class Project(models.Model):
    Category=models.CharField(max_length= 50, blank=False)


class Files(models.Model):
    
    Name_File = models.CharField(max_length= 50)
    Drawing_File = models.FileField(blank = False, upload_to = 'Drawning/%Y/%m/%d')
    Create_Date = models.DateTimeField(default=timezone.now)
    Description = models.TextField(blank=True)
    project = models.ForeignKey(Project,on_delete= models. SET_NULL,blank=True,null=True)

class User(models.Model):
    Ra = models.CharField(max_length=20,blank=False,null=False)
    Name = models.CharField(max_length=80,blank=False,null=False)
    Turma = models.CharField(max_length=6,blank=False,null=False)
    Create_Date = models.DateTimeField(default=timezone.now)

#class ProducOrder(models.Model):
