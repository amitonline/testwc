
var mUserData = null;
var mClipMode = "FULLPAGE";  // FULLPAGE/CLIPBOARD/BOOKMARK
var mClipData = "";

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
     if (request.command == "selection") {
	console.log("message reached");
	sendResponse({result: "OK"});

     }
  }
)

$(document).ready(function() {


   	chrome.runtime.sendMessage({command: "load_user_data"}, function(response) {
	   	if (response.result == "ERROR") {
		    $('#divLogin').show();
		    $('#divSave').hide();

		}
		else if (response.result == "OK") {
		    mUserData = JSON.parse(response.data);
		    updateUIAfterLogin();
		    $('#divLogin').hide();
		    $('#divSave').show();
		}
	})
	
	chrome.runtime.sendMessage({command: "load_tags"}, function(response) {
	   	if (response.result == "ERROR") {
		}
		else if (response.result == "OK") {
		    tagData = JSON.parse(response.data);
		    fillTagDropdown(tagData);

		}
	})

	chrome.runtime.sendMessage({command: "load_teams"}, function(response) {
	   	if (response.result == "ERROR") {
		}
		else if (response.result == "OK") {
		    teamData = JSON.parse(response.data);
		    fillTeamsUI(teamData);

		}
	})


	// login form functions//////////////////////////////
	$('#frm').submit(function() {
	   var frm = document.frm;
	   var company = frm.companyname.value;
	   var username = frm.username.value;
	   var pwd = frm.pwd.value;

	   if (username == null || username.trim() == "") {
		alert("Username is required");
		return false;
	   }
   	   if (pwd == null || pwd.trim() == "") {
		alert("Password is required");
		return false;
	   }

	   $('#imgLoader').show();
	   $('#btnSignIn').hide();

	   chrome.runtime.sendMessage({command: "login", username: username, pwd: pwd}, function(response) {
	   	if (response.result == "ERROR") {
			alert(response.message);
			$('#imgLoader').hide();
			$('#btnSignIn').show();

		} else if (response.result == "OK") {
			$('#imgLoader').hide();
			$('#btnSignIn').show();
			var data = response.data;
   			/*alert(data.id + "," + data.username +"," +  data.first_name +"," + data.last_name+ "," +
				    data.company_name + "," +  data.default_email_setting +"," +  data.has_teams 
				   +","  + data.chrome_ext_auth);*/
			$('#imgLoader').show();
		     	$('#btnSignIn').hide();
			
			$('#menu1').html(data.username + " <span class=\"caret\"></span>");
			chrome.runtime.sendMessage({command: "save_user_data", data: data}); 
			chrome.runtime.sendMessage({command: "tags"}, function(response) {
				if (response.result == "ERROR") {
					alert(response.message);
					$('#imgLoader').hide();
					$('#btnSignIn').show();

				} else if (response.result == "OK") {
					$('#imgLoader').hide();
					$('#btnSignIn').show();
					chrome.runtime.sendMessage({command: "save_tags", data: response.data}); 


					$('#divLogin').hide();
					$('#divSave').show();
					fillTagDropdown(response.data);
				  	chrome.runtime.sendMessage({command: "set_login_flag", flag: true}, 
						function(response) { 
						}
					)

				}
			})

			if (data.has_teams == true) {
				chrome.runtime.sendMessage({command: "configuration"}, function(response) {
				  if (response.result == "ERROR") {
					alert(response.message);
					$('#imgLoader').hide();
					$('#btnSignIn').show();

				  } else if (response.result == "OK") {
					$('#imgLoader').hide();
					$('#btnSignIn').show();
					chrome.runtime.sendMessage({command: "save_teams", data: response.data}); 
					fillTeamsUI(response.data);
				  }
				})
			} else {
					chrome.runtime.sendMessage({command: "save_teams", data: []}); 
					fillTeamsUI(response.data);

		 	}
		
		}
	   }); // chrome.runtime

	  return false;
	}); // 	$('#frm').submit(function() {

	$('#lnkLogout').click(function() {
            $('#divLogOutMsg').show();
	    chrome.runtime.sendMessage({command: "logout"}, function(response) {
			if (response.result == "ERROR") {
				alert(response.message);
				$('#divLogOutMsg').hide();
			} else if (response.result == "OK") {
				mUserData = null
				$('#divLogOutMsg').hide();
	    			$('#divLogin').show();
			        $('#divSave').hide();

			}
	    })

	});

	$('#lnkCloseClip').click(function() {
		$('#divClip').hide();
	 	$('#divClip').html("<br><center>Fetching page content. Please wait.....</center>");
		$('#divCloseClip').hide();
		mClipData = "";
	});


	// save form functions //////////////////////


	$('#tags').tokenize2(
	  {
		tokensAllowCustom: true
	  }
	);

	$('.modebtn').click(function() {
		$('.modebtn').removeClass("btn-toggle-sel-color");
		$('.modebtn').addClass("btn-toggle-color");

		$(this).removeClass("btn-toggle-color");
		$(this).addClass("btn-toggle-sel-color");

		if ($(this).attr("id") == "btnModePublish")
			$('#mode').val("publish");
		if ($(this).attr("id") == "btnModePrivate")
			$('#mode').val("private");
		if ($(this).attr("id") == "btnModeTeam") {
			$('#mode').val("team");
			$('#divTeams').show();
		} else
			$('#divTeams').hide();
	});

	$('#clip1').click(function() {	
		$('#clip1').html("<span class=\"iconcolor glyphicon  glyphicon-ok-circle\" aria-hidden=\"true\"></span>&nbsp;Full Page");
		$('#clip2').html("<span class=\"iconcolor glyphicon  \" aria-hidden=\"true\"></span>&nbsp;Selection");
		$('#clip3').html("<span class=\"iconcolor glyphicon  \" aria-hidden=\"true\"></span>&nbsp;Bookmark");
		mClipMode = "FULLPAGE";
		chrome.runtime.sendMessage({command: "set_clip_mode", data: mClipMode}, function(response) {
			if (response.result == "ERROR") {
			} else if (response.result == "OK") {
				getPageContent();
			}
		})

	});

	$('#clip2').click(function() {	
		$('#clip1').html("<span class=\"iconcolor glyphicon  \" aria-hidden=\"true\"></span>&nbsp;Full Page");
		$('#clip2').html("<span class=\"iconcolor glyphicon  glyphicon-ok-circle\" aria-hidden=\"true\"></span>&nbsp;Selection");
		$('#clip3').html("<span class=\"iconcolor glyphicon  \" aria-hidden=\"true\"></span>&nbsp;Bookmark");
		mClipMode = "CLIPBOARD";
		chrome.runtime.sendMessage({command: "set_clip_mode", data: mClipMode}, function(response) {
			if (response.result == "ERROR") {
			} else if (response.result == "OK") {
				getPageContent();
			}
		})


	});

	$('#clip3').click(function() {	
		$('#clip1').html("<span class=\"iconcolor glyphicon  \" aria-hidden=\"true\"></span>&nbsp;Full Page");
		$('#clip2').html("<span class=\"iconcolor glyphicon  \" aria-hidden=\"true\"></span>&nbsp;Selection");
		$('#clip3').html("<span class=\"iconcolor glyphicon glyphicon-ok-circle\"  aria-hidden=\"true\"></span>&nbsp;Bookmark");
	
		mClipMode = "BOOKMARK";
		chrome.runtime.sendMessage({command: "set_clip_mode", data: mClipMode}, function(response) {
			if (response.result == "ERROR") {
			} else if (response.result == "OK") {
				getPageContent();
			}
		})


	});


	$('#btnSave').click(function() {
		if (mClipData == null || mClipData == '') {
		    alert("No content has been clipped");
		    return; 
		}
		$('#divSavingMsg').show();
		$('#btnSave').prop("disabled", true);
		$('#lnkCloseClip').prop("disabled", true);

		var title = $('#pageTitle').text();

		var tags = [];
		var tagString = "";
		var tagData = new String($('#tags').val());
		if (tagData != null && tagData != "") {
		   var arrTags = tagData.split(",");
		   for(var i = 0; i < arrTags.length; i++) {
			if (arrTags[i] != "") {
			   tags.push(arrTags[i]);
			
			   if (tagString != "")
				tagString +=",";
			   tagString += arrTags[i];
		        }
		   }
                }
		var arrTeamIds = [];
		if ($('#mode').val() == "team") {
		  $('.classteams').each(function () {
		      if ($(this).prop("checked") == true)
		        arrTeamIds.push(parseInt($(this).attr("value")));
		   }); 
		}
		var investment_events = [];
		var note_type_id = 8;
		var inherent_percent_change = "nil";
		var key = "new-note-1507317344";
		var visibility = $('#mode').val();
		var distribution_emails = [];
		var tag_list = tagString;
		var team_ids = arrTeamIds;

		if (visibility == "team" && arrTeamIds.length == 0) {
			alert("No teams have been selected");
			$('#divSavingMsg').hide();
			$('#btnSave').prop("disabled", false);
			return;
		}
		var note = new NoteStruct(title, tags, mClipData, note_type_id, investment_events,
				inherent_percent_change, key, visibility, distribution_emails, tag_list);
		var data = new DataStruct(note, team_ids);

		// first attempt
		chrome.runtime.sendMessage({command: "save_data", data:data}, function(response) {
				if (response == null || response.result == "ERROR") {
				   if (response.reason == "LOGIN_INVALID") {
					// login failed so try logging in with chrome_ext_auth
				        chrome.runtime.sendMessage({command: "chrome_ext_login", chrome_ext_auth:mUserData.chrome_ext_auth},
						 function(response) {
						   if (response == null || response.result == "ERROR") {
						      alert("error " + response.message);
						   } else if (response.result == "OK") {
						     
							// chrome_ext_auth worked so second attempt
					               chrome.runtime.sendMessage({command: "save_data", data:data},								 function(response) {
		     					         if (response.result == "OK") {
								   $('#divSavingMsg').hide();
								   $('#btnSave').prop("disabled", false);
								   mClipData = "";
								   $('#divClip').html("<br><center>Fetching page content. Please wait.....</center>");
								   $('#divClip').hide();
								   $('#divCloseClip').hide();
								   alert("Data posted successfully");

								 } else if (response.result == 	"ERROR") {
									if (response.reason == "LOGIN_INVALID") {
								           alert("Your login is invalid or has expired");
								        } else {
										alert("Error " + response.reason);
									}
							         } //  if (response.result == "OK") else

							   
							}); //  chrome.runtime.sendMessage({command: "save_data"	
							
						   } //  if (response == null || response.result == "ERROR") else
					}); //   chrome.runtime.sendMessage({command: "chrome_ext_login"

				   } else {
					   alert(response.reason);
					   $('#divSavingMsg').hide();
					   $('#btnSave').prop("disabled", false);
				   } //  if (response.reason == "LOGIN_INVALID") else


				} else if (response.result == "OK") {
				   $('#divSavingMsg').hide();
				   $('#btnSave').prop("disabled", false);
				   mClipData = "";
				   $('#divClip').html("<br><center>Fetching page content. Please wait.....</center>");
				   $('#divClip').hide();
				   $('#divCloseClip').hide();
				   alert("Data posted successfully");
				} // 	if (response == null || response.result == "ERROR") else

	
			}); // 	chrome.runtime.sendMessage({command: "save_data"
	});

});



