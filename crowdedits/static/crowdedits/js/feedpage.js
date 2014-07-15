
//localhost = '127.0.0.1:8000';
localhost = 'spoilbait.csail.mit.edu';

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
    	art = {title: title,
    		   upvotes: upvotes};
    	articles.push(art);
	});
	
};
	
$('#submit-title-but').click(function(e) {
	var crowd_title = $('#submit-title').val();
	var url = $('#urlinput').val();
	var data = {};
	data['crowd_title'] = crowd_title;
	data['art_url'] = url;

	
	$.ajax({
        url: "http://" + localhost + "/write_title",
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function() {
        	
        	$('#spoilheader').text('Top SpoilBait titles:');
        	new_arr = {title: crowd_title,
        			   upvotes: 1,
        	};
        	articles.push(new_arr);
        	generate_titles();
        },
		error: function(jqXHR, textStatus, errorThrown) {
		  	console.log(textStatus, errorThrown);
		}
     });
 });
 
function generate_titles() {
	
	$('#titles').html('');
	
	for (var i=0; i<articles.length;i++) {
		text = '';
		title = articles[i].title;
		upvotes = articles[i].upvotes;
		text += '<span id="title' + i + '"><span id="crowdtitle' + i + '">' + title + '</span>&nbsp;&nbsp;';
		text += '<a class="upvote" onClick="upvote(\'' + escape(title) + '\',\'' + i + '\');"><img width=10 height=10 src="http://i.imgur.com/YtoI3.jpg"></a> &nbsp;&nbsp;';
		text += '<span id="upvotes' + i + '">' + upvotes + '</span></span><BR/> ';
		$('#titles').append(text);
	}
	
}
 

function upvote(crowd_title, i) {
	data = {};
	var page_url = $('#urlinput').val();
	crowd_title = unescape(crowd_title);
	data['crowd_title'] = crowd_title;
	data['art_url'] = page_url;
	data['csrfmiddlewaretoken'] = csrftoken;
	data = JSON.stringify(data);
	
	$.ajax({
        url: "http://" + localhost + "/upvote",
        type: 'POST',
        data: data,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        success: function() {
        	var up = parseInt($('#upvotes' + i).text());
        	up = up +1;
        	$('#upvotes' + i).text(up);
        	articles[i].upvotes = up;
        	
        },
		error: function(jqXHR, textStatus, errorThrown) {
		  	console.log(textStatus, errorThrown);
		}
     });
	return false;
}