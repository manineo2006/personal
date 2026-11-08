from django.db import models
import uuid
from django.conf import settings

class Contacts (models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,null=True ,blank=True,on_delete=models.SET_NULL,related_name="contact",)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=150)
    messages = models.TextField()
    send_at = models.DateTimeField(auto_now=True)
    is_read = models.BooleanField(default=False)
    telegram_message_id =models.BigIntegerField(null=True, blank= True,db_index=True)

    class Meta:
        ordering = ["-send_at"]

    def __str__(self):
        return f"{self.name}, {self.subject}"

class Reply(models.Model):
    contact_message = models.ForeignKey(Contacts,on_delete=models.CASCADE,related_name="replies",)
    text = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    seen_by_user = models.BooleanField(default=False)

    class Meta:
        ordering =["sent_at"]

    def __str__ (self):
        return f"reply to {self.contact_message_id}"
