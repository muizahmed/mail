from django.contrib import admin

from .models import Email

# Register your models here.
class EmailAdmin(admin.ModelAdmin):
    list_display = ('timestamp', )

admin.site.register(Email, EmailAdmin)
