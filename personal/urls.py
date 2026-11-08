from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path , include
from personal.views import *

app_name='personal'

urlpatterns = [
    path('index/',index,name='index'),
    path('about/',about,name='about'),
    path('skills/',skills,name='skills'),
    path('projects/',projects,name='projects'),
    path('contact/',contact,name='contact'),
    

    path("accuonts/",include("django.contrib.auth.urls")),
    path('signup/',signup,name='signup'),

]