var mLoggedIn = false;
var mClipMode = "FULLPAGE";  // FULLPAGE/CLIPBOARD/BOOKMARK
var mUserData = null;

chrome.runtime.onInstalled.addListener(function() {
  ////console.log("Installed.");

 });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    
    if (request.command == "login") {
	var username = request.username;
	var pwd = request.pwd;

	$.ajax({
		    url: 'https://d0016.mackeyllc.com/ipad/login',
		    dataType: 'json',
		    type: 'post',
		    async: true,
		    crossDomain: true,
		    contentType: 'application/json',
		    data: JSON.stringify( { "password": pwd, "username": username } ),
		    processData: false,
		    success: function( data, textStatus, jqXHR ){
			if (data.error != null) {
			   var reason = data.reason;
			   sendResponse({result: "ERROR", message:"Error - Login Failed . Reason: " + reason});
			} else {
			
			    userStruct = new UserStruct(data.id, data.username, data.first_name, data.last_name,
				    data.company_name, data.default_email_setting, data.has_teams, data.chrome_ext_auth);
			    if (userStruct) {
				 sendResponse({result: "OK", data: data});
				 mUserData = userStruct;
			    }
			   
			}
		    },
		    error: function( data, textStatus, jqXHR ){
			sendResponse({result: "ERROR", message:"Error - Login Failed . Reason: " + jqXHR.responseText});

		    }
		});

    } //  if (request.greeting == "login") { 
    else  if (request.command == "tags") {

	$.ajax({
		    url: 'https://d0016.mackeyllc.com/ipad/current_user/tags',
		    async: true,
		    crossDomain: true,
		    contentType: 'application/json',
		    data: "",
		    xhrFields: { withCredentials: true },
		    processData: false,
		    success: function( data, textStatus, jqXHR ){
			var json = data;
			var tags = [];
			if (json.length > 0) {
			    for(var i= 0 ; i < json.length; i++) {
 		               var thisLine = json[i];
			       if (thisLine.ticker_symbol != "")
				   tags.push(thisLine.ticker_symbol);
			    }
			}
			 sendResponse({result: "OK", data: tags});
		    },
		    error: function( jqXHR, textStatus, errorThrown ){
			sendResponse({result: "ERROR", message:"Error - Tag retrieval Failed . Reason: " + jqXHR.responseText});

		    }
		});

    } // if request.command == "tags"

  else  if (request.command == "configuration") {

	$.ajax({
		    url: 'https://d0016.mackeyllc.com/home/configuration.json',
		    async: true,
		    crossDomain: true,
		    contentType: 'application/json',
		    data: "",
		    xhrFields: { withCredentials: true },
		    processData: false,
		    success: function( data, textStatus, jqXHR ){
			var json = data;
			var teams = data.current_user.teams;
			var arr = [];
			if (teams != null) {
			    for(var i = 0; i < teams.length; i++) {
			       var team = new TeamStruct(teams[i].id, teams[i].name);
			       arr.push(team);
			    }
		        }
			sendResponse({result: "OK", data: arr});
		    },
		    error: function( jqXHR, textStatus, errorThrown ){
			sendResponse({result: "ERROR", message:"Error - Configuration retrieval Failed . Reason: " + jqXHR.responseText});

		    }
		});

    } // if request.command == "configuration"

    else if (request.command == "chrome_ext_login") {
	var chrome_ext_auth = request.chrome_ext_auth;
	$.ajax({
		    url: 'https://d0016.mackeyllc.com/ipad/v2/chrome_ext_login',
		    type: 'post',
		    async: true,
		    dataType: 'json',
		    crossDomain: true,
		    contentType: 'application/json',
		    data: JSON.stringify( { "chrome_ext_auth": chrome_ext_auth } ),
		    processData: false,
		    success: function( data, textStatus, jqXHR ){

			if (data.error != null) {
			   var reason = data.reason;
			   sendResponse({result: "ERROR", message: jqXHR.messageText});
			} else {
			 	sendResponse({result: "OK", data: data});

			    userStruct = new UserStruct(data.id, data.username, data.first_name, data.last_name,
				    data.company_name, data.default_email_setting, data.has_teams, data.chrome_ext_auth);
			    if (userStruct) {
				 sendResponse({result: "OK", data: data});

			    }
			   
			}
		    },
		    error: function( jqXHR, textStatus ){
			sendResponse({result: "ERROR", message:"Error - Login Failed . Reason: " + jqXHR.responseText});

		    }
		});
    
    } // if request.command == "chrome_ext_auth"
   else if (request.command == "set_login_flag") {
	mLoggedIn = request.flag;
   } // if request.command == "set_login_flag"
   else if (request.command == "get_login_flag") {
	if (mLoggedIn)
		sendResponse({result: "1"});
	else
		sendResponse({result: "0"});
   } // if request.command == "get_login_flag"

   else if (request.command == "save_user_data") {
	saveUserData(request.data);
	sendResponse({result: ""});
   } // if request.command == "save_user_data"

   else if (request.command == "load_user_data") {
	var getting = chrome.storage.local.get("userData", function(result){
		if (result.userData != null) {
			sendResponse({result: "OK", data: result.userData});
			mUserData = result.userData;
			mUserData = JSON.parse(result.userData);

		} else {
			sendResponse({result: "ERROR"});
		}
    	});

   } // if request.command == "load_user_data"

   else if (request.command == "save_tags") {
	saveTags(request.data);
	sendResponse({result: ""});
   } // if request.command == "save_tags"

   else if (request.command == "load_tags") {
	var getting = chrome.storage.local.get("tags", function(result){
		if (result.tags != null)
			sendResponse({result: "OK", data: result.tags});
		else
			sendResponse({result: "ERROR"});
    	});

   } // if request.command == "load_tags"

  else if (request.command == "logout") {
	chrome.storage.local.remove("userData");
	mUserData = null;
	sendResponse({result: "OK"});

   } // if request.command == "logout"

   else if (request.command == "get_page_title") {
	chrome.tabs.getSelected(null,function(tab) { // null defaults to current window
	  	var title = tab.title;
		sendResponse({result: "OK", data: title});
	});

   } // if request.command == "get_page_title"

   else if (request.command == "get_clip_mode") {
	sendResponse({result: "OK", data: mClipMode});

   } // if request.command == "get_clip_mode"

   else if (request.command == "set_clip_mode") {
	mClipMode = request.data;
	sendResponse({result: "OK"});

   } // if request.command == "set_clip_mode"

   else if (request.command == "save_data") {
	var data = request.data;
	

	var XHR = new XMLHttpRequest();
	var urlEncodedData = "";
	XHR.withCredentials = true;

	// Combine the pairs into a single string and replace all %-encoded spaces to 
	// the '+' character; matches the behaviour of browser form submissions.
	urlEncodedData =  JSON.stringify( data );

	// Define what happens on successful data submission
	XHR.addEventListener('load', function(event) {
			  if (XHR.responseText.indexOf("<!DOCTYPE HTML>") > -1) {
				 sendResponse({result: "ERROR", reason: "LOGIN_INVALID"});

			  } else {
				  sendResponse({result: "OK"});
			  }

			});

	// Define what happens in case of error
	XHR.addEventListener('error', function(event) {
		   sendResponse({result: "ERROR", reason: "Could not post data"});

			});

	// Set up our request
	XHR.open('POST', "https://d0016.mackeyllc.com/notes");

	// Add the required HTTP header for form data POST requests
	XHR.setRequestHeader('Content-Type', 'application/json');

	// Finally, send our data.
	XHR.send(urlEncodedData);
   } // if request.command == "save_data"
   else if (request.command == "save_teams") {
	saveTeams(request.data);
	sendResponse({result: ""});
   } // if request.command == "save_teams"

  else if (request.command == "load_teams") {
	var getting = chrome.storage.local.get("teams", function(result){
		if (result.teams != null)
			sendResponse({result: "OK", data: result.teams});
		else
			sendResponse({result: "ERROR"});
    	});

   } // if request.command == "load_teams"


    return true;
  });


