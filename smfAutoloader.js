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
            ajaxDone = false,
            controls = {
                previousObject: {},
                limit: 5,
                instagram: {
                    clientId: '',
                    userId: '',
                    accessToken: '',
                    nextUrl: ''
                },
                facebook: {
                    clientId: '',
                    userId: '',
                    accessToken: '',
                    nextUrl: ''
                },
                twitter: {
                    clientId: '',
                    userId: '',
                    accessToken: '',
                    nextUrl: ''
                },
                google: {
                    clientId: '',
                    userId: '',
                    accessToken: '',
                    nextUrl: ''
                }
            };
        
        self.getPosts = function (params) {
            // set parameters for calls
            var option, value, instaNext, faceNext, twitNext, googNext;
            if (typeof params === 'object') {
                instaNext = controls.instagram.nextUrl;
                faceNext = controls.facebook.nextUrl;
                twitNext = controls.twitter.nextUrl;
                googNext = controls.google.nextUrl;
                for (option in params) {
                  value = params[option];
                  controls[option] = value;
                }
                controls.limit = Math.min(Math.floor(controls.limit / (controls.length - 2)), 5) || 5;
                controls.instagram.nextUrl = instaNext;
                controls.facebook.nextUrl = faceNext;
                controls.twitter.nextUrl = twitNext;
                controls.google.nextUrl = googNext;
            } else {
              throw new Error("smfAutoloader requires parameters in the form of an \"object\"");
            }
            
            // continue old Object or start a new one
            if (typeof controls.previousObject === 'object' && controls.previousObject.length > 0) {
              results = JSON.stringify(controls.previousObject);
            } else {
              results = '{';
            }
            if (results[results.length - 1] == '}') { // if results array is closed, open it
                results = results.substring(0, results.length - 1) + ',';
            }
            
            // send requests to each media source
            self.getInstagram();
            /*
            self.getFacebook();
            /*
            self.getTwitter();
            /*
            self.getGoogle();
            /**/
            
        };
        
        /*Instagram Retrieval*/
        self.getInstagram = function () {
            var response = {};
            
            // check that required resources are present
            if (typeof controls.instagram.clientId !== 'string' || controls.instagram.clientId.length <= 0) {
                throw new Error("Missing clientId for Instagram request.");
            }
            if (typeof controls.instagram.userId !== 'string' || controls.instagram.userId.length <= 0) {
                throw new Error("Missing userId for Instagram request.");
            }
            /*
            if (typeof controls.instagram.accessToken !== 'string' || controls.instagram.accessToken.length <= 0) {
                var accessToken = 'https://api.instagram.com/oauth/authorize/?client_id='+ CLIENT-ID + '&redirect_uri=&response_type=token';
            }
            */
            
            // build url for request
            var url;
            if (typeof controls.instagram.nextUrl === 'undefined') {
                console.log('No more Instagram posts are available');
                self.finish('instagram', '');
            } else {
                if (typeof controls.instagram.nextUrl === 'string' && controls.instagram.nextUrl.length > 0) {
                    url = controls.instagram.nextUrl;
                } else {
                    url = 'https://api.instagram.com/v1/users/' + controls.instagram.userId + '/media/recent';
                    url += '?access_token=' + controls.instagram.accessToken;
                    url += '&count=' + controls.limit;
                }
                // send request for instagram posts
                $.ajax({
                    url: url,
                    dataType: "jsonp",
                    cache: false,
                    success: function (responseText) {
                        response = responseText;
                        
                        if (response.meta.code !== 200) throw new Error("Error from Instagram: " + response.meta.error_message);
                        
                        controls.instagram.nextUrl = '';
                        if (response.pagination != null) {
                          controls.instagram.nextUrl = response.pagination.next_url; // set nextURL
                        }
                        
                        self.formatInstagram(response);
                    },
                    error: function () {
                        self.finish('instagram', '');
                    }
                });
            }
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
        
        self.posts = function (num) {
          var i = 0 || num + 1;
          if (ajaxDone) {
              return JSON.parse(results);
          } else {
              if (i > 50) {
                console.log('Ajax calls took too long to respond.');
                return controls.previousObject;
              } else {
                setTimeout(self.posts(i), 100);
              }
          }
        };
        
        return self;
    })();
    
    window.smfAutoloader = smfAutoloader;
})(window);

