from django.contrib import admin
from .models import *

class ReplyInline(admin.TabularInline):
    model = Reply
    extra = 0

@admin.register(Contacts)
class conactmassagesAdmin(admin.ModelAdmin):
    list_display=("name","email","subject","send_at","is_read")
    list_filter=("is_read","send_at")
    search_fields =("name","email","subject")
    readonly_filds =("id" ,"send_at","telegram_massage_id")
    inline = [ReplyInline]

# Register your models here.
