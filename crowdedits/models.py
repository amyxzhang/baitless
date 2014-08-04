from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class RSSFeed(models.Model):
    url = models.CharField(max_length=200)
    

class Article(models.Model):
    rss_feed = models.ForeignKey(RSSFeed)
    title = models.CharField(max_length=200)
    datetime_published = models.DateField()
    url = models.CharField(max_length=200)
    
class CrowdTitle(models.Model):
    user = models.ForeignKey(User)
    datetime_published = models.DateTimeField()
    article = models.ForeignKey(Article)
    crowdtitle = models.CharField(max_length=200)
    votes = models.IntegerField()
    
class Vote(models.Model):
    user = models.ForeignKey(User)
    up = models.BooleanField()
    crowdtitle = models.ForeignKey(CrowdTitle)
    datetime_published = models.DateTimeField()
    
class RSSAnalytics(models.Model):
    rss_feed = models.ForeignKey(RSSFeed)
    ip_address = models.CharField(max_length=20)
    user_agent = models.CharField(max_length=120)
    views = models.IntegerField()
    
class ArticleAnalytics(models.Model):
    article = models.ForeignKey(Article)
    ip_address = models.CharField(max_length=20)
    user_agent = models.CharField(max_length=120)
    views = models.IntegerField()