/**
 * Update save section of the popup html once login has been done and the popup is opened
 *
 */
function updateUIAfterLogin() {
        $('#menu1').html(mUserData.username + " <span class=\"caret\"></span>");
	chrome.runtime.sendMessage({command: "get_page_title"}, function(response) {
			if (response.result == "ERROR") {
			} else if (response.result == "OK") {
			   $('#pageTitle').text(response.data);
			}
	})
	chrome.runtime.sendMessage({command: "get_clip_mode"}, function(response) {
			if (response.result == "ERROR") {
			} else if (response.result == "OK") {
				mClipMode = response.data;
				if (mClipMode == "FULLPAGE") {
				   $('#clip1').trigger("click");
				}
				else if (mClipMode == "CLIPBOARD") {
				   $('#clip2').trigger("click");
				}
				else if (mClipMode == "BOOKMARK") {
				   $('#clip3').trigger("click");
				}
				   
			}
	})
}

/**
 * Get content to be clipped based on the selected option in the UI
 *
 */
function getPageContent() {
	 $('#divClip').show();

	if (mClipMode == "FULLPAGE") {
		 chrome.tabs.query({
		    active: true,
	            currentWindow: true
	        }, function(tabs) {
            		var tab = tabs[0];
			chrome.tabs.sendRequest(tab.id, {command: "get_page_content"}, function(response) {
				if (response == null || response.result == "ERROR") {
				   alert("Please reload this page to capture the content");
				   $('#divClip').hide();
				   $('#divCloseClip').hide();
				   mClipData = "";
				} else if (response.result == "OK") {
				   $('#divClip').text(response.data);
				   $('#divClip').show();
				   $('#divCloseClip').show();
				   mClipData = response.data;
				}
	
			});
		 });
	}
	else if (mClipMode == "CLIPBOARD") {
	 	chrome.tabs.query({
	   	    active: true,
	            currentWindow: true
	        }, function(tabs) {
            		var tab = tabs[0];
			chrome.tabs.sendRequest(tab.id, {command: "get_clipboard"}, function(response) {
				if (response == null || response.result == "ERROR") {
				   alert("Please reload this page to capture the content");
				   $('#divClip').hide();
				   $('#divCloseClip').hide();
				   mClipData = "";

				} else if (response.result == "OK") {
					$('#divClip').text(response.data);
					mClipData = "";
				   	$('#divClip').show();
					$('#divCloseClip').show();
					 mClipData = response.data;

				}
	
			});
		 });

	}
	else if (mClipMode == "BOOKMARK") {
	 	 chrome.tabs.query({
		    active: true,
	            currentWindow: true
	        }, function(tabs) {
            		var tab = tabs[0];
			chrome.tabs.sendRequest(tab.id, {command: "get_bookmark"}, function(response) {
				if (response == null || response.result == "ERROR") {
				   alert("Please reload this page to capture the content");
				   $('#divClip').hide();
				   $('#divCloseClip').hide();
				   mClipData = "";
				} else if (response.result == "OK") {
				   $('#divClip').text(response.data);
				   $('#divClip').show();
				   $('#divCloseClip').show();
				   mClipData = response.data;

				}
	
			});
		 });

	}

}

/**
 * Populate the tags dropdown control
 * 
 */
function fillTagDropdown(tags) {
   $('#tags').empty();
   for(var i =0; i < tags.length; i++) {
   	 $("<option />", {
      	    val: tags[i],
            text: tags[i]
    	}).appendTo($('#tags'));
   }
}

/**
 * Populate the teams checkboxes
 * 
 */
function fillTeamsUI(teams) {
   $('#divTeams').empty();

   for(var i =0; i < teams.length; i++) {
	var obj = teams[i];
	var html = "<div class=\"checkbox\"><label><input type=\"checkbox\" class=\"classteams\" value=\"" + obj.id +"\"> " + obj.name + "</label></div>";
	$('#divTeams').append(html);
   }
}


