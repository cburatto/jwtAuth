/**
 * jwtAuth Policy
 * Created by cburatto on 28/04/2015.
 * https://github.com/cburatto/jwtAuth
 * Licence: MIT
 * @description :: Check for JWT token on different parts of the request
 * @help        ::     check header, then body, then cookie
 * header: preferred method for API requests
 * body: also useful for API requests. But since it is possible that your request body might have an element
 * with the same name as jwtTokenVar, we prefer setting and working with the header first.
 * cookie: this is the last resort and is checked in cases where the restricted resource is requested directly on a
 * browser tab via GET. This case doesn't allow the injection of JWT on header and body before the request.
 * The browser client must be running code to create this cookie when firstly authenticated and receiving the JWT.
 * Ex.: browser must use https://github.com/js-cookie/js-cookie from and run when receiving the authenticated JWT:
 *
 *
 *      function storeJWT(jwt){
            Cookies.set(jwtTokenVar, jwt, { expires: 7 });
        }
 * Attention: JQUERY AJAX requests are problematic with cookies, so if you are using it on the client, add the required
 * header to the requests. Ex.:
 *
 * function ajaxPost(url, data, cb){
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
 *
 *
 */

module.exports = function(req, res, next) {

    /*
     * You can set the jwt token variable on the environment or insert it directly here. Ex.: x-access-token
     * This variable will be used as a request header and as as cookie parameter    *
     * */

    var jwtTokenVar = process.env.JWT_TOKENVAR;
    var accessToken;
    /*
     * check header, then body, then cookie
     * header: preferred method for API requests
     * body: also useful for API requests. But since it is possible that your request body might have an element
     * with the same name as jwtTokenVar, we prefer setting working with the header first
     * cookie: this is the last resort and is checked in cases where the restricted resource is requested directly on a
     * browser tab via GET. This case doesn't allow the injection of header and body. We rely that the browser client is
     * running code to create this cookie when firstly authenticated and receiving the JWT.
     * */
    if(req.headers[jwtTokenVar]) {
        //Found jwt on header;
        accessToken = req.headers[jwtTokenVar];
        //console.log("Found header jwt: " + accessToken + "\n");
    }else if(req.body && req.body[jwtTokenVar]){
        //Found jwt on body;
        accessToken = req.body[jwtTokenVar];
        //console.log("Found body jwt: " + accessToken + "\n");
    }else if(req.cookies[jwtTokenVar]){
        //Found jwt on cookie;
        accessToken = req.cookies[jwtTokenVar];
        //console.log("Found cookie jwt: " + accessToken + "\n");
    }else{
        //Jwt not found anywhere;
        //console.log("Not found anywhere. request: " + JSON.stringify(req.cookies) + "\n");
        /*
         * TB implemented: Utils.delay(req)
         * this should delay the response incrementally according to number of failed tries
         * Utils.delay should optionally block a user account in case of too many retries.
         * */
        res.status(401);
        return res.json({"status":401,"msg": sails.__("invalidCredentials")});
    }
    // https://github.com/auth0/node-jsonwebtoken
    // save your JWT secret on an env variable, for example process.env.JWT_SECRET
    var jwt = require('jsonwebtoken');
    jwt.verify(accessToken, process.env.JWT_SECRET, function(err, decoded) {
        if(err){
            /*
             * TB implemented: Utils.delay(req)
             * this should delay the response incrementally according to number of failed tries
             * Utils.delay should optionally block a user account in case of too many retries.
             * */
            res.status(401);
            return res.json({"status":401,"msg": sails.__("invalidCredentials")});
        }
        /*
         * TB implemented: Utils.log(jwt)
         * log the JWT use for auditing
         * */

        /* adding the decoded object to the request so it can be used elsewhere on the call if needed */
        req.jwt = {};
        req.jwt.payload = decoded;
        req.jwt[process.env.JWT_TOKENVAR]  = accessToken;
        next();
    });
};