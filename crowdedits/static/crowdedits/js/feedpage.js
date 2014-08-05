
//localhost = '127.0.0.1:8000';
//localhost = 'spoilbait.csail.mit.edu';

var articles = [];
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

window.onload = function () {
	
	
	
	$('#titles').children('span').each(function () {
    	var id = $(this).attr('id');
    	var id_num = parseInt(id.replace('title',''));
    	var title = $.trim($('#crowdtitle' + id_num).text());
    	var upvotes = parseInt($('#upvotes' + id_num).text());
    	$('#arrows-upm' + id_num).removeClass('hidden');
    	$('#arrows-downm' + id_num).removeClass('hidden');
    	$('#upvotes' + id_num).removeClass('hidden');
    	
    	var upvoted = $('#arrows-upm' + id_num).children('img').length == 1;
    	var downvoted = $('#arrows-downm' + id_num).children('img').length == 1;
    	art = {title: title,
    		   upvotes: upvotes,
    		   upvoted: upvoted,
    		   downvoted: downvoted};
    	articles.push(art);
	});
	
};
	
$('#submit-title').keypress(function(e){
	if (e.which == 13) {
		var crowd_title = $("#submit-title").val();
		var url = $('#urlinput').val();
		submit_writetitle(crowd_title, url);
		return false;
	}
});
	
$('#submit-title-but').click(function(e) {
	var crowd_title = $('#submit-title').val();
	var url = $('#urlinput').val();
	submit_writetitle(crowd_title, url);
	return false;
	
 });
 
function submit_writetitle(crowd_title, url) {
	var data = {};
	data['crowd_title'] = crowd_title;
	data['art_url'] = url;

	
	$.ajax({
        url: "/write_title",
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function() {
        	
        	$('#spoilheader').text('Top Baitless titles:');
        	new_arr = {title: crowd_title,
        			   upvotes: 0,
        			   upvoted: false,
        			   downvoted: false,
        	};
        	articles.push(new_arr);
        	generate_titles();
        },
        statusCode: {
        	404: function() {
        		window.location.href = "/accounts/login";
        	},
        	302: function() {
        		window.location.href = "/accounts/login";
        	}
        },
		error: function(jqXHR, textStatus, errorThrown) {
			window.location.href = "/accounts/login";
		  	console.log(textStatus, errorThrown);
		}
     });
}
 
 
function generate_titles() {
	
	$('#titles').html('');
	
	for (var i=0; i<articles.length;i++) {
		text = '';
		title = articles[i].title;
		upvotes = articles[i].upvotes;
		text += '<span id="title' + i + '"><span id="crowdtitle' + i + '">' + title + '</span> &nbsp;&nbsp;';
		text += '<span id="arrows-upm' + i + '">';
		if (title.upvoted) {
			text += '<img class="arrow" src="/static/crowdedits/img/arrow-up-orange.png"></span> &nbsp;&nbsp;';
		} else {
			text += '<a class="upvote" onClick="upvote(true, \'' + escape(title) + '\',\'' + i + '\');">' +
			'<img class="arrow" src="/static/crowdedits/img/arrow-up.png"></a></span> &nbsp;&nbsp;';
		}
		text += '<span id="arrows-downm' + i + '">';
		if (title.downvoted) {
			text += '<img class="arrow" src="/static/crowdedits/img/arrow-down-orange.png"></span> &nbsp;&nbsp;';
		} else {
			text += '<a class="upvote" onClick="upvote(false, \'' + escape(title) + '\',\'' + i + '\');">' +
			'<img class="arrow" src="/static/crowdedits/img/arrow-down.png"></a></span> &nbsp;&nbsp;';
		}
		text += '<span id="upvotes' + i + '">' + upvotes + '</span></span><BR/> ';
		$('#titles').append(text);
	}
	
}
 

function upvote(up, crowd_title, i) {
	data = {};
	var page_url = $('#urlinput').val();
	crowd_title = unescape(crowd_title);
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
        	var upscore = parseInt($('#upvotes' + i).text());
        	var id = parseInt(i);
        	if (up == true) {
        		if (articles[id]['downvoted'] == true) {
	        		$('#arrows-downm' + id).html('<a class="upvote" onClick="upvote(false, \'' + escape(crowd_title) + '\',\'' + i + '\');">' +
	        						'<img class="arrow" src="/static/crowdedits/img/arrow-down.png"></a>');
	        		upscore += 2;
	        	} else {
        			upscore += 1;
        		}
        		articles[id]['downvoted'] = false;
        		articles[id]['upvoted'] = true;
        		$('#arrows-upm' + i).html('<img class="arrow" src="/static/crowdedits/img/arrow-up-orange.png">');
        	} else {
        		if (articles[id]['upvoted'] == true) {
        			$('#arrows-upm' + i).html('<a class="upvote" onClick="upvote(true, \'' + escape(crowd_title) + '\',\'' + i + '\');">' +
	        						'<img class="arrow" src="/static/crowdedits/img/arrow-up.png"></a>');
	        		upscore -= 2;
        		} else {
        			upscore -= 1;
        		}
        		articles[id]['downvoted'] = true;
        		articles[id]['upvoted'] = false;
        		$('#arrows-downm' + i).html('<img class="arrow" src="/static/crowdedits/img/arrow-down-orange.png">');
        	
        	}
        	$('#upvotes' + i).text(upscore);
        	articles[id].upvotes = upscore;

        },
        statusCode: {
        	404: function() {
        		window.location.href = "/accounts/login";
        	},
        	302: function() {
        		window.location.href = "/accounts/login";
        	}
        },
		error: function(jqXHR, textStatus, errorThrown) {
			window.location.href = "/accounts/login";
		  	console.log(textStatus, errorThrown);
		}
     });
	return false;
}