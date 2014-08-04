
localhost = '127.0.0.1:8000';
//localhost = 'spoilbait.csail.mit.edu';

var articles;
var index_articles = [];
var title_holder;

var csrftoken = $.cookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

function sizing() {
  var formfilterswidth = $("#formfilters").width();
  $("#rss-feed-url").width((formfilterswidth - 70) + "px");
}
$(document).ready(sizing);
$(window).resize(sizing);

$("#rss-error").hide();
$("#rss-success").hide();
$("#myModal").hide();
$("#rss-info").show();

$('.close').click(function(e) {
	$("#rss-error").hide();
});


$('#submit-rss-url').click(function(e) {
	url = $('#rss-feed-url').val();
	return submit_feed(url);
});

function submit_feed(url) {
	$('#submit-rss-url').toggleClass('active');
	$('#rss-feed-url').val(url);
	$("#rss-info").hide();
	$('#rss-feeds').empty();
	url_call = '/crowd_data';
	
	$.ajax({
	    type: "GET",
	    contentType: "json",
	    url: url_call,
	    data: {url: url},
	    success: function (data) {
	        populate_feed_view(url, data);
	    },
	    error: function(request, textStatus, errorThrown) {
	    	$("#rss-error").show();
	        console.log(textStatus);
	        $('#submit-rss-url').toggleClass('active');
	     },
	});
	return false;
}


