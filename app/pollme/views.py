from django.shortcuts import render


def home(request):
    return render(request, "home.html")


def test_push(request):
    return render(request, "test-push.html")