/**
 * Save user data to local storage
 * 
 */
function saveUserData(uData) {
  chrome.storage.local.set({
    "userData": JSON.stringify(uData)
  })
}


/**
 * Load user data from local storage
 *
 */
function loadUserData() {
   var getting = chrome.storage.local.get("userData", getUserData);
}

/**
 * Read userData obtained from local storage and process it
 *
 */
function getUserData(result) {
   if (result != null) {
	var chrome_ext_auth = result.userData.chrome_ext_auth;
	sendResponse({result: "OK", data: result.userData});
   } else {
	sendResponse({result: "ERROR"});
   }
}

/**
 * Save tags to local storage
 * 
 */
function saveTags(tags) {
  chrome.storage.local.set({
    "tags": JSON.stringify(tags)
  })
}


/**
 * Load tags from local storage
 *
 */
function loadTags() {
   var getting = chrome.storage.local.get("tags", getTags);
}

/**
 * Read tags obtained from local storage and process it
 *
 */
function getTags(result) {
   if (result != null) {
	sendResponse({result: "OK", data: result.tags});
   } else {
	sendResponse({result: "ERROR"});
   }
}


/**
 * Save teams to local storage
 * 
 */
function saveTeams(teams) {
  chrome.storage.local.set({
    "teams": JSON.stringify(teams)
  })
}

