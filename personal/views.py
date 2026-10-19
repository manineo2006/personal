from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request,'personal/index.html')

def about(request):
    return render(request,'personal/about.html') 

def projects(request):
    return render(request,'personal/projects.html')

def skills(request):
    return render(request,'personal/skills.html')

def contact(request):
    return render(request,'personal/contact.html')