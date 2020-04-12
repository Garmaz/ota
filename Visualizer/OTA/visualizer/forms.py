from django import forms
import os

dataPath = os.getcwd()+"\\static\\data\\"
fileNames = [("","----")]
for n in os.listdir(dataPath):
    fileNames.append((n,n))

class selectForm(forms.Form):
    select_file = forms.ChoiceField(choices = fileNames)