function populate_modal(index, url, feed_url, date) {
	$('#modalBody').empty();
	
	var title = index_articles[index];
	$('#myModalLabel').text("Original title: " + title);
	
	var text = '';
	if (title in articles) {
		crowd_res = articles[title];
		if (crowd_res['crowd_titles'].length == 0) {
			$('#modalNone').show();
			$("#modalBody").hide();
			var text = '<span class="txtbright">Spoilbail Titles</span>';
			text += '<span class="crowdtitles" id="modalcrowd">';
			$("#modalBody").html(text);
		} else {
			$('#modalNone').hide();
			$("#modalBody").show();
			var text = '<span class="txtbright">Spoilbail Titles</span>';
			text += '<span class="crowdtitles" id="modalcrowd">';
			for (var i = 0; i < crowd_res['crowd_titles'].length; i++) {
				var ids = 'title' + i + '_' + index;
				text += '<BR/>' + crowd_res['crowd_titles'][i]['title'] + ' &nbsp;&nbsp;';
				
       			if (crowd_res['crowd_titles'][i]['upvoted'] == false) {
					text += '&nbsp;&nbsp;' +
					'<span id="arrows-upm' + ids + '">';
					text += '<a class="upvote" onClick="upvote(true, \'' + escape(crowd_res['crowd_titles'][i]['title']) + '\',\'' + url + '\',\'' + ids + '\',\'' + escape(title) + '\', ' + i + ');">' +
					'<img class="arrow" src="/static/crowdedits/img/arrow-up.png"></a></span> &nbsp;&nbsp;';
				} else {
					text += '&nbsp;&nbsp;' +
					'<span id="arrows-upm' + ids + '">' +
					'<img class="arrow" src="/static/crowdedits/img/arrow-up-orange.png"></span> &nbsp;&nbsp;';
				}
				if (crowd_res['crowd_titles'][i]['downvoted'] == false) {
					text += '&nbsp;&nbsp;' +
					'<span id="arrows-downm' + ids + '">';
					text += '<a class="upvote" onClick="upvote(false, \'' + escape(crowd_res['crowd_titles'][i]['title']) + '\',\'' + url + '\',\'' + ids + '\',\'' + escape(title) + '\', ' + i + ');">' +
					'<img class="arrow" src="/static/crowdedits/img/arrow-down.png"></a></span> &nbsp;&nbsp;';
				} else {
					text += '&nbsp;&nbsp;' +
					'<span id="arrows-downm' + ids + '">' +
					'<img class="arrow" src="/static/crowdedits/img/arrow-down-orange.png"></span> &nbsp;&nbsp;';
				}
				
        		text += '<span id="m' + ids + '">' + crowd_res['crowd_titles'][i]['votes'] + '</span>'; 	
			}
			text += '</span>';
		}
	}
		
	text += '<P/>';
	
	$('#modalBody').html(text);
	
	sub_title = '<form class="form-horizontal">';
	sub_title += '<div class="input-append"><input type="text" id="submit-title" class="input-block-level span3" placeholder="Submit A SpoilBait Title"><button class="btn btn-primary" type="submit" id="submit-title-but">Submit</button></div>';
	sub_title += '</form>';
	
	$('#modalSubmit').html(sub_title);
	
	
	$('#submit-title-but').click(function(e) {
		var crowd_title = $('#submit-title').val();
		var data = {};
		data['crowd_title'] = crowd_title;
		data['art_url'] = url;
		data['feed_url'] = feed_url;
		data['art_title'] = title;
		data['date'] = date;
		
		$.ajax({
	        url: "/write_title",
	        type: 'POST',
	        data: JSON.stringify(data),
	        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
	        dataType: 'json',
	        success: function() {
	        	$('#modalNone').hide();
	        	$("#modalBody").show();
	        	$('#submit-title').val('');
	        	crowd_res = articles[title];
	        	var id = crowd_res['crowd_titles'].length;
	        	crowd_res['crowd_titles'].push({'votes': 0, 'title': crowd_title, 'upvoted': false, 'downvoted': false});
	        	
	        	ids = 'title' + id + '_' + index;
	        	var text = '<BR /> ' + crowd_title + ' &nbsp;&nbsp;';
	        	text += '<span id="arrows-upm' + ids + '">';
	        	text += '<a class="upvote" onClick="upvote(true, \'' + escape(crowd_title) + '\',\'' + url + '\',\'' + ids + '\',\'' + escape(title) + '\', ' + id + ');">' +
	        	'<img class="arrow" src="/static/crowdedits/img/arrow-up.png"></a></span> &nbsp;&nbsp;';
	        	text += '<span id="arrows-downm' + ids + '">';
	        	text += '<a class="upvote" onClick="upvote(false, \'' + escape(crowd_title) + '\',\'' + url + '\',\'' + ids + '\',\'' + escape(title) + '\', ' + id + ');">' +
	        	'<img class="arrow" src="/static/crowdedits/img/arrow-down.png"></a></span> &nbsp;&nbsp;';
        		text += '<span id="m' + ids + '">0</span>'; 
        		$('#modalcrowd').append(text);
        		redraw(index, title, url);
	        },
	        statusCode: {
		    	404: function() {
		    		window.location.href = "/accounts/login";
		    	}
		    },
			error: function(jqXHR, textStatus, errorThrown) {
				window.location.href = "/accounts/login";
			  	console.log(textStatus, errorThrown);
			}
	     });
	     return false;
		
	});
	
}

