from django.shortcuts import render
from django.http import HttpResponse

from django import forms

from .forms import selectForm

import os 
# from .forms import selectForm


# Create your views here.
def index(request):
    context = {}
    context['form'] = selectForm()
    context['fileName']=''
    if request.GET: 
        temp = request.GET['select_file'] 
        print(temp,"was selected")
        context['fileName']=temp
        print(context['fileName'])
        return render(request, 'home.html',context)
    return render(request, 'home.html',context)