from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("User", related_name="following", null=True)

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    content = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField("User", related_name="liked_posts", blank=True, null=True)

    def serialize(self):
        return {
            "id": self.id,
            "username": self.user.username,
            "content": self.content, 
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            "likes": [like.username for like in self.likes.all()]
        }