function redraw(index, original_title, url) {
	crowd_res = articles[original_title];
	var text = '';
	for (var i = 0; i < crowd_res['crowd_titles'].length; i++) {
		var ids = 'title' + i + '_' + index;
		text += '<BR />' + crowd_res['crowd_titles'][i]['title'] + ' &nbsp;&nbsp;';
		
		if (crowd_res['crowd_titles'][i]['upvoted'] == false) {
			title += '&nbsp;&nbsp;' +
			'<span id="arrows-up' + ids + '">' +
			'<a class="upvote" onClick="upvote(true, \'' + escape(crowd_res['crowd_titles'][i]['title']) + '\',\'' + url + '\',\'' + ids + '\',\'' + escape(original_title) + '\', ' + i + ');">' +
			'<img class="arrow" src="/static/crowdedits/img/arrow-up.png"></a></span> &nbsp;&nbsp;';
		} else {
			title += '&nbsp;&nbsp;' +
			'<span id="arrows-up' + ids + '">' +
			'<img class="arrow" src="/static/crowdedits/img/arrow-up-orange.png"></span> &nbsp;&nbsp;';
		}
		if (crowd_res['crowd_titles'][i]['downvoted'] == false) {
			title += '&nbsp;&nbsp;' +
			'<span id="arrows-down' + ids + '">' +
			'<a class="upvote" onClick="upvote(false, \'' + escape(crowd_res['crowd_titles'][i]['title']) + '\',\'' + url + '\',\'' + ids + '\',\'' + escape(original_title) + '\', ' + i + ');">' +
			'<img class="arrow" src="/static/crowdedits/img/arrow-down.png"></a></span> &nbsp;&nbsp;';
		} else {
			title += '&nbsp;&nbsp;' +
			'<span id="arrows-down' + ids + '">' +
			'<img class="arrow" src="/static/crowdedits/img/arrow-down-orange.png"></span> &nbsp;&nbsp;';
		}
		
		text += '<span id="' + ids + '">' + crowd_res['crowd_titles'][i]['votes'] + '</span>'; 
	}
	$('#crowdtitles' + index).html(text);
	if (crowd_res['crowd_titles'].length == 1) {
		var addNewSpan = '<span class="txtbright">Baitless Titles:</span>';
   		$('#crowdtitles' + index).before(addNewSpan);
	}
	$('#otitle' + index).removeClass('rss-new-title');
	$('#otitle' + index).addClass('rss-new-title-strikeout');
}

function send_analytics(feed_url, title, date, page_url) {
	data = {};
	data['feed_url'] = feed_url;
	data['title'] = unescape(title);
	data['date'] = date;
	data['page_url'] = page_url;
	data['csrfmiddlewaretoken'] = csrftoken;
	data = JSON.stringify(data);
	
	$.ajax({
        url: "/page_analytics",
        type: 'POST',
        data: data,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function() {
        	console.log('success');
        },
		error: function(jqXHR, textStatus, errorThrown) {
		  	console.log(textStatus, errorThrown);
		}
     });
	return true;
}


