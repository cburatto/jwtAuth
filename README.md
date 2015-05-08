# jwtAuth
Sails.js policy to check for JWT token on different parts of the request

Check order
 
header: preferred method for API requests

body: also useful for API requests. But since it is possible that your request body might have an element
with the same name as jwtTokenVar, we prefer setting and working with the header first.

cookie: this is the last resort and is checked in cases where the restricted resource is requested directly on a
browser tab via GET. This case doesn't allow the injection of JWT on header and body before the request.
The browser client must be running code to create this cookie when firstly authenticated and receiving the JWT.
Ex.: browser must use `https://github.com/js-cookie/js-cookie` and run this code when receiving the authenticated JWT:

 
 
       function storeJWT(jwt){
            Cookies.set(jwtTokenVar, jwt, { expires: 7 });
        }
  
  This will ensure that the browser sends the JWT if the user opens a new tab and tries to GET a restricted resource.
  
  *Attention*: JQUERY AJAX requests are problematic with cookies, so if you are using it on the client, add the required
  header to the requests. Ex.:
 
       function ajaxPost(url, data, cb){
            var head = {};
            head[jwtTokenVar] = Cookies.get(jwtTokenVar)
            $.ajax({
                "url" : url,
                "contentType" : "application/json; charset=UTF-8",
                "data" : JSON.stringify(data),
                "type" : "POST",
                "headers" : head,
                "xhrFields": {
                    "withCredentials" : true
                },
                "success" : function(serverData, textStatus, jqXHR){
                    cb(null, {
                        "serverData" : serverData,
                        "textStatus" : textStatus,
                        "jqXHR" : jqXHR
                    });
                },
                "error": function (jqXHR, textStatus, errorThrown) {
                    cb({
                        "jqXHR" : jqXHR,
                        "textStatus" : textStatus,
                        "errorThrown" : errorThrown
                    });
                }
            });
        }
 
 Comments are always welcome.
 
 Licence: MIT