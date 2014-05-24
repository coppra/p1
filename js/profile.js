/* profile.html */

var i, id, selected;

$(window).load(function(e) {

	$(".rates .circle").hover(function(e) {
		id = $(this).attr("id");
		selected = id.split("rate");
		for(i=1; i<=selected[1]; i++) {
			$(".rates .circle#rate" + i).removeClass("circleout").addClass("circlehover");
		}
	}, function(e) {
		for(i=5; i>$(".yourrating .ratenum").text(); i--) {
			$(".rates .circle#rate" + i).removeClass("circlehover").addClass("circleout");
		}
	});

	$(".rates .circle").click(function(e) {
		id = $(this).attr("id");
		$("#ratingcover").fadeIn(600);
		selected = id.split("rate");
		for(i=1; i<=selected[1]; i++) {
			$(".rates .circle#rate" + i).removeClass("circleout").addClass("circlehover");
		}
		$(".yourrating .ratenum").html(selected).css("color", $(this).css("background-color"));
	});

	$(".btn#enquiry_button,.btn#quick_enquiry_button").click(function(){
		$("#messagecover").fadeIn(600);
	});

	$("img#close,.btn#cancel,.btn#send").click(function(e) {
		$("#messagecover").fadeOut(600);
	});

	$("#messagecover").click(function(e) {
		$("#messagecover").fadeOut(600);
	});

	$("img#close,.btn#cancel,.btn#login").click(function(e) {
		$("#ratingcover").fadeOut(600);
	});

	$("#ratingcover").click(function(e) {
		$("#ratingcover").fadeOut(600);
	});

});