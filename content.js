
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if(request.command == "get_page_content"){
            sendResponse({result: "OK", data: document.all[0].outerHTML}); 
        }
  	else if(request.command == "get_clipboard"){
		var selText = window.getSelection().toString();
		// use this line if you want the data with html tags var selText = getSelectionHTML();
		sendResponse({result: "OK", data: selText}); 
        }
	else if(request.command == "get_bookmark"){
		var arrTags = ["h1", "h2", "h3", "h4", "h5", "p", "span", "div"];
		var found = false;
		var selText = "";
		var elem = 0;
		while (!found && elem < arrTags.length) {
		   var isThere = document.getElementsByTagName(arrTags[elem]);
		   if (isThere != null && isThere.length > 0) {
			   selText = document.getElementsByTagName(arrTags[elem])[0].innerText;
			   found = true;
		   }		  
		   if (!found) {
		      elem ++;
		   }
		}
		sendResponse({result: "OK", data: selText}); 
		
        }

    }
);

/**
 * Get selected content and return the HTML 
 *
 */
function getSelectionHTML() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}


