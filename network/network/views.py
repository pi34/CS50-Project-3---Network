from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import User, Post

import json


def index(request):
    return render(request, "network/index.html")


@csrf_exempt
def followers(request, username):
    user = User.objects.get(username=username)
    if request.method == "PUT":
        if request.user in user.followers.all():
            user.followers.remove(request.user)
        else:
            user.followers.add(request.user)
        return HttpResponse(status=204)
    else:
        return JsonResponse({"followers": [user.username for user in user.followers.all()], "following": [user.username for user in user.following.all()]})


@csrf_exempt
def new_post(request):
    data = json.loads(request.body)
    body = data.get("body", "")
    if request.method == "POST":
        post = Post(user=request.user, content=body)
        post.save()

    return HttpResponse("Successful!")


@csrf_exempt
def post(request, id):
    if request.method == "PUT":
        data = json.loads(request.body)
        body = data.get("body")
        post = Post.objects.get(id=id)
        if body is not None:
            post.content = body
        else:
            if request.user in post.likes.all():
                post.likes.remove(request.user)
            else:
                post.likes.add(request.user)
        post.save()

    return HttpResponse(status=204)


def all(request, post_page):

    user = request.GET.get("user") or None
    if post_page == 'all':
        posts = Post.objects.all()
    elif post_page == 'profile':
        if user is None:
            posts = Post.objects.filter(user=request.user)
        else:
            username = User.objects.get(username=user)
            posts = Post.objects.filter(user=username.id)
    elif post_page == 'following':
        current_user = request.user
        posts = Post.objects.filter(user__in=current_user.following.all())
        
    posts = posts.order_by("-timestamp").all()
    p = Paginator(posts, 5)

    counter = int(request.GET.get("page") or 1)

    if counter is not 0:
        page = p.page(counter)
        set_posts = page.object_list

        return JsonResponse([post.serialize() for post in set_posts], safe=False)

    else:
        context = p.num_pages
        return JsonResponse({"context": context})



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
