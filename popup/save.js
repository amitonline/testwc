$(document).ready(function () {
	
	$('.modebtn').click(function() {
		$('.modebtn').removeClass("btn-toggle-sel-color");
		$('.modebtn').addClass("btn-toggle-color");

		$(this).removeClass("btn-toggle-color");
		$(this).addClass("btn-toggle-sel-color");

		if ($(this).attr("id") == "btnModePublish")
			document.frm.mode.value = "publish";
		if ($(this).attr("id") == "btnModePrivate")
			document.frm.mode.value = "private";
		if ($(this).attr("id") == "btnModeTeam") {
			document.frm.mode.value = "team";
			$('#divTeams').show();
		} else
			$('#divTeams').hide();
	});

	$('#clip1').click(function() {	
		$('#clip1').html("<span class=\"greencolor glyphicon  glyphicon-ok-circle\" aria-hidden=\"true\"></span>&nbsp;Full Page");
		$('#clip2').html("<span class=\"greencolor glyphicon  \" aria-hidden=\"true\"></span>&nbsp;Selection");
		$('#clip3').html("<span class=\"greencolor glyphicon  \" aria-hidden=\"true\"></span>&nbsp;Bookmark");

	});

	$('#clip2').click(function() {	
		$('#clip1').html("<span class=\"greencolor glyphicon  \" aria-hidden=\"true\"></span>&nbsp;Full Page");
		$('#clip2').html("<span class=\"greencolor glyphicon  glyphicon-ok-circle\" aria-hidden=\"true\"></span>&nbsp;Selection");
		$('#clip3').html("<span class=\"greencolor glyphicon  \" aria-hidden=\"true\"></span>&nbsp;Bookmark");

	});

	$('#clip3').click(function() {	
		$('#clip1').html("<span class=\"greencolor glyphicon  \" aria-hidden=\"true\"></span>&nbsp;Full Page");
		$('#clip2').html("<span class=\"greencolor glyphicon  \" aria-hidden=\"true\"></span>&nbsp;Selection");
		$('#clip3').html("<span class=\"greencolor glyphicon glyphicon-ok-circle\"  aria-hidden=\"true\"></span>&nbsp;Bookmark");
	});


})
