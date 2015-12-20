(function (window) {
    "use strict";
    
    var smfAutoloader;
    smfAutoloader = new (function () {
        var self = this,
            results = '{',
            controls = {
                previousObject: {},
                limit = 5,
                instagram: {
                    accessToken: '',
                    clientId: '',
                    userId: '',
                    nextUrl: 'first'
                },
                facebook: {
                    accessToken: '',
                    clientId: '',
                    userId: '',
                    nextUrl: 'first'
                },
                twitter: {
                    accessToken: '',
                    clientId: '',
                    userId: '',
                    nextUrl: 'first'
                },
                google: {
                    accessToken: '',
                    clientId: '',
                    userId: '',
                    nextUrl: 'first'
                }
            };
        
        self.getPosts = function (options) {
          
            controls.previousObject = options.previousObject || {};
            controls.limit = Math.min(Math.floor(options.limit / (controls.length - 2)), 5) || 5;
            
            controls.instagram.accessToken = options.instagram.accessToken || '';
            controls.instagram.clientId = options.instagram.clientId || '';
            controls.instagram.userId = options.instagram.userId || '';
            
            controls.facebook.accessToken = options.facebook.accessToken || '';
            controls.facebook.clientId = options.facebook.clientId || '';
            controls.facebook.userId = options.facebook.userId || '';
            
            controls.twitter.accessToken = options.twitter.accessToken || '';
            controls.twitter.clientId = options.twitter.clientId || '';
            controls.twitter.userId = options.twitter.userId || '';
            
            controls.google.accessToken = options.google.accessToken || '';
            controls.google.clientId = options.google.clientId || '';
            controls.google.userId = options.google.userId || '';
            
            
            if (typeof controls.previousObject === 'object' && controls.previousObject.length > 0) {
              results = JSON.stringify(controls.previousObject);
            } else {
              results = '{';
            }
            
            if (results[results.length - 1] == '}') { // if results array is closed, open it
                results = results.substring(0, results.length - 1) + ',';
            }
            
            /* instagram */
            results += self.getInstagram();
            /* facebook
            results += self.getFacebook();
            /* twitter
            results += self.getTwitter();
            /* google+
            results += self.getGoogle();
            /**/
            
            if (results[results.length - 1] == ',') {
                results = results.substring(0, results.length - 1);
            }
            results += '}';
            
            return JSON.parse(results);
        };
        
        /*Instagram Retrieval*/
        self.getInstagram = function () {
            if (typeof controls.instagram.nextUrl === 'string' && controls.instagram.nextUrl.length > 0) {
                var response = {};
                
                if (controls.instagram.nextUrl == 'first') { // get first iteration
                    response = {"iter": "first"};
                } else { // get next set
                    response = {"iter": controls.instagram.nextUrl}; // must return object
                }
                
                controls.instagram.nextUrl = 'next'; // set nextURL
                
                return self.formatInstagram(response);
            } else { // there are no more posts available
                return;
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
                    picTimestampFormatted = date("ymdHis", post['created_time']); // yymmddhhmmss
                
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
            
            return instagramJSON;
        };
        /**/
        
        return self;
    })();
    
    window.smfAutoloader = smfAutoloader;
})(window);

