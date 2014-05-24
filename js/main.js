/* Javasrcipt */ 

$(window).load(function(e) {
	

	$("a#logbtn").click(function(e) {
		e.preventDefault();
		$("#logincover").fadeIn(600);
	});

	$("img#close").click(function(e) {
		$("#logincover").fadeOut(600);
	});

	$("#logincover").click(function(e) {
		$("#logincover").fadeOut(600);
	});

	$("#loginbox,#ratingbox").click(function(e) {
		e.stopPropagation();
	})
	
	$("ul#top_cat_list li").hover(function(e) {
		$(this).siblings().find(".sub_cat").fadeOut(300);
		$(this).children().fadeIn(300);
	},function(){
		//$(".sub_cat").hide();
	});
	$("#top_cat").hover(function(){
	},function(){
		$(".sub_cat").hide();
	})

});