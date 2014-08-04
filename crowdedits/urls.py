from django.conf.urls import patterns, url
import views

urlpatterns = patterns('',
   url(r'^$', views.index, name='index'),
   url(r'^about', 'crowdedits.views.about'),
   url(r'^page$', 'crowdedits.views.feed_page'),
   url(r'^feeds$', 'crowdedits.views.feed'),
   url(r'^crowd_data$', 'crowdedits.views.get_crowd_data'),
   url(r'^write_title$', 'crowdedits.views.write_title'),
   url(r'^page_analytics$', 'crowdedits.views.page_analytics'),
   url(r'^upvote', 'crowdedits.views.upvote'),
   url(r'^users/(?P<username>.+)$', 'crowdedits.views.profile'),
   url(r'^accounts/profile', 'crowdedits.views.profile_user'),
)