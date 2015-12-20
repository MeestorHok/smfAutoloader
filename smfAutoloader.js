(function (window) {
    "use strict";
    
    var smfAutoloader;
    smfAutoloader = new (function () {
   
        var self = this,
            results = '{',
            instagramDone = false,
            facebookDone = true, // set fo false after facebook is implemented
            twitterDone = true, // set fo false after twitter is implemented
            googleDone = true, // set fo false after google is implemented
            ajaxDone = false; // will only be true once all others are finished
        
        self.init = function (maxPosts, previousObject) {
            // set parameters for calls
            $.ajax({
                url: '../secrets.php',
                dataType: "json",
                cache: false,
                success: function (response) {
                    var controls = { instagram: {},
                                     facebook: {} };
                    if (typeof response === 'object') {
                        
                        controls['previousObject'] = previousObject || {}; // optional ability to continue on previous object
                        
                        controls['instagram']['accessToken'] = response['instagram']['accessToken'];
                        controls['instagram']['clientId'] = response['instagram']['clientId'];
                        controls['instagram']['userId'] = response['instagram']['userId'];
                        
                        controls['facebook']['appId'] = response['facebook']['appId'];
                        controls['facebook']['userId'] = response['facebook']['userId'];
                        controls['facebook']['accessToken'] = response['facebook']['accessToken'];
                        
                        controls['limit'] = Math.max(Math.floor(maxPosts / (controls.length - 2)), 1) || 5;
                    } else {
                      throw new Error("smfAutoloader requires secrets in the form of an \"object\"");
                    }
                    self.getPosts(controls); // start getting posts
                },
                error: function () {
                    throw new Error('There was an error retrieving secrets.');
                }
            });
        };
        
        self.getPosts = function (controls) {
            // continue old Object or start a new one
            if (typeof controls.previousObject === 'object' && controls.previousObject.length > 0) {
              results = JSON.stringify(controls.previousObject);
            } else {
              results = '{';
            }
            if (results[results.length - 1] == '}') { // if results array is closed, open it
                results = results.substring(0, results.length - 1) + ',';
            }
            
            /* send requests to each media source */
            self.getInstagram(controls);
            /*
            self.getFacebook();
            /*
            self.getTwitter();
            /*
            self.getGoogle();
            /**/
        };
        
        /*Instagram Retrieval*/
        self.getInstagram = function (controls) {
            
            // check that required resources are present
            if (typeof controls.instagram.clientId !== 'string' || controls.instagram.clientId.length <= 0) {
                throw new Error("Missing clientId for Instagram request.");
            }
            if (typeof controls.instagram.userId !== 'string' || controls.instagram.userId.length <= 0) {
                throw new Error("Missing userId for Instagram request.");
            }
            
            // build url for request
            var url;
            if (typeof controls.instagram.nextUrl === 'undefined') {
                url = 'https://api.instagram.com/v1/users/' + controls.instagram.userId + '/media/recent';
                url += '?access_token=' + controls.instagram.accessToken;
                url += '&count=' + controls.limit;
            } else {
                if (typeof controls.instagram.nextUrl === 'string' && controls.instagram.nextUrl.length > 0) {
                    url = controls.instagram.nextUrl;
                } else {
                    console.log('There are no more Instagram posts to retrieve.');
                    self.finish('instagram', '');
                }
            }
            // send request for instagram posts
            $.ajax({
                url: url,
                dataType: "jsonp",
                cache: false,
                success: function (responseText) {
                    var response = responseText;
                    
                    if (response.meta.code !== 200) throw new Error("Error from Instagram: " + response.meta.error_message);
                    
                    controls['instagram']['nextUrl'] = '';
                    if (response.pagination != null) {
                      controls['instagram']['nextUrl'] = response.pagination.next_url; // set nextURL
                    }
                    
                    self.formatInstagram(response);
                },
                error: function () {
                    self.finish('instagram', '');
                }
            });
        };
        /*Instagram JSON formatting for a universal JSON format*/
        self.formatInstagram = function (jsonPosts) {
            var instagramJSON = '';
            
            for (var i = 0; i < jsonPosts['data'].length; i++) {
                var post = jsonPosts['data'][i],
                    picMediaSrc = 'instagram',
                    picType = 'photo',
                    picText = post['caption']['text'],
                    picUsername = post['user']['username'],
                    picUserLink = 'https://www.instagram.com/'+post['user']['username']+'/',
                    picLink = post['link'],
                    picLikeCount = post['likes']['count'],
                    picCommentCount = post['comments']['count'],
                    picSrc = post['images']['standard_resolution']['url'],
                    picTimestampFormatted = (function (timestamp) {
                                                return date("ymdHis", timestamp); // yymmddhhmmss
                                            })(post['created_time']);
                    
                instagramJSON += '"'+picTimestampFormatted+'" : {';
                instagramJSON += '"mediaSrc" : "'+picMediaSrc+'",';
                instagramJSON += '"username" : "'+picUsername+'",';
                instagramJSON += '"userLink" : "'+picUserLink+'",';
                instagramJSON += '"post" : {';
                    instagramJSON += '"type" : "'+picType+'",';
                    instagramJSON += '"image" : "'+picSrc+'",';
                    instagramJSON += '"postLink" : "'+picLink+'",';
                    instagramJSON += '"postText" : "'+picText+'",';
                    instagramJSON += '"shareLink" : "",';
                    instagramJSON += '"shareTitle" : "",';
                    instagramJSON += '"shareText" : "",';
                    instagramJSON += '"numLikes" : "'+picLikeCount+'",';
                    instagramJSON += '"numComments" : "'+picCommentCount+'",';
                    instagramJSON += '"numRepubs" : ""}';
                instagramJSON += '},';
            }
            
            self.finish('instagram', instagramJSON);
        };
        /*Facebook Retrieval
        self.getFacebook = function () {
            FB.init({
              appId      : controls.facebook.appId,
              xfbml      : true,
              version    : 'v2.5'
            });
            FB.api("/" + controls.facebook.userId + "/feed", {limit: 5}, function(data){
                console.log(data);
            });
        };
        /**/
        
        
        self.finish = function (src, posts) {
            switch (src) {
              case 'instagram':
                results += posts;
                instagramDone = true;
                break;
              case 'facebook':
                results += posts;
                facebookDone = true;
                break;
              case 'twitter':
                results += posts;
                twitterDone = true;
                break;
              case 'google':
                results += posts;
                googleDone = true;
                break;
              default:
                break;
            }
            
            if (instagramDone && facebookDone && twitterDone && googleDone) {
                if (results[results.length - 1] == ',') {
                    results = results.substring(0, results.length - 1);
                }
                results += '}';
                ajaxDone = true;
            }
        };
        
        self.isReady = function () {
            return ajaxDone;
        };
        
        self.posts = function () {
            return JSON.parse(results);
        };
        
        return self;
    })();
    
    window.smfAutoloader = smfAutoloader;
})(window);

