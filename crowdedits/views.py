from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.models import Count
from django.utils.safestring import mark_safe
import urllib2
import feedparser
import datetime
from dateutil.parser import parse
import PyRSS2Gen
import StringIO
import requests
import json
from log import logger
from crowdedits.models import RSSAnalytics, RSSFeed, Article, CrowdTitle, ArticleAnalytics, Vote
import urllib
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import redirect_to_login


def profile_user(request):
    return profile(request, username=request.user.username)

def profile(request, username=None):
    if request.user.is_authenticated():
        titles = CrowdTitle.objects.filter(user=request.user).order_by('-datetime_published')
        upvotes = Vote.objects.filter(user=request.user).order_by('-datetime_published')
        
        dic = {'titles': titles,
               'upvotes': upvotes,
               'user': request.user}
        
        return render(request, 'crowdedits/profile.html', dic)
    else:
        return redirect_to_login(None)

def get_redirects(url):
    #redirects are super slow...hack to fix for feedproxy (specifically upworthy, find others as we go
    if 'http://feedproxy.google.com' in url:
        vals = url.split('/')
        domain = vals[4]
        field = vals[7]
        url = 'http://www.%s.com/%s' % (domain, field)
#     else:
#         r = requests.head(url, allow_redirects = True)
#         url = r.url
    return url

@ensure_csrf_cookie
def index(request):
    top_feeds = RSSFeed.objects.annotate(num_titles=Count('article__crowdtitle')).order_by('-num_titles')[:5]
    dic = {'top_feeds': top_feeds,
           'user': request.user}
    
    return render(request, 'crowdedits/index.html', dic)

@ensure_csrf_cookie
def about(request):
    return render(request, 'crowdedits/about.html')

@ensure_csrf_cookie
def feed_page(request):
    params = request.GET
    url = get_redirects(params['url'])
    dic = {'url': mark_safe(url)}
    
    sm_url = url.split('?')[0]
    
    arts = Article.objects.filter(url=sm_url)
    dic['header'] = 'No Baitless titles yet!'
    if arts.count() > 0:
        art = arts[0]
        crowdtitles = CrowdTitle.objects.filter(article=art).select_related().order_by('-votes')
        if crowdtitles.count() > 0:
            for title in crowdtitles:
                title.escaped_crowdtitle = urllib.quote(title.crowdtitle)
                if request.user.is_authenticated():
                    votes = Vote.objects.filter(crowdtitle=title, user=request.user)
                    if votes:
                        if votes[0].up:
                            title.upvoted = True
                            title.downvoted = False
                        else:
                            title.downvoted = True
                            title.upvoted = False
                    else:
                        title.upvoted = False
                        title.downvoted = False
                else:
                     title.upvoted = False
                     title.downvoted = False
            dic['crowdtitles'] = crowdtitles
            dic['header'] = 'Top Baitless titles:'
    else:
        dic['crowdtitles'] = []
            
    return render(request, 'crowdedits/feed_page.html', dic)
    
@login_required
def upvote(request):
    params = json.loads(request.body)
    up = params['up']
    art_url = get_redirects(params['art_url'])
    sm_url = art_url.split('?')[0]
    crowd_title = params['crowd_title'].strip()
    a = Article.objects.get(url=sm_url)
    title = CrowdTitle.objects.get(article=a, crowdtitle=crowd_title)
    
        
    votes = Vote.objects.filter(crowdtitle=title, user=request.user)
    if not votes:
        v,_ = Vote.objects.get_or_create(crowdtitle=title, up=up, user=request.user, datetime_published=datetime.datetime.now())

        if up:
            title.votes += 1
        else:
            title.votes -= 1   
        title.save()
    else:
        vote = votes[0]
        if vote.up != up:
            vote.up = up
            vote.datetime_published=datetime.datetime.now()
            vote.save()
            if up:
                title.votes += 2
            else:
                title.votes -= 2
            title.save()

    return HttpResponse(json.dumps({'success': 1}))

@login_required
def write_title(request):
    try:
        params = json.loads(request.body)
        art_url = get_redirects(params['art_url'])
        crowd_title = params['crowd_title']
        if params.get('feed_url'):
            feed_url = get_redirects(params.get('feed_url'))
        else:
            feed_url = None
        
        
        sm_art_url = art_url.split('?')[0]
        
        if feed_url:
            art_title = params['art_title']
            date = parse(params['date'])
            
            
            sm_feed_url = feed_url.split('?')[0]
            
            art = Article.objects.filter(url=sm_art_url)
            if art.count() == 0:
                rss_feed, _ = RSSFeed.objects.get_or_create(url=sm_feed_url)
                article = Article.objects.create(url=sm_art_url, rss_feed=rss_feed, title=art_title, datetime_published=date)
            else:
                article = art[0]
            crowd_title, _ = CrowdTitle.objects.get_or_create(article=article, 
                                                              crowdtitle=crowd_title, 
                                                              votes=0, 
                                                              user=request.user, 
                                                              datetime_published=datetime.datetime.now())
        else:
            logger.info(sm_art_url)
            art = Article.objects.filter(url=sm_art_url)[0]
            crowd_title, _ = CrowdTitle.objects.get_or_create(article=art, 
                                                              crowdtitle=crowd_title, 
                                                              votes=0, 
                                                              user=request.user,
                                                              datetime_published=datetime.datetime.now())
    except Exception, e:
        logger.exception(e)

    return HttpResponse(json.dumps({'success': 1}))

