(function (window) {
    "use strict";
    
    var smfAutoloader;
    smfAutoloader = new (function () {
        var self = this,
            results = '{',
            paginationURLs = {
                insta: 'first',
                face: 'first',
                twit: 'first',
                goog: 'first'
            };
        
        self.getPosts = function (maxPosts, previousArray) {
            if (typeof previousArray === 'object') {
              results = JSON.stringify(previousArray);
            } else {
              results = '{';
            }
            
            var perSrc = Math.floor(maxPosts / 4);
            if (results[results.length - 1] == '}') { // if results array is closed,
                results = results.substring(0, results.length - 1) + ',';
            }
            /* instagram */
            results += self.getInstagram(perSrc);
            /* facebook
            results += self.getFacebook.get(paginationURLs.face, perSrc);
            /* twitter
            results += self.getTwitter.get(paginationURLs.twit, perSrc);
            /* google+
            results += self.getGoogle.get(paginationURLs.goog, perSrc);
            /**/
            
            if (results[results.length - 1] == ',') {
                results = results.substring(0, results.length - 1);
            }
            results += '}';
            
            return JSON.parse(results);
        };
        
        /*Instagram Retrieval*/
        self.getInstagram = function (maxPosts) {
            if (typeof paginationURLs.insta === 'string' && paginationURLs.insta.length > 0) {
              var response = {};
              
              if (paginationURLs.insta == 'first') { // get first iteration
                  response = {"iter": "first"};
              } else { // get next set
                  response = {"iter": paginationURLs.insta}; // must return object
              }
              
              paginationURLs.insta = 'next'; // set nextURL
              
              return self.formatInstagramJSON(response);
            } else { // there are no more posts available
              return;
            }
        };
        /*Instagram JSON formatting for a universal JSON format*/
        self.formatInstagramJSON = function (jsonPosts) {
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

