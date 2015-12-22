(function (window) {
    "use strict";
    
    var smfAutoloader;
    smfAutoloader = new (function () {
   
        var self = this,
            results,
            pagination = {
                instagram: undefined,
                facebook: undefined
            },
            instagramDone = false,
            facebookDone = false;
        
        self.start = function (maxPosts, url) {
            return self.getSecrets(maxPosts, url).then(function (controls) {
                // continue old Object or start a new one
                results = '{';
                
                if (results[results.length - 1] == '}') { // if results array is closed, open it
                    results = results.substring(0, results.length - 1) + ',';
                }
                self.getInstagram(controls).then(function (response) { // get instagram posts
                    instagramDone = true;
                    results += self.formatInstagram(response); // format them and add to results
                }, function (error) {
                    instagramDone = true;
                });
                self.getFacebook(controls).then(function (response) { // get facebook posts
                    facebookDone = true;
                    results += self.formatFacebook(response); // format them and add to results
                }, function (error) {
                    facebookDone = true;
                });
            });
        };
        /*Generic ajax request in the form of a Promise*/
        self.fetch = function (url, dataType) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: url,
                    dataType: dataType,
                    cache: false,
                    success: function (response) { resolve(response); },
                    error: function () { reject('There was an error fetching AJAX for '); }
                });
            });
        };
        /*Get access tokens and secret info from php*/
        self.getSecrets = function (maxPosts, url) {
            url = url || '/smfAutoloader/secrets.php';
            return self.fetch(url, 'json').then( 
                function (response) {
                    var controls = { instagram: {},
                                     facebook: {} };
                    if (typeof response === 'object') {
                        
                        controls['instagram']['userId'] = response['instagram']['userId'];
                        controls['instagram']['accessToken'] = response['instagram']['accessToken'];
                        
                        controls['facebook']['userId'] = response['facebook']['userId'];
                        controls['facebook']['accessToken'] = response['facebook']['accessToken'];
                        
                        controls['limit'] = Math.max(Math.floor(maxPosts / (controls.length - 2)), 1) || 5;
                    } else {
                      throw new Error("smfAutoloader requires secrets in the form of an object from a php file.");
                    }
                    return controls;
                },
                function (error) {
                    throw new Error(error + 'secrets.');
                });
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
                    return Promise.reject(Error('There are no more Instagram posts to retrieve.'));
                }
            }
            
            // send request for instagram posts
            return self.fetch(url, 'jsonp').then(
                function(response) {
                    
                    if (response.meta.code !== 200) throw new Error("Error from Instagram: " + response.meta.error_message);
                    
                    pagination.instagram = '';
                    if (response.pagination != null) {
                        pagination.instagram = response.pagination.next_url; // set nextURL
                        if (pagination.instagram == undefined) pagination.instagram = '';
                    }
                    
                    return response;
                },
                function (error) {
                    console.log(error + 'Instagram.');
                    return {};
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
            }}
            
            return instagramJSON;
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
                    return Promise.reject(Error('There are no more Facebook posts to retrieve.'));
                }
            }
            
            return self.fetch(url, 'jsonp').then(
                function (response) {
                    
                    if (response.error !== undefined) throw new Error("Error from Facebook: " + response.error.message);
                    
                    pagination.facebook = '';
                    if (response['posts'] !== undefined) {
                      pagination.facebook = response['posts']['paging']['next']; // set nextURL
                    }
                    
                    return response;
                },
                function (error) {
                    console.log(error + 'Facebook.');
                    return {};
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
            }}
            
            return facebookJSON;
        };
        /**/
        
        self.getPosts = function (callback, maxPosts, secretsUrl) {
            self.start(maxPosts, secretsUrl);
            return (function counter(num) {
                if (instagramDone && facebookDone) {
                    // close array
                    if (results[results.length - 1] == ',') {
                        results = results.substring(0, results.length - 1);
                    }
                    results += '}';
                    
                    // format results
                    var json = JSON.parse(results);
                    
                    console.log('AJAX finished.');
                    instagramDone = facebookDone = false;
                    
                    // send results back
                    callback(json);
                    return json;
                } else {
                    if (num > 0) {
                        console.log('AJAX still pending, trying again in 1 second...');
                        setTimeout(function () { counter(num - 1) }, 1000);
                    } else {
                        console.log('AJAX took too long to respond.');
                        return {};
                    }
                }
            })(10);
        };
        
        return self;
    })();
    
    window.smfAutoloader = smfAutoloader;
})(window);