def page_analytics(request):
    params = json.loads(request.body)
    feed_url = get_redirects(params['feed_url'])
    page_url = get_redirects(params['page_url'])
    title = params['title']
    date = parse(params['date'])
    
    sm_feed_url = feed_url.split('?')[0]
    sm_page_url = page_url.split('?')[0]
    
    ip = request.META['REMOTE_ADDR']
    user_agent = request.META['HTTP_USER_AGENT']
    
    user_agent = user_agent[0:50]
    
    analytics = ArticleAnalytics.objects.filter(article__url=sm_page_url, ip_address=ip)
    if analytics.count() == 0:
        feed,_ = RSSFeed.objects.get_or_create(url=sm_feed_url)
        articles = Article.objects.filter(url=sm_page_url, rss_feed=feed)
        if articles.count() == 0:
            article = Article.objects.create(url=sm_page_url, rss_feed=feed, title=title, datetime_published=date)
        else:
            article = articles[0]
        anas = ArticleAnalytics.objects.filter(article=article, ip_address=ip)
        if anas.count() == 0:
            ana = ArticleAnalytics.objects.create(article=article, ip_address=ip, user_agent=user_agent, views=1)
        else:
            ana = anas[0]
            ana.views += 1
            ana.save()
    else:
        ana = analytics[0]
        ana.views += 1
        ana.save()
    return HttpResponse(json.dumps({'success': 1}))
    

def get_crowd_data(request):
    params = request.GET
    url = get_redirects(params['url'])
    
    feed = feedparser.parse(url)
    
    sm_url = url.split('?')[0]
    rss_feed = RSSFeed.objects.filter(url=sm_url)
    
    
    rss_items = {}
    for item in feed['items']:
        
        rss_items[item['title']] = {}
        
        art_url = get_redirects(item['link'])
        sm_art_url = art_url.split('?')[0]
        
        articles = Article.objects.filter(rss_feed=rss_feed, url=sm_art_url)
        
        rss_items[item['title']]['crowd_titles'] = []
        if articles.count() != 0:
            article = articles[0]
            crowd_titles = CrowdTitle.objects.filter(article=article).order_by('-votes')
            for title in crowd_titles:
                if request.user.is_authenticated():
                    votes = Vote.objects.filter(crowdtitle=title, user=request.user)
                    if votes:
                        if votes[0].up:
                            upvoted = True
                            downvoted = False
                        else:
                            downvoted = True
                            upvoted = False
                    else:
                        upvoted = False
                        downvoted = False
                else:
                    upvoted = False
                    downvoted = False

                rss_items[item['title']]['crowd_titles'].append({'title': title.crowdtitle,
                                                                 'votes': title.votes,
                                                                 'upvoted': upvoted,
                                                                 'downvoted': downvoted})

                
    data = {'results': rss_items}
    return HttpResponse(json.dumps(data), content_type='json')
    

def feed(request):
    params = request.GET
    
    url = get_redirects(params.get('url'))
    if not url:
        return HttpResponse('Sorry no feed url parameter was provided.')
        
    feed = feedparser.parse(url)
    
    if feed['bozo']:
        return HttpResponse('Sorry the feed url given is not a proper URL or is not properly-formatted XML.')
    
    
    ip = request.META['REMOTE_ADDR']
    user_agent = request.META['HTTP_USER_AGENT']
    
    user_agent = user_agent[0:50]
    
    sm_url = url.split('?')[0]
    rss_feed,_ = RSSFeed.objects.get_or_create(url=sm_url)
    
    analytics = RSSAnalytics.objects.filter(rss_feed__url=sm_url, ip_address=ip, user_agent=user_agent)
    if analytics.count() == 0:
        ana,_ = RSSAnalytics.objects.get_or_create(rss_feed=rss_feed, ip_address=ip, user_agent=user_agent, views=1)
    else:
        ana = analytics[0]
        ana.views += 1
        ana.save()
    


    rss_items = []
    for item in feed['items']:
        title = item['title']
        
        art_url = get_redirects(item['link'])
        sm_art_url = art_url.split('?')[0]
        
        
        a = Article.objects.filter(rss_feed=rss_feed, url=sm_art_url)
        if a.count() > 0:
            crowd_titles = CrowdTitle.objects.filter(article=a[0]).order_by('-votes')
            if crowd_titles.count() != 0:
                item['title'] = '%s (Baitless Title)' % crowd_titles[0].crowdtitle
        item2 = PyRSS2Gen.RSSItem(
            title = item['title'],
            link = 'http://baitless.csail.mit.edu/page?url=' + item['link'],
            description = item['summary'],
        )
        rss_items.append(item2)
    
    rss = PyRSS2Gen.RSS2(
        title = feed['channel']['title'],
        link = feed['url'],
        description = feed['channel']['description'],
        items = rss_items
    )
    
    out = StringIO.StringIO()
    rss.write_xml(out)
    return HttpResponse(out.getvalue(), content_type='application/xml')