function upvote(up, crowd_title, page_url, ids, art_title, i) {
	data = {};
	crowd_title = unescape(crowd_title);
	art_title = unescape(art_title);
	data['crowd_title'] = crowd_title;
	data['art_url'] = page_url;
	data['csrfmiddlewaretoken'] = csrftoken;
	data['up'] = up;
	data = JSON.stringify(data);
	
	$.ajax({
        url: "/upvote",
        type: 'POST',
        data: data,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function() {
        	crowd_res = articles[art_title];
        	
        	console.log(crowd_res['crowd_titles'][i]);
        	if (up == true) {
        		if (crowd_res['crowd_titles'][i]['downvoted'] == true) {
        			$('#arrows-down' + ids).html('<a class="upvote" onClick="upvote(false, \'' + escape(crowd_res['crowd_titles'][i]['title']) + '\',\'' + page_url + '\',\'' + ids + '\',\'' + art_title + '\', ' + i + ');">' +
	        						'<img class="arrow" src="/static/crowdedits/img/arrow-down.png"></a>');
        			$('#arrows-downm' + ids).html('<a class="upvote" onClick="upvote(true, \'' + escape(crowd_res['crowd_titles'][i]['title']) + '\',\'' + page_url + '\',\'' + ids + '\',\'' + art_title + '\', ' + i + ');">' +
	        						'<img class="arrow" src="/static/crowdedits/img/arrow-down.png"></a>');
        			crowd_res['crowd_titles'][i]['votes'] += 2;
        			var votes = parseInt($('#' + ids).text()) + 2;
        		} else {
        			crowd_res['crowd_titles'][i]['votes'] += 1;
        			var votes = parseInt($('#' + ids).text()) + 1;
        		}
        		crowd_res['crowd_titles'][i]['downvoted'] = false;
        		crowd_res['crowd_titles'][i]['upvoted'] = true;
        		$('#arrows-up' + ids).html('<img class="arrow" src="/static/crowdedits/img/arrow-up-orange.png">');
        		$('#arrows-upm' + ids).html('<img class="arrow" src="/static/crowdedits/img/arrow-up-orange.png">');
        	} else {
        		if (crowd_res['crowd_titles'][i]['upvoted'] == true) {
        			$('#arrows-up' + ids).html('<a class="upvote" onClick="upvote(true, \'' + escape(crowd_res['crowd_titles'][i]['title']) + '\',\'' + page_url + '\',\'' + ids + '\',\'' + art_title + '\', ' + i + ');">' +
	        						'<img class="arrow" src="/static/crowdedits/img/arrow-up.png"></a>');
        			$('#arrows-upm' + ids).html('<a class="upvote" onClick="upvote(true, \'' + escape(crowd_res['crowd_titles'][i]['title']) + '\',\'' + page_url + '\',\'' + ids + '\',\'' + art_title + '\', ' + i + ');">' +
	        						'<img class="arrow" src="/static/crowdedits/img/arrow-up.png"></a>');
        			crowd_res['crowd_titles'][i]['votes'] -= 2;
        			var votes = parseInt($('#' + ids).text()) - 2;
        		} else {
        			crowd_res['crowd_titles'][i]['votes'] -= 1;
        			var votes = parseInt($('#' + ids).text()) - 1;
        		}
        		crowd_res['crowd_titles'][i]['downvoted'] = true;
        		crowd_res['crowd_titles'][i]['upvoted'] = false;
        		$('#arrows-down' + ids).html('<img class="arrow" src="/static/crowdedits/img/arrow-down-orange.png">');
        		$('#arrows-downm' + ids).html('<img class="arrow" src="/static/crowdedits/img/arrow-down-orange.png">');
        	}

        	$('#' + ids).html(votes);
        	$('#m' + ids).html(votes);
        	
        	
        },
        statusCode: {
        	404: function() {
        		window.location.href = "/accounts/login";
        	}
        },
		error: function(jqXHR, textStatus, errorThrown) {
			window.location.href = "/accounts/login";
		  	console.log(jqXHR, textStatus, errorThrown);
		}
     });
	return false;
}


