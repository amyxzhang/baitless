# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'RSSFeed'
        db.create_table(u'crowdedits_rssfeed', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('url', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal(u'crowdedits', ['RSSFeed'])

        # Adding model 'Article'
        db.create_table(u'crowdedits_article', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('rss_feed', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['crowdedits.RSSFeed'])),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('datetime_published', self.gf('django.db.models.fields.DateField')()),
            ('url', self.gf('django.db.models.fields.CharField')(max_length=200)),
        ))
        db.send_create_signal(u'crowdedits', ['Article'])

        # Adding model 'CrowdTitle'
        db.create_table(u'crowdedits_crowdtitle', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('article', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['crowdedits.Article'])),
            ('crowdtitle', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('votes', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal(u'crowdedits', ['CrowdTitle'])

        # Adding model 'RSSAnalytics'
        db.create_table(u'crowdedits_rssanalytics', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('rss_feed', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['crowdedits.RSSFeed'])),
            ('ip_address', self.gf('django.db.models.fields.CharField')(max_length=20)),
            ('user_agent', self.gf('django.db.models.fields.CharField')(max_length=120)),
            ('views', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal(u'crowdedits', ['RSSAnalytics'])

        # Adding model 'ArticleAnalytics'
        db.create_table(u'crowdedits_articleanalytics', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('article', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['crowdedits.Article'])),
            ('ip_address', self.gf('django.db.models.fields.CharField')(max_length=20)),
            ('user_agent', self.gf('django.db.models.fields.CharField')(max_length=120)),
            ('views', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal(u'crowdedits', ['ArticleAnalytics'])


    def backwards(self, orm):
        # Deleting model 'RSSFeed'
        db.delete_table(u'crowdedits_rssfeed')

        # Deleting model 'Article'
        db.delete_table(u'crowdedits_article')

        # Deleting model 'CrowdTitle'
        db.delete_table(u'crowdedits_crowdtitle')

        # Deleting model 'RSSAnalytics'
        db.delete_table(u'crowdedits_rssanalytics')

        # Deleting model 'ArticleAnalytics'
        db.delete_table(u'crowdedits_articleanalytics')


    models = {
        u'crowdedits.article': {
            'Meta': {'object_name': 'Article'},
            'datetime_published': ('django.db.models.fields.DateField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'rss_feed': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['crowdedits.RSSFeed']"}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        u'crowdedits.articleanalytics': {
            'Meta': {'object_name': 'ArticleAnalytics'},
            'article': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['crowdedits.Article']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ip_address': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'user_agent': ('django.db.models.fields.CharField', [], {'max_length': '120'}),
            'views': ('django.db.models.fields.IntegerField', [], {})
        },
        u'crowdedits.crowdtitle': {
            'Meta': {'object_name': 'CrowdTitle'},
            'article': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['crowdedits.Article']"}),
            'crowdtitle': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'votes': ('django.db.models.fields.IntegerField', [], {})
        },
        u'crowdedits.rssanalytics': {
            'Meta': {'object_name': 'RSSAnalytics'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ip_address': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'rss_feed': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['crowdedits.RSSFeed']"}),
            'user_agent': ('django.db.models.fields.CharField', [], {'max_length': '120'}),
            'views': ('django.db.models.fields.IntegerField', [], {})
        },
        u'crowdedits.rssfeed': {
            'Meta': {'object_name': 'RSSFeed'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        }
    }

    complete_apps = ['crowdedits']