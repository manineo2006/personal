from django.contrib.auth import login,logout,authenticate
from django.shortcuts import render, redirect
from datetime import date
from django.utils import timezone
import calendar


def login_viwe(request):
    if request.method == 'POST':
        user = authenticate(
            request,
            username=request.POST["username"],
            password=request.POST["password"],
        )
    if user is not None:
        login(request,user)
        return redirct("dashboard")
        return render(request,"login.html",{"error":"invalid credentials"})
    return render(request,"login.html")

def logout_view(request):
    logout(request)
    return redirect("login")

def index(request):
    return render(request,'personal/index.html',{'the_date':the_date()})

def about(request):
    return render(request,'personal/about.html',{'the_date':the_date()}) 

def projects(request):
    return render(request,'personal/projects.html')

def skills(request):
    return render(request,'personal/skills.html')

def contact(request):
    return render(request,'personal/contact.html',{'the_date':the_date()})

def signup(request):
    return render(request,'personal/signup.html')


def _add_months(d, months):
    y, m = divmod(d.month - 1 + months, 12)
    y += d.year
    m += 1
    day = min(d.day, calendar.monthrange(y, m)[1])
    return date(y, m, day)


def calculate_date_difference(start, today=None):
    today = today or date.today()
    if start > today:
        return 0, 0, 0
    total_months = (today.year - start.year) * 12 + today.month - start.month
    if _add_months(start, total_months) > today:
        total_months -= 1
    anchor = _add_months(start, total_months)
    days = (today - anchor).days
    return total_months // 12, total_months % 12, days



def the_date ():
    start_date = date(2025, 7, 16)

    years ,months ,days =calculate_date_difference(start_date)
    
    result= f"{years}سال/{months}ماه/{days}روز"

    return result