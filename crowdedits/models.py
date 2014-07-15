from django.db import models

# Create your models here.

class RSSFeed(models.Model):
    url = models.CharField(max_length=200)
    

class Article(models.Model):
    rss_feed = models.ForeignKey(RSSFeed)
    title = models.CharField(max_length=200)
    datetime_published = models.DateField()
    url = models.CharField(max_length=200)
    
class CrowdTitle(models.Model):
    article = models.ForeignKey(Article)
    crowdtitle = models.CharField(max_length=200)
    votes = models.IntegerField()
    
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