function populate_feed_view(url, data) {
	index_articles = [];
	articles = data['results'];
	jQuery(function($) {
        $("#rss-feeds").rss(url, {
        	limit: 10,
        	effect: 'show',
        	layoutTemplate: "<div class='rows'>{entries}</div>",
        	entryTemplate: '<div class="span9"><div class="image-left">' + 
        	'<div style="display: block; background-size: cover; width: 200px; height: 100px; background-image: url({teaserImageUrl});"></div></div>' +
        	'<div class="right-text">' + 
        	'{fixed-title} <BR />' +
        	'{date}<BR/>{shortBodyPlain} <BR />' + 
        	'<button class="btn btn2" data-toggle="modal" data-target="#myModal" onClick="populate_modal({index}, \'{url}\', \'' + url + '\', \'{date}\');">Contribute or Vote on Baitless Titles</button>' +
        	'</div></div>',
        	tokens: {
        		'fixed-title': function(entry, tokens) {
        			index_articles.push(entry.title);
        			title = '';
        			if (entry.title in articles) {
        				crowd_res = articles[entry.title];
        				if (crowd_res['crowd_titles'].length == 0) {
        					
        					title = '<a target="_blank" onClick="send_analytics(\'' + url + '\',\'' + escape(entry.title) + '\',\'' + tokens.date + '\',\'' + tokens.url + '\');" href="/page?url=' + tokens.url + '">';
        					title += '<span class="rss-new-title" id="otitle' + tokens.index + '">' + entry.title + '</span></a> ';
        					title += '<BR /> <span class="crowdtitles" id="crowdtitles' + tokens.index + '"><span class="txterror">No Baitless titles yet!</span></span>';
        				} else {
        					title = '<a target="_blank" onClick="send_analytics(\'' + url + '\',\'' + escape(entry.title) + '\',\'' + tokens.date + '\',\'' + tokens.url + '\');" href="/page?url=' + tokens.url + '">';
        					title += '<span class="rss-new-title-strikeout" id="otitle' + tokens.index + '">' + entry.title + '</a> ';
        					title += '<BR /><span class="txtbright">Baitless Titles:</span><span class="crowdtitles" id="crowdtitles' + tokens.index + '">';
        					for (var i = 0; i < crowd_res['crowd_titles'].length; i++) {
        						var ids = 'title' + i + '_' + tokens.index;
        						title += '<BR />' + crowd_res['crowd_titles'][i]['title'] + ' &nbsp;&nbsp;';
        						
        						if (crowd_res['crowd_titles'][i]['upvoted'] == false) {
	        						title += '&nbsp;&nbsp;' +
	        						'<span id="arrows-up' + ids + '">' +
	        						'<a class="upvote" onClick="upvote(true, \'' + escape(crowd_res['crowd_titles'][i]['title']) + '\',\'' + tokens.url + '\',\'' + ids + '\',\'' + escape(entry.title) + '\', ' + i + ');">' +
	        						'<img class="arrow" src="/static/crowdedits/img/arrow-up.png"></a></span> &nbsp;&nbsp;';
	        					} else {
	        						title += '&nbsp;&nbsp;' +
	        						'<span id="arrows-up' + ids + '">' +
	        						'<img class="arrow" src="/static/crowdedits/img/arrow-up-orange.png"></span> &nbsp;&nbsp;';
	        					}
	        					if (crowd_res['crowd_titles'][i]['downvoted'] == false) {
	        						title += '&nbsp;&nbsp;' +
	        						'<span id="arrows-down' + ids + '">' +
	        						'<a class="upvote" onClick="upvote(false, \'' + escape(crowd_res['crowd_titles'][i]['title']) + '\',\'' + tokens.url + '\',\'' + ids + '\',\'' + escape(entry.title) + '\', ' + i + ');">' +
	        						'<img class="arrow" src="/static/crowdedits/img/arrow-down.png"></a></span> &nbsp;&nbsp;';
	        					} else {
	        						title += '&nbsp;&nbsp;' +
	        						'<span id="arrows-down' + ids + '">' +
	        						'<img class="arrow" src="/static/crowdedits/img/arrow-down-orange.png"></span> &nbsp;&nbsp;';
	        					}
        						title += '<span id="' + ids + '">' + parseInt(crowd_res['crowd_titles'][i]['votes']) + '</span>'; 
        					}
        					title += '</span>';
        				}
        			} else {
        					title = '<a target="_blank" onClick="send_analytics(\'' + url + '\',\'' + escape(entry.title) + '\',\'' + tokens.date + '\',\'' + tokens.url + '\');" href="/page?url=' + tokens.url + '">';
        					title += '<span class="rss-new-title" id="otitle' + tokens.index + '">' + entry.title + '</span></a> ';
        					title += '<BR /> <span class="crowdtitles" id="crowdtitles' + tokens.index + '"><span class="txterror">No SpoilBait titles yet!</span></span>';
        					}
        			return title;
        		}
        	},
        	error: function() {
		      	$('#rss-error').show();
		      	$('#rss-feeds').empty();
		      	$('#rss-success').hide();
		      	$('#submit-rss-url').toggleClass('active');
        	},
        	success: function() {
        		$('#rss-error').hide();
        		$('#rss-success').html('Here is a link to your Baitless RSS Feed: <BR /><a target="_blank" href="/feeds?url=' + url + '">http://' + localhost + '/feeds?url=' + url + '</a>');
      			$("#rss-success").show();
      			$('#submit-rss-url').toggleClass('active');
        	},
        });
     });
	
}
