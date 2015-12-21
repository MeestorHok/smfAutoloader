(function (window) {
    "use strict";
    
    var smfAutoloader;
    smfAutoloader = new (function () {
   
        var self = this,
            results = '{',
            pagination = {
                instagram: undefined,
                facebook: undefined
            },
            instagramDone = false,
            facebookDone = false,
            ajaxDone = false; // will only be true once all others are finished
        
        self.getControls = function (maxPosts, previousObject) {
            $.ajax({
                url: '../secrets.php',
                dataType: "json",
                cache: false,
                success: function (response) {
                    var controls = { instagram: {},
                                     facebook: {} };
                    if (typeof response === 'object') {
                        
                        controls['previousObject'] = previousObject || {}; // optional ability to continue on previous object
                        
                        controls['instagram']['userId'] = response['instagram']['userId'];
                        controls['instagram']['accessToken'] = response['instagram']['accessToken'];
                        
                        controls['facebook']['userId'] = response['facebook']['userId'];
                        controls['facebook']['accessToken'] = response['facebook']['accessToken'];
                        
                        controls['limit'] = Math.max(Math.floor(maxPosts / (controls.length - 2)), 1) || 5;
                    } else {
                      throw new Error("smfAutoloader requires secrets in the form of an \"object\"");
                    }
                    self.fetch(maxPosts, previousObject, controls); // start getting posts
                },
                error: function () {
                    throw new Error('There was an error retrieving secrets.');
                }
            });
        };
        
        self.fetch = function (maxPosts, previousObject, controls) {
            if(typeof controls !== 'object') {
                self.getControls(maxPosts, previousObject);
            } else {
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
                /**/
                self.getFacebook(controls);
                /**/
            }
        };
        
        /*Instagram Retrieval*/
        self.getInstagram = function (controls) {
            
            // check that required resources are present
            if (typeof controls.instagram.userId !== 'string' || controls.instagram.userId.length <= 0) {
                throw new Error("Missing userId for Instagram request.");
            }
            
            // build url for request
            var url;
            if (typeof pagination.instagram === 'undefined') {
                url = 'https://api.instagram.com/v1/users/' + controls.instagram.userId + '/media/recent';
                url += '?access_token=' + controls.instagram.accessToken;
                url += '&count=' + controls.limit;
            } else {
                if (typeof pagination.instagram === 'string' && pagination.instagram.length > 0) {
                    url = pagination.instagram;
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
                    
                    pagination.instagram = '';
                    if (response.pagination != null) {
                        pagination.instagram = response.pagination.next_url; // set nextURL
                        if (pagination.instagram == undefined) pagination.instagram = '';
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
            if (jsonPosts['data'] !== undefined) {
            for (var i = 0; i < jsonPosts['data'].length; i++) {
                var post = jsonPosts['data'][i],
                    picMediaSrc = 'instagram',
                    picType = 'photo',
                    picText = post['caption']['text'] || '',
                    picUsername = post['user']['username'] || '',
                    picUserLink = 'https://www.instagram.com/'+post['user']['username']+'/' || '',
                    picLink = post['link'] || '',
                    picLikeCount = post['likes']['count'] || 0,
                    picCommentCount = post['comments']['count'] || 0,
                    picShareCount = 0,
                    picSrc = post['images']['standard_resolution']['url'] || '',
                    picTimestamp = post['created_time']; // in Unix format
                    
                instagramJSON += '"'+picTimestamp+'" : {'; // in Unix format to order later
                instagramJSON += '"timestamp" : "'+picTimestamp+'",';
                instagramJSON += '"mediaSrc" : "'+picMediaSrc+'",';
                instagramJSON += '"username" : "'+picUsername+'",';
                instagramJSON += '"userLink" : "'+picUserLink+'",';
                instagramJSON += '"post" : {';
                    instagramJSON += '"type" : "'+picType+'",';
                    instagramJSON += '"image" : "'+picSrc+'",';
                    instagramJSON += '"postLink" : "'+picLink+'",';
                    instagramJSON += '"postText" : "'+picText+'",';
                    instagramJSON += '"numLikes" : "'+picLikeCount+'",';
                    instagramJSON += '"numComments" : "'+picCommentCount+'",';
                    instagramJSON += '"numRepubs" : "'+picShareCount+'"}';
                instagramJSON += '},';
            }
            }
            
            self.finish('instagram', instagramJSON);
        };
        /*Facebook Retrieval*/
        self.getFacebook = function (controls) {
            
            // check that required resources are present
            if (typeof controls.facebook.accessToken !== 'string' || controls.facebook.accessToken.length <= 0) {
                throw new Error("Missing accessToken for Facebook request.");
            }
            if (typeof controls.facebook.userId !== 'string' || controls.facebook.userId.length <= 0) {
                throw new Error("Missing userId for Facebook request.");
            }
            
            // form url
            var url;
            if (typeof pagination.facebook === 'undefined') {
                url = 'https://graph.facebook.com/v2.5/' + controls.facebook.userId;
                url += '?access_token=' + controls.facebook.accessToken;
                url += '&fields=name,link,posts.limit(' + controls.limit + '){name,created_time,message,full_picture,type,link,likes,comments,shares}';
            } else {
                if (typeof pagination.facebook === 'string' && pagination.facebook.length > 0) {
                    url = pagination.facebook;
                } else {
                    console.log('There are no more Facebook posts to retrieve.');
                    self.finish('facebook', '');
                }
            }
            
            // send request for facebook posts
            $.ajax({
                url: url,
                dataType: "jsonp",
                cache: false,
                success: function (responseText) {
                    var response = responseText;
                    
                    if (response.error !== undefined) throw new Error("Error from Facebook: " + response.error.message);
                    
                    pagination.facebook = '';
                    if (response['posts'] !== undefined) {
                      pagination.facebook = response['posts']['paging']['next']; // set nextURL
                    }
                    
                    self.formatFacebook(response);
                },
                error: function () {
                    self.finish('facebook', '');
                }
            });
        };
        /*Facebook JSON formatting for a universal JSON format*/
        self.formatFacebook = function (jsonPosts) {
            
            var facebookJSON = '';
            
            if (jsonPosts['posts'] !== undefined) {
            for (var i = 0; i < jsonPosts['posts']['data'].length; i++) {
                var post = jsonPosts['posts']['data'][i],
                    picMediaSrc = 'facebook',
                    picType = post['type'] || 'status',
                    picText = post['message'] || '',
                    picUsername = jsonPosts['name'] || '',
                    picUserLink = jsonPosts['link'] || '',
                    picLink = post['link'] || '',
                    picLikeCount = (function (likes) {
                                        if (likes) {
                                            return likes['data'].length;
                                        } else {
                                            return 0;
                                        }
                                    })(post['likes']) || 0,
                    picCommentCount = (function (comments) {
                                        if (comments) {
                                            return comments['data'].length;
                                        } else {
                                            return 0;
                                        }
                                    })(post['comments']) || 0,
                    picShareCount = (function (shares) {
                                        if (shares) {
                                            return shares['data'].length;
                                        } else {
                                            return 0;
                                        }
                                    })(post['shares']) || 0,
                    picSrc = post['full_picture'] || '',
                    picTimestamp = Date.parse(post['created_time']) / 1000; // in Unix format
                    
                facebookJSON += '"'+picTimestamp+'" : {'; // in Unix format to order later
                facebookJSON += '"timestamp" : "'+picTimestamp+'",';
                facebookJSON += '"mediaSrc" : "'+picMediaSrc+'",';
                facebookJSON += '"username" : "'+picUsername+'",';
                facebookJSON += '"userLink" : "'+picUserLink+'",';
                facebookJSON += '"post" : {';
                    facebookJSON += '"type" : "'+picType+'",';
                    facebookJSON += '"image" : "'+picSrc+'",';
                    facebookJSON += '"postLink" : "'+picLink+'",';
                    facebookJSON += '"postText" : "'+picText+'",';
                    facebookJSON += '"numLikes" : "'+picLikeCount+'",';
                    facebookJSON += '"numComments" : "'+picCommentCount+'",';
                    facebookJSON += '"numRepubs" : "'+picShareCount+'"}';
                facebookJSON += '},';
            }
            }
            self.finish('facebook', facebookJSON);
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
              default:
                break;
            }
            
            if (instagramDone && facebookDone) {
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
            ajaxDone = instagramDone = facebookDone = false;
            return JSON.parse(results);
        };
        
        self.getPosts = function (maxPosts, previousObject, callback) {
            self.fetch(maxPosts, previousObject);
            return (function idle(counter) {// without a counter, any error in the AJAX will make this loop forever
                if(self.isReady()) {
                    console.log('AJAX finished.');
                    callback(self.posts());
                    return self.posts();
                } else {
                    if (counter > 0) { 
                        console.log('AJAX requests still pending, trying again in 1 second...');
                        setTimeout(function () { idle(counter - 1); }, 1000);
                    } else {
                        console.log('AJAX took too long to respond, please try again.');
                        return previousObject;
                    }
                }
            })(10);
        };
        
        return self;
    })();
    
    window.smfAutoloader = smfAutoloader;
})(window);