/**
 * Read teams obtained from local storage and process it
 *
 */
function getTeams(result) {
   if (result != null) {
	sendResponse({result: "OK", data: result.teams});
   } else {
	sendResponse({result: "ERROR"});
   }
}



chrome.contextMenus.create({
 title: "Send Page",
 contexts:["selection"],  // ContextType
 onclick: sendPage // A callback function
});

/**
 * Send selected content in the page from context menu
 * This has to go directly from here as the background script cannot invoke the popup UI
 */
function sendPage(text, tab){
      console.log("sendpage()");

    if (mUserData == null) {
	alert("You are not logged in");
    } else {
	var chrome_ext_auth = mUserData.chrome_ext_auth;
	$.ajax({
		    url: 'https://d0016.mackeyllc.com/ipad/v2/chrome_ext_login',
		    type: 'post',
		    async: true,
		    dataType: 'json',
		    crossDomain: true,
		    contentType: 'application/json',
		    data: JSON.stringify( { "chrome_ext_auth": chrome_ext_auth } ),
		    processData: false,
		    success: function( data, textStatus, jqXHR ){

			if (data.error != null) {
			   alert("Error doing chrome_ext_auth :" + jqXHR.messageText);
			} else {
				postNote(text, tab);
			}
		    },
		    error: function( jqXHR, textStatus ){
			 alert(jqXHR.responseText);

		    }
		});
   } 

}

function postNote(text, tab) {
  	var clippedData = text.selectionText;

	// compose note structure
		var title = tab.title;

		var tags = [];
		var tagString = "";
		var arrTeamIds = [];
		var investment_events = [];
		var note_type_id = 8;
		var inherent_percent_change = "nil";
		var key = "new-note-1507317344";
		var visibility = "publish";
		var distribution_emails = [];
		var tag_list = tagString;
		var team_ids = arrTeamIds;

		var note = new NoteStruct(title, tags, clippedData, note_type_id, investment_events,
				inherent_percent_change, key, visibility, distribution_emails, tag_list);
		var data = new DataStruct(note, team_ids);

	// send data to server	

	var XHR = new XMLHttpRequest();
	var urlEncodedData = "";
	XHR.withCredentials = true;
	urlEncodedData =  JSON.stringify( data );
	
	// Define what happens on successful data submission
	XHR.addEventListener('load', function(event) {
			  if (XHR.responseText.indexOf("<!DOCTYPE HTML>") > -1) {
				 alert("Data submission failed because login is invalid or expired");

			  } else {
				 alert("Data was submitted successfully");
			  }

			});

	// Define what happens in case of error
	XHR.addEventListener('error', function(event) {
		alert("Error - could not post data");
	});

	// Set up our request
	XHR.open('POST', "https://d0016.mackeyllc.com/notes");

	// Add the required HTTP header for form data POST requests
	XHR.setRequestHeader('Content-Type', 'application/json');

	// Finally, send our data.
	XHR.send(urlEncodedData);
	

 }


///////////////////////////////////////
/**
 * Generic error logger
 */
function onError(e) {
  console.error(e);
}


//////////////////////////////////////////////////


