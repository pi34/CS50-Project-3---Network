
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("new", views.new_post, name="new"),
    path("posts/<str:post_page>", views.all, name="all_posts"),
    path("post/<int:id>", views.post, name="post"),
    path("followers/<str:username>", views.followers, name="followers")
]
